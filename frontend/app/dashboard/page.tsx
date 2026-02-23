"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Users, Target, BarChart3, Building2, Clock, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/stats`)
      .then(res => res.json())
      .then(data => setStats(data));
  }, []);

  if (!stats) return (
    <div className="flex items-center justify-center h-screen bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  const cards = [
    { title: "Chiffre d'Affaires", value: `${stats.totalRevenue} €`, icon: DollarSign, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Contacts", value: stats.totalContacts, icon: Users, color: "text-indigo-600", bg: "bg-indigo-50" },
    { title: "Entreprises", value: stats.totalCompanies, icon: Building2, color: "text-slate-600", bg: "bg-slate-100" },
    { title: "Taux Conversion", value: `${stats.conversionRate}%`, icon: Target, color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 max-w-7xl mx-auto space-y-10">
      <header>
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase">Dashboard</h1>
        <p className="text-slate-500 font-medium">Résumé de votre activité commerciale.</p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <motion.div key={i} whileHover={{ y: -5 }} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{card.title}</p>
              <p className="text-3xl font-black text-slate-900 mt-2">{card.value}</p>
            </div>
            <div className={`${card.bg} ${card.color} p-4 rounded-2xl`}>
              <card.icon size={24} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* GRAPHE D'ÉVOLUTION DU REVENU */}
      <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/40">
        <div className="flex items-center gap-3 mb-10">
          <TrendingUp className="text-blue-600" />
          <h2 className="text-xl font-black italic uppercase text-slate-800">Évolution du Chiffre d'Affaires</h2>
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
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 11, fontWeight: '900'}} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 11, fontWeight: '900'}} 
                tickFormatter={(value) => `${value}€`}
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '1.5rem', 
                  border: 'none', 
                  boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                  fontWeight: 'bold',
                  fontSize: '12px'
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="total" 
                stroke="#2563eb" 
                strokeWidth={4} 
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
                animationDuration={2000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Tunnel de Conversion */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <BarChart3 className="text-blue-600" />
            <h2 className="text-xl font-black italic uppercase text-slate-800">Tunnel de Ventes</h2>
          </div>
          <div className="space-y-6">
            {Object.entries(stats.statusDistribution).map(([label, count]: any, index) => {
               const percentage = stats.totalLeads > 0 ? (count / stats.totalLeads) * 100 : 0;
               return (
                <div key={label}>
                  <div className="flex justify-between mb-2">
                    <span className="text-xs font-black text-slate-500 uppercase tracking-tighter">{label.replace('_', ' ')}</span>
                    <span className="text-xs font-bold text-slate-900">{count}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${percentage}%` }} transition={{ duration: 1 }} className="bg-blue-600 h-full rounded-full" />
                  </div>
                </div>
               );
            })}
          </div>
        </div>

        {/* Tâches Urgentes */}
        <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl">
          <div className="flex items-center gap-3 mb-8">
            <Clock className="text-blue-400" />
            <h2 className="text-xl font-black italic uppercase">À Faire</h2>
          </div>
          <div className="space-y-4">
            {stats.upcomingTasks.length > 0 ? stats.upcomingTasks.map((task: any) => (
              <div key={task.id} className="p-4 bg-white/5 rounded-2xl border border-white/10 group hover:bg-white/10 transition-all">
                <p className="font-bold text-sm leading-tight">{task.title}</p>
                <div className="flex justify-between items-center mt-3">
                  <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">
                    {task.contacts ? `${task.contacts.first_name}` : '—'}
                  </span>
                  <span className="text-[9px] font-medium text-slate-500 italic">
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
    </motion.div>
  );
}