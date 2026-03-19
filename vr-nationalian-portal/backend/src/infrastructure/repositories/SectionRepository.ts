import { SupabaseClient } from '@supabase/supabase-js';
import { ISectionRepository } from '../../domain/repositories/ISectionRepository';
import { Section, CreateSectionDTO, UpdateSectionDTO } from '../../domain/entities/Section';

export class SectionRepository implements ISectionRepository {
  constructor(private supabase: SupabaseClient) {}

  async createSection(data: CreateSectionDTO): Promise<string> {
    const { data: result, error } = await this.supabase
      .from('tblsections')
      .insert({
        section_name: data.sectionName,
        professor_id: data.professorId
      })
      .select('section_id')
      .single();

    if (error) throw new Error(error.message);
    return result.section_id;
  }

  async getSectionsByProfessor(professorId: string): Promise<Section[]> {
    const { data, error } = await this.supabase
      .from('tblsections')
      .select('section_id, section_name, professor_id, created_at')
      .eq('professor_id', professorId)
      .eq('is_hidden', false)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    return data.map((section: any) => ({
      sectionId: section.section_id,
      sectionName: section.section_name,
      professorId: section.professor_id,
      createdAt: new Date(section.created_at)
    }));
  }

  async updateSection(data: UpdateSectionDTO): Promise<boolean> {
    const { error } = await this.supabase
      .from('tblsections')
      .update({
        section_name: data.sectionName,
        updated_at: new Date().toISOString()
      })
      .eq('section_id', data.sectionId);

    if (error) throw new Error(error.message);
    return true;
  }

  async deleteSection(sectionId: string): Promise<boolean> {
    // First, unassign students from this section
    await this.supabase
      .from('tblusers')
      .update({ section_id: null })
      .eq('section_id', sectionId);

    // Then delete the section
    const { error } = await this.supabase
      .from('tblsections')
      .delete()
      .eq('section_id', sectionId);

    if (error) throw new Error(error.message);
    return true;
  }

  async getCount(): Promise<number> {
    const { count, error } = await this.supabase
      .from('tblsections')
      .select('*', { count: 'exact', head: true });

    if (error) throw new Error(error.message);
    return count || 0;
  }

  async getAllSections(): Promise<Section[]> {
    const { data, error } = await this.supabase
      .from('tblsections')
      .select('section_id, section_name, professor_id, created_at')
      .eq('is_hidden', false)
      .order('section_name', { ascending: true });

    if (error) throw new Error(error.message);

    return data.map((section: any) => ({
      sectionId: section.section_id,
      sectionName: section.section_name,
      professorId: section.professor_id,
      createdAt: new Date(section.created_at)
    }));
  }
}
