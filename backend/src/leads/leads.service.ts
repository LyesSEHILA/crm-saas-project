import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { MailService } from '../mail/mail.service'; 

@Injectable()
export class LeadsService {
  private supabase: SupabaseClient;

  constructor(private mailService: MailService) { 
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
    const { data, error } = await this.supabase.from('leads').update(updateLeadDto).eq('id', id).select();
    if (error) throw new InternalServerErrorException(error.message);

    if (updateLeadDto?.status === 'converti' && data && data.length > 0) {
      const lead = data[0];
      await this.createAutoTask(lead);
      await this.createAutoInvoice(lead);
      
      // Log d'activité
      await this.supabase.from('activities').insert([{
        type: 'lead_converted',
        description: `Affaire convertie : ${lead.title} (${lead.amount} €)`
      }]);

      // Envoi de l'email automatique
      await this.sendConversionEmail(lead);
    }
    return data;
  }

  private async sendConversionEmail(lead: any) {
  const { data: contact } = await this.supabase
    .from('contacts')
    .select('email, first_name, last_name')
    .eq('id', lead.contact_id)
    .single();

  if (contact && contact.email) {
    try {
      // ON CHANGE L'APPEL ICI :
      await this.mailService.sendLeadConvertedEmail(
        contact.email, 
        `${contact.first_name} ${contact.last_name}`,
        lead.title // On passe le titre de l'affaire
      );

      await this.supabase.from('activities').insert([{
        type: 'email_sent',
        description: `Email de confirmation de projet envoyé à ${contact.email}`
      }]);
    } catch (mailError) {
      console.error("Erreur d'envoi mail:", mailError);
    }
  }
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

  private async createAutoInvoice(lead: any) {
    const invNumber = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);
    await this.supabase.from('invoices').insert([{
      lead_id: lead.id,
      contact_id: lead.contact_id,
      invoice_number: invNumber,
      amount: lead.amount,
      status: 'en attente',
      due_date: dueDate.toISOString()
    }]);
  }

  async remove(id: string) {
    const { error } = await this.supabase.from('leads').delete().eq('id', id);
    if (error) throw new InternalServerErrorException(error.message);
    return { message: 'Lead supprimé' };
  }

  async exportToCSV() {
    const { data: leads, error } = await this.supabase.from('leads').select('title, amount, status, created_at, contacts(first_name, last_name)');
    if (error) throw new InternalServerErrorException(error.message);
    const header = "Opportunité;Montant;Statut;Date;Contact\n";
    const rows = (leads || []).map(l => {
      const contact = Array.isArray(l.contacts) ? l.contacts[0] : l.contacts;
      const contactName = contact ? `${contact.first_name} ${contact.last_name}` : "N/A";
      return `${l.title};${l.amount};${l.status};${new Date(l.created_at).toLocaleDateString()};${contactName}`;
    }).join("\n");
    return header + rows;
  }
}