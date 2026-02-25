"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Clock, Plus, Trash2, User, Calendar as CalendarIcon, X } from 'lucide-react';

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', due_date: '', contact_id: '', description: '' });

  const API_URL = 'http://localhost:3000';

  useEffect(() => {
    fetchTasks();
    fetchContacts();
  }, []);

  const fetchTasks = async () => {
    const res = await fetch(`${API_URL}/tasks`);
    setTasks(await res.json());
  };

  const fetchContacts = async () => {
    const res = await fetch(`${API_URL}/contacts`);
    setContacts(await res.json());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    if (res.ok) {
      setIsModalOpen(false);
      setFormData({ title: '', due_date: '', contact_id: '', description: '' });
      fetchTasks();
    }
  };

  const toggleStatus = async (task: any) => {
    const newStatus = task.status === 'terminé' ? 'à faire' : 'terminé';
    await fetch(`${API_URL}/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    fetchTasks();
  };

  const deleteTask = async (id: string) => {
    await fetch(`${API_URL}/tasks/${id}`, { method: 'DELETE' });
    fetchTasks();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white italic uppercase">Rappels & <span className="text-blue-600">Tâches</span></h1>
          <button onClick={() => setIsModalOpen(true)} className="bg-slate-900 dark:bg-blue-600 text-white p-4 rounded-2xl shadow-xl hover:bg-blue-600 dark:hover:bg-blue-500 transition-all flex items-center gap-2 font-bold uppercase text-xs tracking-widest">
            <Plus size={20} /> Ajouter une tâche
          </button>
        </header>

        <div className="space-y-4">
          {tasks.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-20 rounded-[2.5rem] text-center text-slate-400 dark:text-slate-500 font-bold italic border border-dashed border-slate-200 dark:border-slate-800">
              Aucune tâche prévue. Prenez un café ! ☕
            </div>
          ) : (
            tasks.map((task) => (
              <motion.div 
                layout key={task.id}
                className={`bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between group transition-all ${task.status === 'terminé' ? 'opacity-50' : ''}`}
              >
                <div className="flex items-center gap-6">
                  <button onClick={() => toggleStatus(task)} className="text-blue-600 hover:scale-110 transition-transform">
                    {task.status === 'terminé' ? <CheckCircle2 size={32} /> : <Circle size={32} className="text-slate-200 dark:text-slate-700" />}
                  </button>
                  <div>
                    <h3 className={`font-black text-xl tracking-tight ${task.status === 'terminé' ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'}`}>{task.title}</h3>
                    <div className="flex gap-4 mt-1">
                      <span className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                        <Clock size={12} /> {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'Pas de date'}
                      </span>
                      {task.contacts && (
                        <span className="flex items-center gap-1.5 text-[10px] font-black uppercase text-blue-500 dark:text-blue-400 tracking-wider">
                          <User size={12} /> {task.contacts.first_name} {task.contacts.last_name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button onClick={() => deleteTask(task.id)} className="p-3 text-slate-200 dark:text-slate-700 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl opacity-0 group-hover:opacity-100 transition-all">
                  <Trash2 size={20} />
                </button>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* MODALE D'AJOUT */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)} 
              className="absolute inset-0 bg-slate-900/60 dark:bg-black/60 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 w-full max-w-lg relative z-10 shadow-2xl border border-white/20 dark:border-slate-800"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black italic text-slate-900 dark:text-white">
                  NOUVELLE <span className="text-blue-600">MISSION</span>
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-2">Titre de la tâche</label>
                  <input 
                    required 
                    placeholder="Ex: Appeler le client..." 
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl font-bold text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-950 outline-none transition-all" 
                    value={formData.title} 
                    onChange={(e) => setFormData({...formData, title: e.target.value})} 
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-2">Échéance</label>
                  <input 
                    type="date" 
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-950 transition-all" 
                    value={formData.due_date} 
                    onChange={(e) => setFormData({...formData, due_date: e.target.value})} 
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-2">Contact lié</label>
                  <select 
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-950 transition-all appearance-none" 
                    value={formData.contact_id} 
                    onChange={(e) => setFormData({...formData, contact_id: e.target.value})}
                  >
                    <option value="" className="text-slate-900 dark:text-white dark:bg-slate-900">Aucun contact</option>
                    {contacts.map(c => (
                      <option key={c.id} value={c.id} className="text-slate-900 dark:text-white dark:bg-slate-900">
                        {c.first_name} {c.last_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-2">Notes</label>
                  <textarea 
                    placeholder="Détails de la mission..." 
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl font-bold text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-950 transition-all h-24 resize-none" 
                    value={formData.description} 
                    onChange={(e) => setFormData({...formData, description: e.target.value})} 
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-slate-900 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-500 text-white font-black py-5 rounded-2xl shadow-xl transition-all uppercase text-xs tracking-[0.2em] mt-4"
                >
                  Planifier la tâche
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}