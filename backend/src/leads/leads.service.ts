import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';

@Injectable()
export class LeadsService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_KEY || '');
  }

  async create(createLeadDto: CreateLeadDto) {
    const { data, error } = await this.supabase.from('leads').insert([createLeadDto]).select();
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async findAll() {
    const { data, error } = await this.supabase.from('leads').select('*, contacts(first_name, last_name)');
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.supabase.from('leads').select('*, contacts(first_name, last_name)').eq('id', id).single();
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

async update(id: string, updateLeadDto: UpdateLeadDto) {
  // 1. On met à jour le lead
  const { data, error } = await this.supabase.from('leads').update(updateLeadDto).eq('id', id).select();
  if (error) throw new InternalServerErrorException(error.message);

  // 2. Si le statut passe à 'converti', on déclenche les automations
  if (updateLeadDto?.status === 'converti' && data && data.length > 0) {
    const lead = data[0];
    
    await this.createAutoTask(lead); // Ta fonction existante
    await this.createAutoInvoice(lead); // La fonction de facturation ajoutée précédemment
    
    // --- L'AJOUT CRUCIAL ICI ---
    await this.supabase.from('activities').insert([{
      type: 'lead_converted',
      description: `Affaire convertie : ${lead.title} (${lead.amount} €)`
    }]);
  }
  return data;
}

  private async createAutoTask(lead: any) {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 2);
    await this.supabase.from('tasks').insert([{
      title: `📄 Contrat & Facturation : ${lead.title}`,
      status: 'à faire',
      due_date: dueDate.toISOString(),
      contact_id: lead.contact_id
    }]);
  }

  // NOUVELLE MÉTHODE : Génération de facture automatique
  private async createAutoInvoice(lead: any) {
    const invNumber = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30); // Échéance à 30 jours

    const { error } = await this.supabase.from('invoices').insert([{
      lead_id: lead.id,
      contact_id: lead.contact_id,
      invoice_number: invNumber,
      amount: lead.amount,
      status: 'en attente',
      due_date: dueDate.toISOString()
    }]);

    if (error) console.error("Erreur Facture Auto:", error.message);
  }

  async remove(id: string) {
    const { error } = await this.supabase.from('leads').delete().eq('id', id);
    if (error) throw new InternalServerErrorException(error.message);
    return { message: 'Lead supprimé avec succès' };
  }

  async exportToCSV() {
    const { data: leads, error } = await this.supabase.from('leads').select('title, amount, status, created_at, contacts(first_name, last_name)');
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