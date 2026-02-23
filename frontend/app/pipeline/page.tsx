"use client";

import React, { useState, useEffect } from 'react';

const COLUMNS = ['nouveau', 'en cours', 'converti', 'perdu'];

export default function PipelinePage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]); // Pour la liste déroulante
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    status: 'nouveau',
    contact_id: ''
  });

  // Chargement des données au démarrage
  useEffect(() => {
    fetchLeads();
    fetchContacts();
  }, []);

  const fetchLeads = async () => {
    try {
      const res = await fetch('http://localhost:3000/leads');
      if (res.ok) setLeads(await res.json());
    } catch (error) {
      console.error("Erreur Leads", error);
    }
  };

  const fetchContacts = async () => {
    try {
      const res = await fetch('http://localhost:3000/contacts');
      if (res.ok) setContacts(await res.json());
    } catch (error) {
      console.error("Erreur Contacts", error);
    }
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // On convertit le montant en nombre si nécessaire
      const payload = {
        ...formData,
        amount: formData.amount ? parseFloat(formData.amount) : null
      };

      const res = await fetch('http://localhost:3000/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsModalOpen(false);
        setFormData({ title: '', amount: '', status: 'nouveau', contact_id: '' });
        fetchLeads(); // On rafraîchit le Kanban
      }
    } catch (error) {
      console.error("Erreur de création", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Pipeline Commercial</h1>
            <p className="text-slate-500 mt-1">Suivez vos opportunités et convertissez vos prospects.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-lg shadow-sm transition"
          >
            + Nouvelle Opportunité
          </button>
        </header>

        {/* Le Board Kanban */}
        <div className="flex gap-6 overflow-x-auto pb-4">
          {COLUMNS.map((status) => (
            <div key={status} className="bg-slate-200/50 rounded-xl p-4 w-80 flex-shrink-0 flex flex-col h-[70vh]">
              <div className="flex justify-between items-center mb-4 px-2">
                <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">{status}</h2>
                <span className="bg-slate-300 text-slate-700 text-xs font-bold px-2 py-1 rounded-full">
                  {leads.filter(lead => lead.status === status).length}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {leads.filter(lead => lead.status === status).map((lead) => (
                  <div key={lead.id} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition cursor-pointer group">
                    <h3 className="font-bold text-slate-800 mb-1">{lead.title}</h3>
                    <div className="text-sm text-slate-500 mb-3">
                      👤 {lead.contacts?.first_name} {lead.contacts?.last_name}
                    </div>
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100">
                      <span className="font-bold text-blue-600">{lead.amount ? `${lead.amount} €` : '-'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* MODALE DU FORMULAIRE */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">Ajouter un Lead</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-2xl">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Titre de l'opportunité *</label>
                <input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="Ex: Refonte site web" className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Montant estimé (€)</label>
                  <input type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Statut initial</label>
                  <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 bg-white">
                    {COLUMNS.map(col => <option key={col} value={col}>{col}</option>)}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Contact associé *</label>
                <select required value={formData.contact_id} onChange={(e) => setFormData({...formData, contact_id: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="" disabled>Sélectionner un contact</option>
                  {contacts.map(c => (
                    <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>
                  ))}
                </select>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition">Annuler</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition shadow-sm">Créer l'opportunité</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}