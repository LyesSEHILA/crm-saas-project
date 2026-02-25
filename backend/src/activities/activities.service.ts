import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class ActivitiesService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_KEY || '',
    );
  }

  // Correspond à la méthode "create" attendue par le contrôleur
  async create(createActivityDto: any) {
    const { data, error } = await this.supabase
      .from('activities')
      .insert([createActivityDto])
      .select();
    
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  // Pour le flux d'activité du Dashboard
  async findAll() {
    const { data, error } = await this.supabase
      .from('activities')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.supabase
      .from('activities')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async update(id: string, updateActivityDto: any) {
    const { data, error } = await this.supabase
      .from('activities')
      .update(updateActivityDto)
      .eq('id', id)
      .select();

    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async remove(id: string) {
    const { error } = await this.supabase
      .from('activities')
      .delete()
      .eq('id', id);

    if (error) throw new InternalServerErrorException(error.message);
    return { message: 'Activité supprimée' };
  }

  // On garde notre méthode utilitaire pour les automations
  async log(type: string, description: string) {
    await this.supabase.from('activities').insert([{ type, description }]);
  }
}