import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class LeadNotesService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_KEY || '');
  }

  async create(dto: { lead_id: string, content: string }) {
    const { data, error } = await this.supabase.from('lead_notes').insert([dto]).select();
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async findByLead(leadId: string) {
    const { data, error } = await this.supabase
      .from('lead_notes')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false });
    if (error) throw new InternalServerErrorException(error.message);
    return data || [];
  }

  async remove(id: string) {
  const { error } = await this.supabase
    .from('lead_notes')
    .delete()
    .eq('id', id);

  if (error) throw new InternalServerErrorException(error.message);
  return { message: 'Note supprimée avec succès' };
}
}