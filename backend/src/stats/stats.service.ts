import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class StatsService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_KEY || '');
  }

  async getSummary() {
    // 1. Récupérer tous les leads pour calculer les KPIs [cite: 103]
    const { data: leads } = await this.supabase.from('leads').select('*');
    
    const totalLeads = leads?.length || 0;
    const totalRevenue = leads?.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0) || 0;
    
    // 2. Calculer la répartition par statut pour le funnel [cite: 115, 124]
    const statusDistribution = {
      nouveau: leads?.filter(l => l.status === 'nouveau').length || 0,
      en_cours: leads?.filter(l => l.status === 'en cours').length || 0,
      converti: leads?.filter(l => l.status === 'converti').length || 0,
      perdu: leads?.filter(l => l.status === 'perdu').length || 0,
    };

    // Calcul du taux de conversion (Prospect -> Client) [cite: 124, 125]
    const conversionRate = totalLeads > 0 ? (statusDistribution.converti / totalLeads) * 100 : 0;

    return {
      totalLeads,
      totalRevenue,
      conversionRate: conversionRate.toFixed(1), // Formatage en pourcentage [cite: 124]
      statusDistribution
    };
  }
}