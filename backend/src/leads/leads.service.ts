import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';

@Injectable()
export class LeadsService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_KEY || ''
    );
  }

  // CREATE : Ajouter un nouveau prospect
  async create(createLeadDto: CreateLeadDto) {
    const { data, error } = await this.supabase
      .from('leads')
      .insert([createLeadDto])
      .select();

    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  // READ ALL : Récupérer tous les leads (avec le nom du contact)
  async findAll() {
    const { data, error } = await this.supabase
      .from('leads')
      .select('*, contacts(first_name, last_name)');

    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  // READ ONE
  async findOne(id: string) {
    const { data, error } = await this.supabase
      .from('leads')
      .select('*, contacts(first_name, last_name)')
      .eq('id', id)
      .single();

    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  // UPDATE : Mettre à jour un lead (ex: changer son statut)
  async update(id: string, updateLeadDto: UpdateLeadDto) {
    const { data, error } = await this.supabase
      .from('leads')
      .update(updateLeadDto)
      .eq('id', id)
      .select();

    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  // DELETE
  async remove(id: string) {
    const { data, error } = await this.supabase
      .from('leads')
      .delete()
      .eq('id', id);

    if (error) throw new InternalServerErrorException(error.message);
    return { message: 'Lead supprimé avec succès' };
  }
}