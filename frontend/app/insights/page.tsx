"use client";

import React, { useEffect, useState } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, 
  XAxis, YAxis, Tooltip, Legend, CartesianGrid 
} from 'recharts';
import { 
  Users, TrendingUp, MapPin, Briefcase, 
  Award, Target, DollarSign, Clock, PieChart as PieIcon 
} from 'lucide-react';

const COLORS = ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#16a34a', '#ca8a04'];

export default function InsightsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/stats/insights`)
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => console.error("Erreur insights:", err));
  }, []);

  if (loading || !data) return <div className="p-10 font-black uppercase italic text-slate-400">Chargement de l'analyse...</div>;

  // Préparation des données pour les graphiques
  const cityData = Object.entries(data.segmentation.byCity).map(([name, value]) => ({ name, value }));
  const industryData = Object.entries(data.segmentation.byIndustry).map(([name, value]) => ({ name, value }));
  
  // Données financières pour le camembert
  const financeStatusData = data.finance?.statusData || [];

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-12 animate-fade-in">
      <header className="flex items-center gap-4 mb-10">
        <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg shadow-indigo-500/30">
          <TrendingUp size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white italic uppercase tracking-tighter">INSIGHTS <span className="text-indigo-600">CLIENTS & FINANCE</span></h1>
          <p className="text-slate-500 font-medium italic">Analyse de segmentation et performance financière.</p>
        </div>
      </header>

      {/* --- SECTION 1 : KPIs VALEUR CLIENT --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Base Totale", value: data.summary.totalBase, icon: Users, color: "text-blue-600" },
          { label: "Clients Actifs", value: data.summary.activeClients, icon: Target, color: "text-emerald-600" },
          { label: "Panier Moyen", value: `${data.summary.panierMoyenGlobal.toFixed(0)} €`, icon: Award, color: "text-amber-600" },
          { label: "LTV Moyenne", value: `${data.summary.ltvMoyenne.toFixed(0)} €`, icon: TrendingUp, color: "text-indigo-600" },
        ].map((kpi, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none transition-transform hover:scale-105">
            <kpi.icon size={20} className={`${kpi.color} mb-3`} />
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{kpi.label}</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* --- SECTION 2 : ANALYSE FINANCIÈRE (NOUVEAU) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Carte Prévisions & Délais */}
        <div className="bg-slate-900 dark:bg-blue-600 p-8 rounded-[3rem] text-white shadow-2xl flex flex-col justify-between overflow-hidden relative group">
          <div className="absolute -right-10 -top-10 text-white/5 group-hover:text-white/10 transition-colors">
             <DollarSign size={200} />
          </div>
          <div className="relative z-10">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-8 flex items-center gap-2">
              <Clock size={14}/> Santé du Cash-flow
            </h3>
            <div className="space-y-8">
              <div>
                <p className="text-5xl font-black italic tracking-tighter">
                  {data.finance?.avgPaymentDelay || 0} <span className="text-xl">Jours</span>
                </p>
                <p className="text-[10px] font-bold uppercase opacity-60 mt-1">Délai moyen de paiement</p>
              </div>
              <div className="pt-8 border-t border-white/10">
                <p className="text-4xl font-black italic tracking-tighter text-blue-400 dark:text-blue-100">
                  {data.finance?.revenueForecast?.toLocaleString() || 0} €
                </p>
                <p className="text-[10px] font-bold uppercase opacity-60 mt-1">Prévisions (Pipeline en cours)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Graphique Recouvrement */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl">
          <div className="flex justify-between items-start mb-8">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <PieIcon size={16}/> Statut des Factures
            </h3>
            <div className="text-right">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">À percevoir</p>
                <p className="text-2xl font-black text-orange-600">{data.finance?.unpaidAmount?.toLocaleString() || 0} €</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-4">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={financeStatusData} innerRadius={60} outerRadius={80} dataKey="value" stroke="none">
                    <Cell fill="#10b981" /> {/* Payé */}
                    <Cell fill="#f97316" /> {/* Unpaid */}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
               <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800">
                  <p className="text-[9px] font-black uppercase text-emerald-600 tracking-widest">Factures Payées</p>
                  <p className="text-xl font-black text-emerald-700 dark:text-emerald-400">{data.finance?.paidCount || 0}</p>
               </div>
               <div className="p-4 rounded-2xl bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-800">
                  <p className="text-[9px] font-black uppercase text-orange-600 tracking-widest">Factures en attente</p>
                  <p className="text-xl font-black text-orange-700 dark:text-orange-400">{data.finance?.unpaidCount || 0}</p>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- SECTION 3 : SEGMENTATION GÉOGRAPHIQUE & MÉTIER --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-8 flex items-center gap-2">
            <MapPin size={16}/> Segmentation par Ville
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={cityData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {cityData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-8 flex items-center gap-2">
            <Briefcase size={16}/> Secteurs d'Activité
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={industryData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} />
                <Tooltip cursor={{fill: '#f8fafc'}} />
                <Bar dataKey="value" fill="#2563eb" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* --- SECTION 4 : TOP CLIENTS --- */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-8 flex items-center gap-2">
          <Award size={16}/> Clients les plus rentables (Top 5 LTV)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-50 dark:border-slate-800">
                <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Client</th>
                <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Ville</th>
                <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Commandes</th>
                <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">LTV Totale</th>
              </tr>
            </thead>
            <tbody>
              {data.topClients.map((client: any, i: number) => (
                <tr key={i} className="group border-b border-slate-50 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-6 font-bold text-slate-900 dark:text-white">{client.full_name}</td>
                  <td className="py-6 text-sm text-slate-500 font-medium italic">{client.city || 'Non renseignée'}</td>
                  <td className="py-6 text-sm font-black text-indigo-600">{client.total_orders}</td>
                  <td className="py-6 text-right font-black text-slate-900 dark:text-white">{Number(client.total_spent).toLocaleString()} €</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}