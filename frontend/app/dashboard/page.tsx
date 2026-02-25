"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, Users, Target, BarChart3, Building2, 
  Clock, TrendingUp, Activity, Mail, CheckCircle 
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { supabase } from '@/lib/supabase';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    // Stats globales depuis ton API NestJS
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/stats`)
      .then(res => res.json())
      .then(data => setStats(data));
    
    // Flux d'activité en temps réel depuis Supabase
    fetchActivities();
  }, []);

  async function fetchActivities() {
    const { data } = await supabase
      .from('activities')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    setActivities(data || []);
  }

  if (!stats) return (
    <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-950">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  const cards = [
    { title: "Chiffre d'Affaires", value: `${stats.totalRevenue} €`, icon: DollarSign, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
    { title: "Contacts", value: stats.totalContacts, icon: Users, color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-900/20" },
    { title: "Entreprises", value: stats.totalCompanies, icon: Building2, color: "text-slate-600", bg: "bg-slate-100 dark:bg-slate-800" },
    { title: "Taux Conversion", value: `${stats.conversionRate}%`, icon: Target, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 max-w-7xl mx-auto space-y-10 transition-colors duration-300">
      <header>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase">Dashboard</h1>
        <p className="text-slate-50 dark:text-slate-400 font-medium">Résumé de votre activité commerciale.</p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <motion.div key={i} whileHover={{ y: -5 }} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{card.title}</p>
              <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">{card.value}</p>
            </div>
            <div className={`${card.bg} ${card.color} p-4 rounded-2xl`}>
              <card.icon size={24} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* GRAPHE D'ÉVOLUTION DU REVENU */}
      <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none">
        <div className="flex items-center gap-3 mb-10">
          <TrendingUp className="text-blue-600" />
          <h2 className="text-xl font-black italic uppercase text-slate-800 dark:text-white">Évolution du Chiffre d'Affaires</h2>
        </div>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.revenueTrend}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="opacity-10" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: '900'}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: '900'}} tickFormatter={(value) => `${value}€`} />
              <Tooltip contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold', fontSize: '12px', backgroundColor: '#1e293b', color: '#fff' }} />
              <Area type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" animationDuration={2000} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Tunnel de Conversion (2 colonnes) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <BarChart3 className="text-blue-600" />
            <h2 className="text-xl font-black italic uppercase text-slate-800 dark:text-white">Tunnel de Ventes</h2>
          </div>
          <div className="space-y-6">
            {Object.entries(stats.statusDistribution).map(([label, count]: any) => {
               const percentage = stats.totalLeads > 0 ? (count / stats.totalLeads) * 100 : 0;
               return (
                <div key={label}>
                  <div className="flex justify-between mb-2">
                    <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-tighter">{label.replace('_', ' ')}</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{count}</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${percentage}%` }} transition={{ duration: 1 }} className="bg-blue-600 h-full rounded-full" />
                  </div>
                </div>
               );
            })}
          </div>
        </div>

        {/* --- COLONNE DE DROITE (Activités + Tâches) --- */}
        <div className="space-y-8">
          
          {/* Flux d'Activité Amélioré */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Activity className="text-blue-600" size={20} />
              <h2 className="text-lg font-black italic uppercase text-slate-800 dark:text-white">Activités</h2>
            </div>
            <div className="space-y-5">
              {activities.length > 0 ? activities.map((act) => {
                // Style dynamique selon le type d'activité
                const isEmail = act.type === 'email_sent';
                const isLead = act.type === 'lead_converted';
                
                return (
                  <div key={act.id} className="flex gap-4 items-start relative pl-1 py-1 group">
                    <div className={`mt-1 p-2 rounded-lg shrink-0 transition-colors ${
                      isEmail ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : 
                      isLead ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 
                      'bg-slate-50 dark:bg-slate-800 text-slate-400'
                    }`}>
                      {isEmail ? <Mail size={14} /> : isLead ? <CheckCircle size={14} /> : <Activity size={14} />}
                    </div>
                    <div>
                      <p className="text-xs font-bold leading-tight text-slate-700 dark:text-slate-300">
                        {act.description}
                      </p>
                      <p className="text-[9px] font-black text-slate-400 uppercase mt-1 flex items-center gap-1">
                        <Clock size={10} />
                        {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              }) : (
                <p className="text-slate-400 text-xs italic text-center py-4">Aucune activité récente.</p>
              )}
            </div>
          </div>

          {/* Section À Faire (Sombre) */}
          <div className="bg-slate-900 dark:bg-black p-8 rounded-[2.5rem] text-white shadow-2xl transition-colors">
            <div className="flex items-center gap-3 mb-8">
              <Clock className="text-blue-400" />
              <h2 className="text-xl font-black italic uppercase">À Faire</h2>
            </div>
            <div className="space-y-4">
              {stats.upcomingTasks.length > 0 ? stats.upcomingTasks.map((task: any) => (
                <div key={task.id} className="p-4 bg-white/5 dark:bg-white/10 rounded-2xl border border-white/10 group hover:bg-white/10 transition-all">
                  <p className="font-bold text-sm leading-tight">{task.title}</p>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">
                      {task.contacts ? `${task.contacts.first_name}` : '—'}
                    </span>
                    <span className="text-[9px] font-medium text-slate-500 dark:text-slate-400 italic">
                      {new Date(task.due_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )) : (
                <p className="text-slate-500 text-sm italic">Aucune tâche urgente.</p>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </motion.div>
  );
}