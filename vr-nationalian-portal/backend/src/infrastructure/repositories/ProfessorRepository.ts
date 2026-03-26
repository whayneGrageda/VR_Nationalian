import { SupabaseClient } from '@supabase/supabase-js';
import { IProfessorRepository } from '../../domain/repositories/IProfessorRepository';
import { Professor, CreateProfessorDTO, UpdateProfessorDTO } from '../../domain/entities/Professor';

export class ProfessorRepository implements IProfessorRepository {
  constructor(private supabase: SupabaseClient) {}

  async createProfessor(data: CreateProfessorDTO): Promise<string> {
    const { data: result, error } = await this.supabase
      .from('tblusers')
      .insert({
        username: data.username,
        password: data.password, // Will be hashed by trigger
        email: data.email,
        role_id: 2,
        first_name: data.firstName || null,
        middle_initial: data.middleInitial || null,
        last_name: data.lastName || null
      })
      .select('user_id')
      .single();

    if (error) throw new Error(error.message);
    return result.user_id;
  }

  async getAllProfessors(): Promise<Professor[]> {
    const { data, error } = await this.supabase
      .from('tblusers')
      .select('user_id, username, email, first_name, middle_initial, last_name, created_at')
      .eq('role_id', 2)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    return data.map((prof: any) => ({
      userId: prof.user_id,
      username: prof.username,
      email: prof.email,
      firstName: prof.first_name,
      middleInitial: prof.middle_initial,
      lastName: prof.last_name,
      createdAt: new Date(prof.created_at)
    }));
  }

  async updateProfessor(data: UpdateProfessorDTO): Promise<boolean> {
    const { error } = await this.supabase
      .from('tblusers')
      .update({
        username: data.username,
        first_name: data.firstName || null,
        middle_initial: data.middleInitial || null,
        last_name: data.lastName || null
      })
      .eq('user_id', data.userId)
      .eq('role_id', 2);

    if (error) throw new Error(error.message);
    return true;
  }

  async deleteProfessor(userId: string): Promise<boolean> {
    // First, unassign all sections from this professor
    const { error: sectionError } = await this.supabase
      .from('tblsections')
      .update({ professor_id: null })
      .eq('professor_id', userId);

    if (sectionError) throw new Error(sectionError.message);

    // Then delete the professor
    const { error } = await this.supabase
      .from('tblusers')
      .delete()
      .eq('user_id', userId)
      .eq('role_id', 2);

    if (error) throw new Error(error.message);
    return true;
  }

  async getCount(): Promise<number> {
    const { count, error } = await this.supabase
      .from('tblusers')
      .select('*', { count: 'exact', head: true })
      .eq('role_id', 2)
      .eq('is_active', true);

    if (error) throw new Error(error.message);
    return count || 0;
  }

  async getArchivedProfessors() {
    // Get archived professors
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
        scheduled_archive_date,
        created_at
      `)
      .eq('role_id', 2) // 2 is professor role
      .eq('is_active', false);

    if (usersError) throw new Error(usersError.message);
    if (!users || users.length === 0) return [];

    // Get role name
    const { data: roles, error: rolesError } = await this.supabase
      .from('tblroles')
      .select('role_id, role_name')
      .eq('role_id', 2)
      .single();

    const roleName = (!rolesError && roles) ? roles.role_name : 'professor';
    
    return users.map(user => ({
      userId: user.user_id,
      username: user.username,
      email: user.email,
      firstName: user.first_name,
      middleInitial: user.middle_initial,
      lastName: user.last_name,
      roleId: user.role_id,
      roleName: roleName,
      scheduledArchiveDate: user.scheduled_archive_date,
      createdAt: user.created_at
    }));
  }
}
