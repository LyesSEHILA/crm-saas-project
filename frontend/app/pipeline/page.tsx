"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, X, User, Euro, GripVertical, TrendingUp, 
  Target, MessageSquare, Clock, Send, Trash2, Download 
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

const COLUMNS = ['nouveau', 'en cours', 'converti', 'perdu'];

export default function PipelinePage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', amount: '', status: 'nouveau', contact_id: '' });
  
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [newNote, setNewNote] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  useEffect(() => { 
    fetchLeads(); 
    fetchContacts(); 
  }, []);

  const fetchLeads = async () => { 
    const res = await fetch(`${API_URL}/leads`);
    const data = await res.json();
    setLeads(Array.isArray(data) ? data : []); 
  };
  
  const fetchContacts = async () => { 
    const res = await fetch(`${API_URL}/contacts`);
    const data = await res.json();
    setContacts(Array.isArray(data) ? data : []); 
  };

  const fetchNotes = async (leadId: string) => {
    const res = await fetch(`${API_URL}/lead-notes/lead/${leadId}`);
    const data = await res.json();
    setNotes(Array.isArray(data) ? data : []);
  };

  // --- FONCTION D'EXPORTATION CSV ---
  const handleExport = () => {
    window.open(`${API_URL}/leads/export/csv`, '_blank');
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, status, draggableId } = result as any;
    if (!destination || (destination.droppableId === result.source.droppableId && destination.index === result.source.index)) {
      return;
    }

    const newStatus = destination.droppableId;
    const updatedLeads = leads.map(lead => 
      lead.id === draggableId ? { ...lead, status: newStatus } : lead
    );
    setLeads(updatedLeads);

    try {
      await fetch(`${API_URL}/leads/${draggableId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut", error);
      fetchLeads();
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

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    const res = await fetch(`${API_URL}/lead-notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lead_id: selectedLead.id, content: newNote })
    });
    if (res.ok) {
      setNewNote('');
      fetchNotes(selectedLead.id);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm("Supprimer ce commentaire ?")) return;
    const res = await fetch(`${API_URL}/lead-notes/${noteId}`, { method: 'DELETE' });
    if (res.ok) fetchNotes(selectedLead.id);
  };

  const getColumnTotal = (status: string) => {
    return leads
      .filter(l => l.status === status)
      .reduce((sum, lead) => sum + (Number(lead.amount) || 0), 0);
  };

  const totalPipelineValue = leads.reduce((sum, lead) => sum + (Number(lead.amount) || 0), 0);
  const wonValue = getColumnTotal('converti');
  const progressPercentage = totalPipelineValue > 0 ? (wonValue / totalPipelineValue) * 100 : 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8 transition-colors duration-300">
      <header className="flex justify-between items-center mb-10 max-w-7xl mx-auto">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight italic uppercase">
          PIPELINE <span className="text-blue-600">SALES</span>
        </h1>
        
        {/* BOUTONS D'ACTION */}
        <div className="flex gap-4">
          <button 
            onClick={handleExport}
            className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-black py-3 px-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all uppercase text-xs tracking-widest"
          >
            <Download size={18} className="text-blue-600" /> Exporter CSV
          </button>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white font-black py-3 px-6 rounded-2xl shadow-lg shadow-blue-200 flex items-center gap-2 hover:bg-blue-700 transition-all uppercase text-xs tracking-widest"
          >
            <Plus size={20} /> Nouvelle Opportunité
          </button>
        </div>
      </header>

      {/* BARRE DE PROGRESSION GLOBALE */}
      <section className="max-w-7xl mx-auto mb-12 bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-xl shadow-slate-200/40 dark:shadow-none border border-slate-100 dark:border-slate-800">
        <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <Target size={16} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Volume Total du Pipeline</span>
            </div>
            <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
              {totalPipelineValue.toLocaleString()} €
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end gap-2 text-emerald-500 mb-1">
              <TrendingUp size={16} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Taux de Succès</span>
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">
              {progressPercentage.toFixed(1)}% <span className="text-slate-300 dark:text-slate-500 text-sm font-bold uppercase italic ml-1">Gagné</span>
            </p>
          </div>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-4 rounded-full overflow-hidden p-1">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-lg shadow-blue-200"
          />
        </div>
      </section>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 overflow-x-auto pb-10 px-4 min-h-[80vh]">
          {COLUMNS.map((status) => (
            <div key={status} className="w-80 flex-shrink-0 flex flex-col group">
              <div className="flex flex-col mb-4 px-4">
                <div className="flex justify-between items-center">
                  <h2 className="font-black text-slate-400 uppercase text-[10px] tracking-[0.2em]">{status}</h2>
                  <span className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-black px-2.5 py-1 rounded-lg">
                    {leads.filter(l => l.status === status).length}
                  </span>
                </div>
                <p className="text-slate-900 dark:text-white font-black text-xl mt-1 tracking-tighter">
                  {getColumnTotal(status).toLocaleString()} €
                </p>
              </div>

              <Droppable droppableId={status}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`flex-1 rounded-[2.5rem] p-3 transition-colors duration-200 ${snapshot.isDraggingOver ? 'bg-blue-50/50 dark:bg-blue-900/20 border-2 border-dashed border-blue-200' : 'bg-slate-100/50 dark:bg-slate-900/50'}`}
                  >
                    <div className="space-y-3">
                      {leads.filter(l => l.status === status).map((lead, index) => (
                        <Draggable key={lead.id} draggableId={lead.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => { setSelectedLead(lead); fetchNotes(lead.id); }}
                              className={`bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm transition-shadow cursor-pointer ${snapshot.isDragging ? 'shadow-2xl border-blue-200 ring-2 ring-blue-500/10' : 'hover:shadow-md dark:hover:shadow-blue-900/10'}`}
                            >
                              <div className="flex justify-between items-start mb-3">
                                <h3 className="font-bold text-slate-900 dark:text-white leading-tight pr-4 truncate">{lead.title}</h3>
                                <GripVertical size={16} className="text-slate-300 dark:text-slate-600 flex-shrink-0" />
                              </div>
                              <div className="flex items-center gap-2 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase mb-4">
                                <User size={12} className="text-blue-500" /> 
                                {lead.contacts?.first_name} {lead.contacts?.last_name || 'Inconnu'}
                              </div>
                              <div className="flex justify-between items-center pt-4 border-t border-slate-50 dark:border-slate-700/50">
                                <span className="text-lg font-black text-slate-900 dark:text-white">{lead.amount?.toLocaleString()} €</span>
                                <div className="h-1.5 w-8 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                                    <div className={`h-full bg-blue-500 ${lead.status === 'converti' ? 'w-full bg-emerald-500' : 'w-1/3'}`}></div>
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

      {/* PANNEAU LATÉRAL (SLIDE-OVER) */}
      <AnimatePresence>
        {selectedLead && (
          <div className="fixed inset-0 z-[60] flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedLead(null)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="relative w-full max-w-md bg-white dark:bg-slate-900 h-screen shadow-2xl p-8 flex flex-col">
              <button onClick={() => setSelectedLead(null)} className="absolute top-6 right-6 p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-red-50 hover:text-red-500 transition-all text-slate-400"><X size={20} /></button>
              
              <div className="mb-10">
                <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800">{selectedLead.status}</span>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-4 tracking-tighter italic uppercase leading-none">{selectedLead.title}</h2>
                <div className="flex items-center gap-2 mt-4 text-blue-600 font-black text-2xl tracking-tight">
                  <Euro size={20} /> {selectedLead.amount?.toLocaleString()} €
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-6 pr-2 scrollbar-hide">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4 mb-4 text-slate-400">
                    <MessageSquare size={16} />
                    <h3 className="text-xs font-black uppercase tracking-widest">Historique de suivi</h3>
                </div>

                {notes.length === 0 ? (
                  <div className="py-10 text-center text-slate-300 dark:text-slate-600 italic text-sm font-medium">Aucun commentaire pour le moment.</div>
                ) : (
                  notes.map((note) => (
                    <motion.div key={note.id} layout className="bg-slate-50 dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-700 relative group">
                      <p className="text-slate-700 dark:text-slate-300 font-bold text-sm leading-relaxed pr-8">{note.content}</p>
                      
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteNote(note.id); }}
                        className="absolute top-4 right-4 p-2 text-slate-300 dark:text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>

                      <div className="flex items-center gap-1.5 mt-3 text-slate-400">
                        <Clock size={10} />
                        <p className="text-[9px] font-black uppercase tracking-tighter">{new Date(note.created_at).toLocaleString()}</p>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              <form onSubmit={handleAddNote} className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
                <div className="relative">
                    <textarea 
                      value={newNote} 
                      onChange={(e) => setNewNote(e.target.value)} 
                      placeholder="Ajouter une note de suivi..." 
                      className="w-full p-5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-[2rem] text-slate-900 dark:text-white font-bold focus:border-blue-500 focus:bg-white dark:focus:bg-slate-950 outline-none transition-all h-32 resize-none placeholder:text-slate-300 dark:placeholder:text-slate-600" 
                    />
                    <button type="submit" className="absolute bottom-4 right-4 bg-slate-900 dark:bg-blue-600 text-white p-3 rounded-2xl hover:bg-blue-600 dark:hover:bg-blue-500 transition-all">
                      <Send size={18} />
                    </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODALE DE CRÉATION */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-lg relative z-10 overflow-hidden border border-white/20 dark:border-slate-800">
              <div className="p-10 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase">NOUVELLE <span className="text-blue-600">AFFAIRE</span></h2>
                <button onClick={() => setIsModalOpen(false)} className="bg-white dark:bg-slate-800 p-2 rounded-full shadow-sm text-slate-400 hover:text-red-500 transition-colors"><X size={20} /></button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-10 space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Titre</label>
                  <input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="Ex: Projet Refonte Web" className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-5 py-4 text-slate-900 dark:text-white font-bold focus:border-blue-500 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Montant (€)</label>
                    <input type="number" required value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} placeholder="0.00" className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-5 py-4 text-slate-900 dark:text-white font-bold focus:border-blue-500 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Statut Initial</label>
                    <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-5 py-4 text-slate-900 dark:text-white font-bold focus:border-blue-500 outline-none transition-all appearance-none">
                      {COLUMNS.map(col => <option key={col} value={col}>{col.toUpperCase()}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact associé</label>
                  <select required value={formData.contact_id} onChange={(e) => setFormData({...formData, contact_id: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-5 py-4 text-slate-900 dark:text-white font-bold focus:border-blue-500 outline-none transition-all appearance-none">
                    <option value="">Sélectionner un contact...</option>
                    {contacts.map(c => <option key={c.id} value={c.id} className="dark:bg-slate-900">{c.first_name} {c.last_name}</option>)}
                  </select>
                </div>
                
                <button type="submit" className="w-full bg-slate-900 dark:bg-blue-600 text-white font-black py-5 rounded-2xl uppercase tracking-[0.2em] text-xs mt-4 hover:bg-blue-600 dark:hover:bg-blue-500 transition-all">
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