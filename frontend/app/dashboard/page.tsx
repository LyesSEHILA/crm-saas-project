"use client";
import React, { useState, useEffect } from 'react';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch('http://localhost:3000/stats')
      .then(res => res.json())
      .then(data => setStats(data));
  }, []);

  if (!stats) return <div className="p-8">Chargement du dashboard...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Tableau de bord intelligent</h1> 

        {/* 1. Ligne des KPIs [cite: 105, 109] */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <p className="text-sm font-medium text-slate-500 uppercase">Chiffre d'Affaires Total</p> [cite: 110]
            <p className="text-3xl font-bold text-blue-600 mt-2">{stats.totalRevenue} €</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <p className="text-sm font-medium text-slate-500 uppercase">Total Leads</p> [cite: 116, 161]
            <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalLeads}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <p className="text-sm font-medium text-slate-500 uppercase">Taux de Conversion</p> [cite: 124]
            <p className="text-3xl font-bold text-emerald-600 mt-2">{stats.conversionRate}%</p>
          </div>
        </div>

        {/* 2. Visualisation du Pipeline (Funnel de vente) [cite: 92, 115] */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Pipeline et funnel de conversion</h2> [cite: 92]
          <div className="space-y-6">
            {Object.entries(stats.statusDistribution).map(([label, count]: any) => {
               // Calcul de la largeur de la barre en pourcentage
               const percentage = stats.totalLeads > 0 ? (count / stats.totalLeads) * 100 : 0;
               return (
                <div key={label}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-semibold capitalize text-slate-700">{label}</span>
                    <span className="text-sm text-slate-500">{count} opportunités</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-4">
                    <div 
                      className="bg-blue-500 h-4 rounded-full transition-all duration-1000" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
               );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}