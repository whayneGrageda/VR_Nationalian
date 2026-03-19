import { SupabaseClient } from '@supabase/supabase-js';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User, CreateStudentDTO, UpdateStudentDTO, UpdateProfileDTO, ChangePasswordDTO } from '../../domain/entities/User';

export class UserRepository implements IUserRepository {
  constructor(private supabase: SupabaseClient) {}

  async login(username: string, password: string): Promise<User> {
    // Call the Supabase fn_login function which handles password hashing
    const { data, error } = await this.supabase.rpc('fn_login', {
      p_username: username,
      p_password: password,
      p_device_type: 'web'
    });

    if (error || !data) throw new Error('Invalid credentials');

    // Parse the JSON response from the function
    const result = typeof data === 'string' ? JSON.parse(data) : data;

    if (!result.success) {
      throw new Error(result.error || 'Invalid credentials');
    }

    return {
      userId: result.user_id,
      username: result.username,
      email: result.email,
      roleId: result.role_id,
      roleName: result.role_id === 1 ? 'student' : result.role_id === 2 ? 'professor' : 'admin',
      firstName: result.first_name,
      middleInitial: result.middle_initial,
      lastName: result.last_name,
      sectionId: result.section_id,
      sessionToken: result.token
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
    // Call fn_update_profile with password parameter
    const { data: result, error } = await this.supabase.rpc('fn_update_profile', {
      p_user_id: data.userId,
      p_password: data.newPassword
    });

    if (error) throw new Error(error.message);

    // Parse the JSON response
    const response = typeof result === 'string' ? JSON.parse(result) : result;
    
    if (!response.success) {
      throw new Error('Failed to change password');
    }

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
