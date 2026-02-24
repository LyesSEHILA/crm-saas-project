import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SearchService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_KEY || '');
  }

  async globalSearch(query: string) {
    if (!query || query.length < 2) return { contacts: [], companies: [], leads: [] };

    const searchTerm = `%${query}%`;

    // On lance les 3 recherches en même temps pour la rapidité
    const [contacts, companies, leads] = await Promise.all([
      this.supabase.from('contacts').select('id, first_name, last_name, email').or(`first_name.ilike.${searchTerm},last_name.ilike.${searchTerm},email.ilike.${searchTerm}`).limit(5),
      this.supabase.from('companies').select('id, name').ilike('name', searchTerm).limit(5),
      this.supabase.from('leads').select('id, title, amount').ilike('title', searchTerm).limit(5)
    ]);

    return {
      contacts: contacts.data || [],
      companies: companies.data || [],
      leads: leads.data || []
    };
  }
}