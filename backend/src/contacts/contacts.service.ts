import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class ContactsService {
  private supabase: SupabaseClient;
  private readonly logger = new Logger(ContactsService.name);

  constructor(private readonly mailService: MailService) { 
    this.supabase = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_KEY || ''
    );
  }

  async create(createContactDto: CreateContactDto) {
  const { data, error } = await this.supabase
    .from('contacts')
    .insert([createContactDto])
    .select();

  if (error) throw new InternalServerErrorException(error.message);

  if (data && data.length > 0) {
    const newContact = data[0];
    this.mailService.sendWelcomeEmail(
      newContact.email, 
      `${newContact.first_name} ${newContact.last_name}`
    ).catch(err => console.error("Email non envoyé :", err));
  }

  return data;
}

  async findAll() {
    try {
      const { data, error } = await this.supabase
        .from('contacts')
        .select(`
          *,
          companies (
            name
          )
        `);

      if (error) {
        this.logger.error("Erreur Supabase findAll:", error.message);
        throw new InternalServerErrorException(error.message);
      }

      return data || []; // Toujours renvoyer un tableau
    } catch (err) {
      this.logger.error("Exception dans findAll:", err);
      return []; // Sécurité pour le frontend
    }
  }

  async findOne(id: string) {
    const { data, error } = await this.supabase
      .from('contacts')
      .select('*, companies(name)')
      .eq('id', id)
      .single();

    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async update(id: string, updateContactDto: UpdateContactDto) {
    const { data, error } = await this.supabase
      .from('contacts')
      .update(updateContactDto)
      .eq('id', id)
      .select();

    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async remove(id: string) {
    const { error } = await this.supabase
      .from('contacts')
      .delete()
      .eq('id', id);

    if (error) throw new InternalServerErrorException(error.message);
    return { message: 'Contact supprimé avec succès' };
  }
}