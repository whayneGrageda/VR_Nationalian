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
        password: data.password,
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
      .eq('role_id', 2);

    if (error) throw new Error(error.message);
    return count || 0;
  }
}
