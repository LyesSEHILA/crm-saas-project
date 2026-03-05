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

  // --- 1. Résumé pour le Dashboard Principal ---
  async getSummary() {
    try {
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
            return l.status === 'gagné' && d.getMonth() === month && d.getFullYear() === year;
          })
          .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

        revenueTrend.push({ name: monthLabel, total: revenueForMonth });
      }

      return {
        totalLeads: leads.length,
        totalRevenue: leads.filter(l => l.status === 'gagné').reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0),
        conversionRate: leads.length > 0 ? ((leads.filter(l => l.status === 'gagné').length / leads.length) * 100).toFixed(1) : "0",
        statusDistribution: {
          prospect: leads.filter(l => l.status === 'prospect').length,
          qualification: leads.filter(l => l.status === 'qualification').length,
          proposition: leads.filter(l => l.status === 'proposition').length,
          négociation: leads.filter(l => l.status === 'négociation').length,
          gagné: leads.filter(l => l.status === 'gagné').length,
          perdu: leads.filter(l => l.status === 'perdu').length,
        },
        totalContacts: contactsRes.count || 0,
        totalCompanies: companiesRes.count || 0,
        upcomingTasks: tasksRes.data || [],
        revenueTrend 
      };
    } catch (error) {
      console.error("Erreur StatsService:", error);
      throw new InternalServerErrorException("Impossible de charger le résumé.");
    }
  }

  // --- 2. Statistiques Clients Avancées (Demande du Prof) ---
  async getClientInsights() {
  try {
    // 1. On récupère tout ce dont on a besoin
    const { data: stats } = await this.supabase.from('client_value_stats').select('*');
    const { data: inv } = await this.supabase.from('invoices').select('*');
    const { data: leads } = await this.supabase.from('leads').select('amount, status');
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const { count: newClients } = await this.supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null)
      .gte('created_at', thirtyDaysAgo.toISOString());

    const safeStats = stats || [];
    const invoices = inv || [];
    const activeLeads = leads || [];

    // --- LOGIQUE FINANCIÈRE SÉCURISÉE ---
    // On utilise .toLowerCase() et .trim() pour être sûr de ne rien rater
    const paidInvoices = invoices.filter(i => i.status?.trim().toLowerCase() === 'payée');
    const unpaidInvoices = invoices.filter(i => i.status?.trim().toLowerCase() !== 'payée');

    // Calcul du délai moyen (en jours)
    const invoicesWithDates = paidInvoices.filter(i => i.paid_at && i.created_at);
    const avgDelay = invoicesWithDates.length > 0 
      ? invoicesWithDates.reduce((acc, curr) => {
      const diffInMs = new Date(curr.paid_at).getTime() - new Date(curr.created_at).getTime();
      const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
      // Si payé le jour même, on compte 0.5 jour pour ne pas avoir un 0 strict au round
      return acc + (diffInDays < 1 ? 0.5 : diffInDays);
    }, 0) / invoicesWithDates.length 
  : 0;

// On utilise Math.ceil pour arrondir au jour supérieur si c'est > 0
const finalDelay = avgDelay > 0 ? Math.ceil(avgDelay) : 0;

    // Prévisions : Somme des leads qui ne sont pas encore 'gagné' ou 'perdu'
    const forecast = activeLeads
      .filter(l => !['gagné', 'perdu'].includes(l.status?.trim().toLowerCase()))
      .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

    // DEBUG : Tu verras ça dans ton terminal de commande
    console.log(`Stats calculées : ${paidInvoices.length} payées, ${unpaidInvoices.length} en attente.`);

    return {
      summary: {
        totalBase: safeStats.length,
        newClients: newClients || 0,
        activeClients: safeStats.filter(s => s.total_orders > 0).length,
        ltvMoyenne: safeStats.length > 0 ? safeStats.reduce((acc, curr) => acc + (Number(curr.total_spent) || 0), 0) / safeStats.length : 0,
        panierMoyenGlobal: safeStats.filter(s => s.average_basket > 0).length > 0 
          ? safeStats.reduce((acc, curr) => acc + (Number(curr.average_basket) || 0), 0) / safeStats.filter(s => s.average_basket > 0).length 
          : 0
      },
      // --- OBJET FINANCE (attendu par le frontend) ---
      finance: {
        paidCount: paidInvoices.length,
        unpaidCount: unpaidInvoices.length,
        unpaidAmount: unpaidInvoices.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0),
        avgPaymentDelay: Math.round(avgDelay),
        revenueForecast: forecast,
        statusData: [
          { name: 'Payées', value: paidInvoices.length },
          { name: 'En attente', value: unpaidInvoices.length }
        ]
      },
      topClients: [...safeStats].sort((a, b) => b.total_spent - a.total_spent).slice(0, 5),
      segmentation: {
        byCity: this.groupBy(safeStats, 'city'),
        byIndustry: this.groupBy(safeStats, 'industry'),
        byAge: this.groupByAge(safeStats)
      }
    };
  } catch (error) {
    console.error("Erreur ClientInsights:", error);
    throw new InternalServerErrorException("Erreur lors de l'analyse.");
  }
}

  private groupBy(data: any[], key: string) {
    return data.reduce((acc, curr) => {
      const val = curr[key] || 'Inconnu';
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {});
  }

  private groupByAge(data: any[]) {
    const groups = { '18-25': 0, '26-45': 0, '46+': 0, 'Inconnu': 0 };
    data.forEach(d => {
      const age = d.age;
      if (!age) groups['Inconnu']++;
      else if (age <= 25) groups['18-25']++;
      else if (age <= 45) groups['26-45']++;
      else groups['46+']++;
    });
    return groups;
  }

  async getFinancialStats() {
  const { data: inv } = await this.supabase.from('invoices').select('*');
  const { data: leads } = await this.supabase.from('leads').select('amount, status');

  const invoices = inv || [];
  const activeLeads = leads || [];

  // 1. Calcul du délai moyen de paiement (en jours)
  const paidInvoices = invoices.filter(i => i.status === 'payée' && i.paid_at);
  const avgDelay = paidInvoices.length > 0 
    ? paidInvoices.reduce((acc, curr) => {
        const diff = new Date(curr.paid_at).getTime() - new Date(curr.created_at).getTime();
        return acc + (diff / (1000 * 60 * 60 * 24));
      }, 0) / paidInvoices.length 
    : 0;

  // 2. Prévisions de revenus (Weighted Pipeline)
  // On estime le CA futur en prenant le pipeline actuel (hors gagné/perdu)
  const forecast = activeLeads
    .filter(l => !['gagné', 'perdu'].includes(l.status))
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  return {
    invoicesCount: invoices.length,
    paidCount: invoices.filter(i => i.status === 'payée').length,
    unpaidCount: invoices.filter(i => i.status !== 'payée').length,
    unpaidAmount: invoices.filter(i => i.status !== 'payée').reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0),
    avgPaymentDelay: Math.round(avgDelay),
    revenueForecast: forecast,
    // Pour le graphique circulaire
    statusData: [
      { name: 'Payées', value: invoices.filter(i => i.status === 'payée').length },
      { name: 'En attente', value: invoices.filter(i => i.status !== 'payée').length }
    ]
  };
}

}