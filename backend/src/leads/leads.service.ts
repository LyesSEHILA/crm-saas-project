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

  async create(createLeadDto: CreateLeadDto) {
    const { data, error } = await this.supabase
      .from('leads')
      .insert([createLeadDto])
      .select();

    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async findAll() {
    const { data, error } = await this.supabase
      .from('leads')
      .select('*, contacts(first_name, last_name)');

    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.supabase
      .from('leads')
      .select('*, contacts(first_name, last_name)')
      .eq('id', id)
      .single();

    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async update(id: string, updateLeadDto: UpdateLeadDto) {
    const { data, error } = await this.supabase
      .from('leads')
      .update(updateLeadDto)
      .eq('id', id)
      .select();

    if (error) throw new InternalServerErrorException(error.message);

    // Automation : déclenchée si le statut passe à 'converti'
    if (updateLeadDto?.status === 'converti' && data && data.length > 0) {
      await this.createAutoTask(data[0]);
    }

    return data;
  }

  private async createAutoTask(lead: any) {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 2);

    const { error } = await this.supabase.from('tasks').insert([{
      title: `📄 Contrat & Facturation : ${lead.title}`,
      status: 'à faire',
      due_date: dueDate.toISOString(),
      contact_id: lead.contact_id
    }]);

    if (error) {
      console.error("Erreur Task Auto:", error.message);
    }
  }

  async remove(id: string) {
    const { error } = await this.supabase
      .from('leads')
      .delete()
      .eq('id', id);

    if (error) throw new InternalServerErrorException(error.message);
    return { message: 'Lead supprimé avec succès' };
  }

  async exportToCSV() {
    const { data: leads, error } = await this.supabase
      .from('leads')
      .select('title, amount, status, created_at, contacts(first_name, last_name)');

    if (error) throw new InternalServerErrorException(error.message);

    const header = "Opportunité;Montant;Statut;Date;Contact\n";
    
    const rows = (leads || []).map(l => {
      const contact = Array.isArray(l.contacts) ? l.contacts[0] : l.contacts;
      const contactName = contact ? `${contact.first_name} ${contact.last_name}` : "N/A";
      const date = new Date(l.created_at).toLocaleDateString();
      return `${l.title};${l.amount};${l.status};${date};${contactName}`;
    }).join("\n");

    return header + rows;
  }
}