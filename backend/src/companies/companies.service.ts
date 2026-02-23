import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_KEY || '');
  }

  async create(dto: CreateCompanyDto) {
    const { data, error } = await this.supabase.from('companies').insert([dto]).select();
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async findAll() {
    const { data, error } = await this.supabase.from('companies').select('*');
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async remove(id: string) {
    const { error } = await this.supabase.from('companies').delete().eq('id', id);
    if (error) throw new InternalServerErrorException(error.message);
    return { message: 'Entreprise supprimée' };
  }

  async update(id: string, dto: UpdateCompanyDto) {
    const { data, error } = await this.supabase
      .from('companies')
      .update(dto)
      .eq('id', id)
      .select();

    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

}