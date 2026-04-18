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

    // In database (1).md, the success response doesn't have a 'success' field
    // But error responses explicitly have 'success: false' and use 'message' for errors
    if (result.success === false) {
      throw new Error(result.message || 'Invalid credentials');
    }

    // Double check that we actually have user data
    if (!result.user_id && !result.token) {
      throw new Error('Invalid credentials');
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
        password: data.password, // Will be hashed by trigger
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
      .eq('is_active', true)
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
      .eq('role_id', 1)
      .eq('is_active', true);

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
      .eq('section_id', sectionId)
      .eq('is_active', true);

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
    
    if (response.success === false) {
      throw new Error(response.message || 'Failed to change password');
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
      .eq('is_active', true)
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

  async deactivateSession(sessionToken: string): Promise<void> {
    const { error } = await this.supabase
      .from('tblsessions')
      .update({ is_active: false })
      .eq('token', sessionToken);

    if (error) throw new Error(error.message);
  }

  async getStudentsByProfessor(professorId: string): Promise<User[]> {
    // Get all sections for this professor
    const { data: sections, error: sectionsError } = await this.supabase
      .from('tblsections')
      .select('section_id')
      .eq('professor_id', professorId);

    if (sectionsError) throw new Error(sectionsError.message);
    if (!sections || sections.length === 0) return [];

    const sectionIds = sections.map(s => s.section_id);

    // Get all students in those sections
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
      .eq('is_active', true)
      .in('section_id', sectionIds)
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
      sectionId: student.section_id,
      sectionName: student.tblsections?.section_name
    }));
  }

  async getArchivedUsers(roleId: number) {
    // First get the users
    const { data: users, error: usersError } = await this.supabase
      .from('tblusers')
      .select(`
        user_id,
        username,
        email,
        first_name,
        middle_initial,
        last_name,
        role_id,
        section_id,
        scheduled_archive_date,
        created_at
      `)
      .eq('role_id', roleId)
      .eq('is_active', false);

    if (usersError) throw new Error(usersError.message);
    if (!users || users.length === 0) return [];

    // Get role names
    const { data: roles, error: rolesError } = await this.supabase
      .from('tblroles')
      .select('role_id, role_name');

    if (rolesError) throw new Error(rolesError.message);

    // Get section names for users with section_id
    const sectionIds = users
      .filter(u => u.section_id)
      .map(u => u.section_id);

    let sections: any[] = [];
    if (sectionIds.length > 0) {
      const { data: sectionsData, error: sectionsError } = await this.supabase
        .from('tblsections')
        .select('section_id, section_name')
        .in('section_id', sectionIds);

      if (!sectionsError && sectionsData) {
        sections = sectionsData;
      }
    }

    // Map the data
    const roleMap = new Map(roles?.map(r => [r.role_id, r.role_name]) || []);
    const sectionMap = new Map(sections.map(s => [s.section_id, s.section_name]));

    return users.map(user => ({
      userId: user.user_id,
      username: user.username,
      email: user.email,
      firstName: user.first_name,
      middleInitial: user.middle_initial,
      lastName: user.last_name,
      roleId: user.role_id,
      roleName: roleMap.get(user.role_id) || 'unknown',
      sectionId: user.section_id,
      sectionName: user.section_id ? sectionMap.get(user.section_id) : undefined,
      scheduledArchiveDate: user.scheduled_archive_date,
      createdAt: user.created_at
    }));
  }

  async getArchivedStudentsByProfessor(professorId: string) {
    // Get all sections for this professor
    const { data: sections, error: sectionsError } = await this.supabase
      .from('tblsections')
      .select('section_id')
      .eq('professor_id', professorId);

    if (sectionsError) throw new Error(sectionsError.message);
    if (!sections || sections.length === 0) return [];

    const sectionIds = sections.map(s => s.section_id);

    // Get archived students in those sections
    const { data: users, error: usersError } = await this.supabase
      .from('tblusers')
      .select(`
        user_id,
        username,
        email,
        first_name,
        middle_initial,
        last_name,
        role_id,
        section_id,
        scheduled_archive_date,
        created_at
      `)
      .eq('role_id', 1)
      .eq('is_active', false)
      .in('section_id', sectionIds);

    if (usersError) throw new Error(usersError.message);
    if (!users || users.length === 0) return [];

    // Get section names
    const { data: sectionsData, error: sectionsDataError } = await this.supabase
      .from('tblsections')
      .select('section_id, section_name')
      .in('section_id', sectionIds);

    const sectionMap = new Map(
      (!sectionsDataError && sectionsData) 
        ? sectionsData.map(s => [s.section_id, s.section_name])
        : []
    );

    return users.map(user => ({
      userId: user.user_id,
      username: user.username,
      email: user.email,
      firstName: user.first_name,
      middleInitial: user.middle_initial,
      lastName: user.last_name,
      roleId: user.role_id,
      roleName: 'student',
      sectionId: user.section_id,
      sectionName: user.section_id ? sectionMap.get(user.section_id) : undefined,
      scheduledArchiveDate: user.scheduled_archive_date,
      createdAt: user.created_at
    }));
  }

  async archiveUser(userId: string) {
    const { error } = await this.supabase
      .from('tblusers')
      .update({ is_active: false })
      .eq('user_id', userId);

    if (error) throw new Error(error.message);
    return true;
  }

  async reactivateUser(userId: string) {
    const { error } = await this.supabase
      .from('tblusers')
      .update({ is_active: true, scheduled_archive_date: null })
      .eq('user_id', userId);

    if (error) throw new Error(error.message);
    return true;
  }

  async scheduleArchive(userId: string, scheduledArchiveDate: string) {
    const { error } = await this.supabase
      .from('tblusers')
      .update({ scheduled_archive_date: scheduledArchiveDate })
      .eq('user_id', userId);

    if (error) throw new Error(error.message);
    return true;
  }
}
