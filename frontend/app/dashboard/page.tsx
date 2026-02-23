"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Users, Target, BarChart3 } from 'lucide-react';

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
    { title: "Total Leads", value: stats.totalLeads, icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
    { title: "Conversion", value: `${stats.conversionRate}%`, icon: Target, color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 max-w-7xl mx-auto"
    >
      <header className="mb-10">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Vue d'ensemble</h1>
        <p className="text-slate-500 mt-1">Analyse des performances commerciales en temps réel.</p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{card.title}</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{card.value}</p>
              </div>
              <div className={`${card.bg} ${card.color} p-3 rounded-xl`}>
                <card.icon size={24} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Funnel de Vente Stylisé */}
      <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <BarChart3 className="text-blue-600" />
          <h2 className="text-xl font-bold text-slate-800">Tunnel de Conversion</h2>
        </div>
        
        <div className="space-y-8">
          {Object.entries(stats.statusDistribution).map(([label, count]: any, index) => {
             const percentage = stats.totalLeads > 0 ? (count / stats.totalLeads) * 100 : 0;
             // On remplace les labels système par des labels propres
             const cleanLabel = label.replace('_', ' ').toUpperCase();
             
             return (
              <div key={label}>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-bold text-slate-700">{cleanLabel}</span>
                  <span className="text-sm font-medium text-slate-400">{count} opportunités</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full"
                  />
                </div>
              </div>
             );
          })}
        </div>
      </div>
    </motion.div>
  );
}