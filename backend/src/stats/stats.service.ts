import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class StatsService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL || '', 
      process.env.SUPABASE_KEY || ''
    );
  }

  async getSummary() {
    try {
      // 1. On lance les requêtes
      const [leadsRes, contactsRes, companiesRes, tasksRes] = await Promise.all([
        this.supabase.from('leads').select('*'),
        this.supabase.from('contacts').select('*', { count: 'exact', head: true }),
        this.supabase.from('companies').select('*', { count: 'exact', head: true }),
        this.supabase.from('tasks')
          .select('*, contacts(first_name, last_name)')
          .eq('status', 'à faire')
          .order('due_date', { ascending: true })
          .limit(5)
      ]);

      const leads = leadsRes.data || [];

      // --- LE FIX EST ICI ---
      // On précise le type : un tableau d'objets avec name (string) et total (number)
      const revenueTrend: { name: string; total: number }[] = []; 
      
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthLabel = date.toLocaleString('default', { month: 'short' });
        const month = date.getMonth();
        const year = date.getFullYear();

        const revenueForMonth = leads
          .filter(l => {
            const d = new Date(l.created_at);
            return l.status === 'converti' && d.getMonth() === month && d.getFullYear() === year;
          })
          .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

        // Maintenant TypeScript accepte le push sans broncher
        revenueTrend.push({ name: monthLabel, total: revenueForMonth });
      }

      return {
        totalLeads: leads.length,
        totalRevenue: leads.filter(l => l.status === 'converti').reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0),
        conversionRate: leads.length > 0 ? ((leads.filter(l => l.status === 'converti').length / leads.length) * 100).toFixed(1) : "0",
        statusDistribution: {
          nouveau: leads.filter(l => l.status === 'nouveau').length,
          en_cours: leads.filter(l => l.status === 'en cours').length,
          converti: leads.filter(l => l.status === 'converti').length,
          perdu: leads.filter(l => l.status === 'perdu').length,
        },
        totalContacts: contactsRes.count || 0,
        totalCompanies: companiesRes.count || 0,
        upcomingTasks: tasksRes.data || [],
        revenueTrend 
      };

    } catch (error) {
      console.error("Erreur StatsService:", error);
      throw new InternalServerErrorException("Impossible de charger les statistiques.");
    }
  }
}