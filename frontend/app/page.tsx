"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Edit2, Trash2, UserPlus, X, Briefcase, Phone, Mail } from 'lucide-react';

export default function ContactsPage() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]); // État pour les entreprises
  const [filteredContacts, setFilteredContacts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<any>(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company_id: '' // Champ pour l'entreprise
  });

  const API_URL = 'http://localhost:3000';

  useEffect(() => {
    fetchContacts();
    fetchCompanies();
  }, []);

  useEffect(() => {
  // On vérifie si contacts existe ET si c'est bien un tableau
  if (Array.isArray(contacts)) {
    const results = contacts.filter(contact =>
      `${contact.first_name} ${contact.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredContacts(results);
  } else {
    // Si ce n'est pas un tableau (ex: erreur backend), on met une liste vide
    setFilteredContacts([]);
  }
}, [searchTerm, contacts]);

  const fetchContacts = async () => {
  try {
    const res = await fetch(`${API_URL}/contacts`);
    const data = await res.json();
    
    // On ne met à jour que si c'est un tableau
    if (Array.isArray(data)) {
      setContacts(data);
    } else {
      console.error("Le backend n'a pas renvoyé un tableau :", data);
      setContacts([]); // On reset à vide pour éviter le crash
    }
  } catch (error) {
    console.error("Erreur réseau :", error);
    setContacts([]);
  }
};

  const fetchCompanies = async () => {
    const res = await fetch(`${API_URL}/companies`);
    setCompanies(await res.json());
  };

  const openModal = (contact: any = null) => {
    if (contact) {
      setEditingContact(contact);
      setFormData({
        first_name: contact.first_name,
        last_name: contact.last_name,
        email: contact.email,
        phone: contact.phone || '',
        company_id: contact.company_id || ''
      });
    } else {
      setEditingContact(null);
      setFormData({ first_name: '', last_name: '', email: '', phone: '', company_id: '' });
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
  console.log("Contact créé avec succès !");
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
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-black text-slate-900 italic uppercase">Contacts</h1>
            <p className="text-slate-500 font-medium">Gérez votre répertoire client.</p>
          </div>
          <button onClick={() => openModal()} className="bg-blue-600 text-white font-black py-4 px-8 rounded-2xl shadow-xl flex items-center gap-2 uppercase text-xs tracking-widest">
            <UserPlus size={18} /> Nouveau Contact
          </button>
        </header>

        <div className="relative mb-8">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text"
            placeholder="Rechercher un contact..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border-2 border-transparent rounded-[2rem] py-5 pl-16 pr-6 text-slate-900 font-bold focus:border-blue-500 outline-none shadow-xl shadow-slate-200/50"
          />
        </div>

        <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-[11px] text-slate-400 uppercase tracking-[0.3em] font-black">
                <th className="p-8">Identité & Entreprise</th>
                <th className="p-8">Coordonnées</th>
                <th className="p-8 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredContacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="p-8">
                    <div className="font-black text-slate-900 text-lg">{contact.first_name} {contact.last_name}</div>
                    {contact.companies?.name ? (
                      <div className="flex items-center gap-1.5 text-blue-600 text-[10px] font-black uppercase mt-1">
                        <Briefcase size={12} /> {contact.companies.name}
                      </div>
                    ) : (
                      <div className="text-slate-300 text-[10px] font-bold uppercase mt-1 italic">Indépendant</div>
                    )}
                  </td>
                  <td className="p-8 space-y-1">
                    <div className="flex items-center gap-2 text-slate-600 font-medium text-sm"><Mail size={14}/> {contact.email}</div>
                    {contact.phone && <div className="flex items-center gap-2 text-slate-400 text-xs"><Phone size={14}/> {contact.phone}</div>}
                  </td>
                  <td className="p-8 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openModal(contact)} className="p-3 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit2 size={18}/></button>
                      <button onClick={() => handleDelete(contact.id)} className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18}/></button>
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
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg overflow-hidden relative z-10">
              <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase">{editingContact ? 'Modifier' : 'Ajouter'} <span className="text-blue-600">Contact</span></h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500"><X /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-10 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <input required placeholder="Prénom" value={formData.first_name} onChange={(e) => setFormData({...formData, first_name: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-slate-900 font-bold focus:border-blue-500 outline-none" />
                  <input required placeholder="Nom" value={formData.last_name} onChange={(e) => setFormData({...formData, last_name: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-slate-900 font-bold focus:border-blue-500 outline-none" />
                </div>
                <input required type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-slate-900 font-bold focus:border-blue-500 outline-none" />
                <input placeholder="Téléphone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-slate-900 font-bold focus:border-blue-500 outline-none" />
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Entreprise</label>
                  <select 
                    value={formData.company_id} 
                    onChange={(e) => setFormData({...formData, company_id: e.target.value})}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-slate-900 font-bold focus:border-blue-500 outline-none appearance-none"
                  >
                    <option value="">-- Sélectionner une entreprise --</option>
                    {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <button type="submit" className="w-full bg-slate-900 hover:bg-blue-600 text-white font-black py-5 rounded-2xl shadow-xl transition-all uppercase tracking-widest text-xs mt-4">
                  {editingContact ? 'Mettre à jour' : 'Enregistrer le contact'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}