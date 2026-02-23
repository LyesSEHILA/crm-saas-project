"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, User, Euro, GripVertical } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

const COLUMNS = ['nouveau', 'en cours', 'converti', 'perdu'];

export default function PipelinePage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', amount: '', status: 'nouveau', contact_id: '' });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  useEffect(() => { fetchLeads(); fetchContacts(); }, []);

  const fetchLeads = async () => { 
    const res = await fetch(`${API_URL}/leads`);
    setLeads(await res.json()); 
  };
  
  const fetchContacts = async () => { 
    const res = await fetch(`${API_URL}/contacts`);
    setContacts(await res.json()); 
  };

  // --- LOGIQUE DE DRAG & DROP ---
  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Si on lâche en dehors d'une colonne ou au même endroit, on ne fait rien
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return;
    }

    const newStatus = destination.droppableId;
    
    // 1. Mise à jour visuelle immédiate (Optimistic UI)
    const updatedLeads = leads.map(lead => 
      lead.id === draggableId ? { ...lead, status: newStatus } : lead
    );
    setLeads(updatedLeads);

    // 2. Mise à jour en base de données via le Backend
    try {
      await fetch(`${API_URL}/leads/${draggableId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut", error);
      fetchLeads(); // En cas d'erreur, on recharge les vraies données
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(`${API_URL}/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, amount: parseFloat(formData.amount) })
    });
    setIsModalOpen(false);
    setFormData({ title: '', amount: '', status: 'nouveau', contact_id: '' });
    fetchLeads();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <header className="flex justify-between items-center mb-10 max-w-7xl mx-auto">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight italic">PIPELINE <span className="text-blue-600">SALES</span></h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white font-black py-3 px-6 rounded-2xl shadow-lg shadow-blue-200 flex items-center gap-2 hover:bg-blue-700 transition-all uppercase text-sm tracking-widest"
        >
          <Plus size={20} /> Nouvelle Opportunité
        </button>
      </header>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 overflow-x-auto pb-10 px-4 min-h-[80vh]">
          {COLUMNS.map((status) => (
            <div key={status} className="w-80 flex-shrink-0 flex flex-col group">
              <div className="flex justify-between items-center mb-4 px-4">
                <h2 className="font-black text-slate-400 uppercase text-[11px] tracking-[0.2em]">{status}</h2>
                <span className="bg-slate-200 text-slate-600 text-[10px] font-black px-2.5 py-1 rounded-lg">
                  {leads.filter(l => l.status === status).length}
                </span>
              </div>

              <Droppable droppableId={status}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`flex-1 rounded-3xl p-3 transition-colors duration-200 ${snapshot.isDraggingOver ? 'bg-blue-50/50 border-2 border-dashed border-blue-200' : 'bg-slate-100/50'}`}
                  >
                    <div className="space-y-3">
                      {leads.filter(l => l.status === status).map((lead, index) => (
                        <Draggable key={lead.id} draggableId={lead.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`bg-white p-5 rounded-2xl border border-slate-100 shadow-sm transition-shadow ${snapshot.isDragging ? 'shadow-2xl border-blue-200 ring-2 ring-blue-500/10' : 'hover:shadow-md'}`}
                            >
                              <div className="flex justify-between items-start mb-3">
                                <h3 className="font-bold text-slate-900 leading-tight pr-4">{lead.title}</h3>
                                <GripVertical size={16} className="text-slate-300 flex-shrink-0" />
                              </div>
                              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-4">
                                <User size={12} className="text-blue-500" /> 
                                {lead.contacts?.first_name} {lead.contacts?.last_name}
                              </div>
                              <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                                <span className="text-sm font-black text-slate-900">{lead.amount?.toLocaleString()} €</span>
                                <div className="h-1.5 w-8 rounded-full bg-slate-100 overflow-hidden">
                                    <div className="h-full bg-blue-500 w-1/3"></div>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {/* MODALE DE CRÉATION (Correction couleurs texte) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg relative z-10 overflow-hidden border border-white/20">
              <div className="p-10 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter italic">NOUVELLE <span className="text-blue-600">AFFAIRE</span></h2>
                <button onClick={() => setIsModalOpen(false)} className="bg-white p-2 rounded-full shadow-sm text-slate-400 hover:text-red-500 transition-colors"><X size={20} /></button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-10 space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Titre de l'opportunité</label>
                  <input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="Ex: Contrat Maintenance 2024" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-slate-900 font-bold placeholder:text-slate-300 focus:border-blue-500 focus:bg-white outline-none transition-all" />
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Valeur estimée</label>
                    <div className="relative">
                        <input type="number" required value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-slate-900 font-bold focus:border-blue-500 focus:bg-white outline-none transition-all" />
                        <Euro size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Phase</label>
                    <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-slate-900 font-bold focus:border-blue-500 focus:bg-white outline-none transition-all appearance-none cursor-pointer">
                      {COLUMNS.map(col => <option key={col} value={col}>{col.toUpperCase()}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Décideur</label>
                  <select required value={formData.contact_id} onChange={(e) => setFormData({...formData, contact_id: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-slate-900 font-bold focus:border-blue-500 focus:bg-white outline-none transition-all appearance-none cursor-pointer">
                    <option value="">Choisir un contact...</option>
                    {contacts.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
                  </select>
                </div>

                <button type="submit" className="w-full bg-slate-900 hover:bg-blue-600 text-white font-black py-5 rounded-2xl shadow-xl transition-all uppercase tracking-[0.2em] text-xs mt-4">
                  Enregistrer l'opportunité
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}