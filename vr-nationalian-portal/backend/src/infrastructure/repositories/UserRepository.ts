import { SupabaseClient } from '@supabase/supabase-js';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User, CreateStudentDTO, UpdateStudentDTO, UpdateProfileDTO, ChangePasswordDTO } from '../../domain/entities/User';

export class UserRepository implements IUserRepository {
  constructor(private supabase: SupabaseClient) {}

  async login(username: string, password: string): Promise<User> {
    // First, authenticate the user
    const { data: userData, error: userError } = await this.supabase
      .from('tblusers')
      .select(`
        user_id,
        username,
        email,
        role_id,
        first_name,
        middle_initial,
        last_name,
        section_id,
        tblroles!inner(role_name)
      `)
      .eq('username', username)
      .eq('password', password)
      .single();

    if (userError || !userData) throw new Error('Invalid credentials');

    // Generate a session token
    const token = this.generateToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour expiry

    // Store the session in tblsessions
    const { error: sessionError } = await this.supabase
      .from('tblsessions')
      .insert({
        user_id: userData.user_id,
        token: token,
        device_type: 'web',
        expires_at: expiresAt.toISOString()
      });

    if (sessionError) {
      console.error('Session creation error:', sessionError);
    }

    return {
      userId: userData.user_id,
      username: userData.username,
      email: userData.email,
      roleId: userData.role_id,
      roleName: (userData.tblroles as any).role_name,
      firstName: userData.first_name,
      middleInitial: userData.middle_initial,
      lastName: userData.last_name,
      sectionId: userData.section_id,
      sessionToken: token
    };
  }

  private generateToken(): string {
    return Array.from({ length: 32 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  }

  async createStudent(data: CreateStudentDTO): Promise<string> {
    const { data: result, error } = await this.supabase
      .from('tblusers')
      .insert({
        username: data.username,
        password: data.password,
        email: data.email,
        role_id: 1,
        first_name: data.firstName,
        middle_initial: data.middleInitial || null,
        last_name: data.lastName,
        section_id: data.sectionId
      })
      .select('user_id')
      .single();

    if (error) throw new Error(error.message);
    return result.user_id;
  }

  async getStudentsBySection(sectionId: string): Promise<User[]> {
    const { data, error } = await this.supabase
      .from('tblusers')
      .select('user_id, username, email, first_name, middle_initial, last_name, created_at')
      .eq('role_id', 1)
      .eq('section_id', sectionId)
      .order('last_name', { ascending: true });

    if (error) throw new Error(error.message);

    return data.map((student: any) => ({
      userId: student.user_id,
      username: student.username,
      email: student.email,
      roleId: 1,
      roleName: 'student',
      firstName: student.first_name,
      middleInitial: student.middle_initial,
      lastName: student.last_name,
      sectionId: sectionId
    }));
  }

  async updateStudent(data: UpdateStudentDTO): Promise<boolean> {
    const { error } = await this.supabase
      .from('tblusers')
      .update({
        username: data.username,
        first_name: data.firstName,
        middle_initial: data.middleInitial || null,
        last_name: data.lastName,
        section_id: data.sectionId
      })
      .eq('user_id', data.userId)
      .eq('role_id', 1);

    if (error) throw new Error(error.message);
    return true;
  }

  async deleteStudent(userId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('tblusers')
      .delete()
      .eq('user_id', userId)
      .eq('role_id', 1);

    if (error) throw new Error(error.message);
    return true;
  }

  async getStudentCount(): Promise<number> {
    const { count, error } = await this.supabase
      .from('tblusers')
      .select('*', { count: 'exact', head: true })
      .eq('role_id', 1);

    if (error) throw new Error(error.message);
    return count || 0;
  }

  async getActiveSessionCount(): Promise<number> {
    const now = new Date().toISOString();
    const { count, error } = await this.supabase
      .from('tblsessions')
      .select('*', { count: 'exact', head: true })
      .gt('expires_at', now);

    if (error) throw new Error(error.message);
    return count || 0;
  }

  async getActiveStudentCountBySection(sectionId: string): Promise<number> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get students in this section
    const { data: students, error: studentsError } = await this.supabase
      .from('tblusers')
      .select('user_id')
      .eq('role_id', 1)
      .eq('section_id', sectionId);

    if (studentsError || !students) return 0;

    const studentIds = students.map(s => s.user_id);
    if (studentIds.length === 0) return 0;

    // Count how many have sessions in the last 7 days
    const { count, error } = await this.supabase
      .from('tblsessions')
      .select('user_id', { count: 'exact', head: true })
      .in('user_id', studentIds)
      .gte('created_at', sevenDaysAgo.toISOString());

    if (error) return 0;
    return count || 0;
  }

  async updateProfile(data: UpdateProfileDTO): Promise<boolean> {
    const { error } = await this.supabase
      .from('tblusers')
      .update({
        first_name: data.firstName,
        middle_initial: data.middleInitial || null,
        last_name: data.lastName
      })
      .eq('user_id', data.userId);

    if (error) throw new Error(error.message);
    return true;
  }

  async changePassword(data: ChangePasswordDTO): Promise<boolean> {
    // First verify the current password
    const { data: user, error: verifyError } = await this.supabase
      .from('tblusers')
      .select('user_id')
      .eq('user_id', data.userId)
      .eq('password', data.currentPassword)
      .single();

    if (verifyError || !user) throw new Error('Current password is incorrect');

    // Update to new password
    const { error: updateError } = await this.supabase
      .from('tblusers')
      .update({ password: data.newPassword })
      .eq('user_id', data.userId);

    if (updateError) throw new Error(updateError.message);
    return true;
  }

  async getAllStudents(): Promise<User[]> {
    const { data, error } = await this.supabase
      .from('tblusers')
      .select(`
        user_id,
        username,
        email,
        first_name,
        middle_initial,
        last_name,
        section_id,
        created_at,
        tblsections!tblusers_section_id_fkey(section_name)
      `)
      .eq('role_id', 1)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    return data.map((student: any) => ({
      userId: student.user_id,
      username: student.username,
      email: student.email,
      roleId: 1,
      roleName: 'student',
      firstName: student.first_name,
      middleInitial: student.middle_initial,
      lastName: student.last_name,
      sectionId: student.section_id,
      sectionName: student.tblsections?.section_name
    }));
  }
}
