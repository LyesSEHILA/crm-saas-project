import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { MailService } from '../mail/mail.service'; // <-- Importe le MailService

@Injectable()
export class ContactsService {
  private supabase: SupabaseClient;

  // <-- Injecte le MailService dans le constructeur
  constructor(private readonly mailService: MailService) { 
    this.supabase = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_KEY || ''
    );
  }

  // C : CREATE (Créer un contact)
  async create(createContactDto: CreateContactDto) {
    const { data, error } = await this.supabase
      .from('contacts')
      .insert([createContactDto])
      .select();

    if (error) throw new InternalServerErrorException(error.message);

    // 🔥 LA MAGIE OPÈRE ICI : Envoi de l'email en tâche de fond
    if (data && data.length > 0) {
      const newContact = data[0];
      // On déclenche l'email sans faire attendre la réponse HTTP
      this.mailService.sendWelcomeEmail(
        newContact.email, 
        `${newContact.first_name} ${newContact.last_name}`
      );
    }

    return data;
  }

  // R : READ ALL (Lire tous les contacts)
  async findAll() {
    const { data, error } = await this.supabase
      .from('contacts')
      .select('*');

    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  // R : READ ONE (Lire un seul contact)
  async findOne(id: string) {
    const { data, error } = await this.supabase
      .from('contacts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  // U : UPDATE (Mettre à jour un contact)
  async update(id: string, updateContactDto: UpdateContactDto) {
    const { data, error } = await this.supabase
      .from('contacts')
      .update(updateContactDto)
      .eq('id', id)
      .select();

    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  // D : DELETE (Supprimer un contact)
  async remove(id: string) {
    const { data, error } = await this.supabase
      .from('contacts')
      .delete()
      .eq('id', id);

    if (error) throw new InternalServerErrorException(error.message);
    return { message: 'Contact supprimé avec succès' };
  }
}