import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class TasksService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_KEY || '');
  }

  async create(dto: any) {
    const { data, error } = await this.supabase.from('tasks').insert([dto]).select();
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async findAll() {
    const { data, error } = await this.supabase
      .from('tasks')
      .select('*, contacts(first_name, last_name)') // Jointure avec le contact
      .order('due_date', { ascending: true });

    if (error) throw new InternalServerErrorException(error.message);
    return data || [];
  }

  async update(id: string, dto: any) {
    const { data, error } = await this.supabase.from('tasks').update(dto).eq('id', id).select();
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async remove(id: string) {
    const { error } = await this.supabase.from('tasks').delete().eq('id', id);
    if (error) throw new InternalServerErrorException(error.message);
    return { message: 'Tâche supprimée' };
  }
}