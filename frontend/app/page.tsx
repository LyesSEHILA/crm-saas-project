"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Edit2, Trash2, UserPlus, X, 
  Briefcase, Phone, Mail, MapPin, Calendar 
} from 'lucide-react';

export default function ContactsPage() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<any>(null);

  // --- MISE À JOUR : Ajout de city et birth_date ---
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company_id: '',
    city: '',        
    birth_date: ''   
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  useEffect(() => {
    fetchContacts();
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (Array.isArray(contacts)) {
      const results = contacts.filter(contact =>
        `${contact.first_name} ${contact.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (contact.city && contact.city.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredContacts(results);
    } else {
      setFilteredContacts([]);
    }
  }, [searchTerm, contacts]);

  const fetchContacts = async () => {
    try {
      const res = await fetch(`${API_URL}/contacts`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setContacts(data);
      } else {
        setContacts([]);
      }
    } catch (error) {
      setContacts([]);
    }
  };

  const fetchCompanies = async () => {
    const res = await fetch(`${API_URL}/companies`);
    setCompanies(await res.json());
  };

  // --- MISE À JOUR : On peuple les nouveaux champs à l'ouverture ---
  const openModal = (contact: any = null) => {
    if (contact) {
      setEditingContact(contact);
      setFormData({
        first_name: contact.first_name,
        last_name: contact.last_name,
        email: contact.email,
        phone: contact.phone || '',
        company_id: contact.company_id || '',
        city: contact.city || '',
        birth_date: contact.birth_date ? contact.birth_date.split('T')[0] : '' 
      });
    } else {
      setEditingContact(null);
      setFormData({ 
        first_name: '', last_name: '', email: '', phone: '', 
        company_id: '', city: '', birth_date: '' 
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingContact ? 'PATCH' : 'POST';
    const url = editingContact ? `${API_URL}/contacts/${editingContact.id}` : `${API_URL}/contacts`;

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      setIsModalOpen(false); 
      await fetchContacts(); 
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce contact ?")) return;
    await fetch(`${API_URL}/contacts/${id}`, { method: 'DELETE' });
    fetchContacts();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8 font-sans transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white italic uppercase">Contacts</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium tracking-tight">Gérez votre répertoire client et votre segmentation.</p>
          </div>
          <button onClick={() => openModal()} className="bg-blue-600 text-white font-black py-4 px-8 rounded-2xl shadow-xl hover:bg-blue-700 transition-all flex items-center gap-2 uppercase text-xs tracking-widest">
            <UserPlus size={18} /> Nouveau Contact
          </button>
        </header>

        {/* ... Barre de recherche inchangée ... */}
        <div className="relative mb-8">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text"
            placeholder="Rechercher par nom, email ou ville..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border-2 border-transparent dark:border-slate-800 rounded-[2rem] py-5 pl-16 pr-6 text-slate-900 dark:text-white font-bold focus:border-blue-500 outline-none shadow-xl shadow-slate-200/50 dark:shadow-none transition-all"
          />
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 uppercase tracking-[0.3em] font-black">
                <th className="p-8">Identité & Localisation</th>
                <th className="p-8">Coordonnées</th>
                <th className="p-8 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {filteredContacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors group">
                  <td className="p-8">
                    <div className="font-black text-slate-900 dark:text-white text-lg">{contact.first_name} {contact.last_name}</div>
                    <div className="flex items-center gap-4 mt-1">
                      {contact.companies?.name && (
                        <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase">
                          <Briefcase size={12} /> {contact.companies.name}
                        </div>
                      )}
                      {/* --- AJOUT : Affichage de la ville dans la liste --- */}
                      {contact.city && (
                        <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-black uppercase">
                          <MapPin size={12} /> {contact.city}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-8 space-y-1">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium text-sm"><Mail size={14}/> {contact.email}</div>
                    {contact.phone && <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-xs"><Phone size={14}/> {contact.phone}</div>}
                  </td>
                  <td className="p-8 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openModal(contact)} className="p-3 text-slate-300 dark:text-slate-600 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"><Edit2 size={18}/></button>
                      <button onClick={() => handleDelete(contact.id)} className="p-3 text-slate-300 dark:text-slate-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"><Trash2 size={18}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl w-full max-w-lg overflow-hidden relative z-10 border border-transparent dark:border-slate-800">
              <div className="p-10 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase">{editingContact ? 'Modifier' : 'Ajouter'} <span className="text-blue-600">Contact</span></h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500 p-2"><X /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-10 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input required placeholder="Prénom" value={formData.first_name} onChange={(e) => setFormData({...formData, first_name: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-5 py-4 text-slate-900 dark:text-white font-bold focus:border-blue-500 outline-none transition-all" />
                  <input required placeholder="Nom" value={formData.last_name} onChange={(e) => setFormData({...formData, last_name: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-5 py-4 text-slate-900 dark:text-white font-bold focus:border-blue-500 outline-none transition-all" />
                </div>
                
                <input required type="email" placeholder="Email professionnel" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-5 py-4 text-slate-900 dark:text-white font-bold focus:border-blue-500 outline-none transition-all" />
                <input placeholder="Téléphone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-5 py-4 text-slate-900 dark:text-white font-bold focus:border-blue-500 outline-none transition-all" />
                
                {/* --- AJOUT : Ville et Date de Naissance en ligne --- */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-1"><MapPin size={10}/> Ville</label>
                    <input placeholder="Ex: Paris" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-5 py-3 text-slate-900 dark:text-white font-bold focus:border-blue-500 outline-none transition-all" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-1"><Calendar size={10}/> Naissance</label>
                    <input type="date" value={formData.birth_date} onChange={(e) => setFormData({...formData, birth_date: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-5 py-3 text-slate-900 dark:text-white font-bold focus:border-blue-500 outline-none transition-all" />
                  </div>
                </div>

                <div className="space-y-1 pt-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-1"><Briefcase size={10}/> Entreprise liée</label>
                  <select 
                    value={formData.company_id} 
                    onChange={(e) => setFormData({...formData, company_id: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-5 py-4 text-slate-900 dark:text-white font-bold focus:border-blue-500 outline-none appearance-none cursor-pointer"
                  >
                    <option value="">-- Sélectionner une entreprise --</option>
                    {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <button type="submit" className="w-full bg-slate-950 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-500 text-white font-black py-5 rounded-2xl shadow-xl transition-all uppercase tracking-widest text-xs mt-6">
                  {editingContact ? 'Mettre à jour les infos' : 'Enregistrer le nouveau contact'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}