"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Globe, Factory, Plus, Trash2, X, Search, Building2, Edit2 } from 'lucide-react';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<any>(null); // Pour suivre l'entreprise en cours de modif
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    website: ''
  });

  const API_URL = 'http://localhost:3000/companies';

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Erreur Backend");
      const data = await res.json();
      setCompanies(data);
    } catch (error) {
      console.error("Erreur de chargement des entreprises", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCompanies = companies.filter(company =>
    company.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.industry?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fonction pour ouvrir la modale en mode Création ou Edition
  const openModal = (company: any = null) => {
    if (company) {
      setEditingCompany(company);
      setFormData({
        name: company.name,
        industry: company.industry || '',
        website: company.website || ''
      });
    } else {
      setEditingCompany(null);
      setFormData({ name: '', industry: '', website: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingCompany ? 'PATCH' : 'POST';
    const url = editingCompany ? `${API_URL}/${editingCompany.id}` : API_URL;

    try {
      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setIsModalOpen(false);
        setEditingCompany(null);
        setFormData({ name: '', industry: '', website: '' });
        fetchCompanies();
      } else {
        const errorData = await res.json();
        alert("Erreur lors de l'enregistrement : " + errorData.message);
      }
    } catch (error) {
      console.error("Erreur réseau", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette entreprise ?")) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (res.ok) fetchCompanies();
    } catch (error) {
      console.error("Erreur de suppression", error);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-slate-50 p-8 font-sans"
    >
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase">
              Entreprises <span className="text-blue-600">Partenaires</span>
            </h1>
            <p className="text-slate-500 font-medium">Gérez les organisations et structures de vos contacts.</p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => openModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-8 rounded-2xl shadow-xl shadow-blue-200 flex items-center gap-3 transition-all uppercase text-xs tracking-[0.2em]"
          >
            <Plus size={18} /> Nouvelle Entreprise
          </motion.button>
        </header>

        {/* BARRE DE RECHERCHE */}
        <div className="relative mb-8">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text"
            placeholder="Rechercher une organisation ou un secteur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border-2 border-transparent rounded-[2rem] py-5 pl-16 pr-6 text-slate-900 font-bold focus:border-blue-500 focus:ring-0 outline-none transition-all shadow-xl shadow-slate-200/50 placeholder:text-slate-300"
          />
        </div>

        {/* TABLEAU DES ENTREPRISES */}
        <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-[11px] text-slate-400 uppercase tracking-[0.3em] font-black">
                <th className="p-8">Organisation</th>
                <th className="p-8">Secteur</th>
                <th className="p-8">Site Web</th>
                <th className="p-8 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-20 text-center text-slate-400 font-bold italic animate-pulse">Chargement des données...</td>
                </tr>
              ) : filteredCompanies.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-20 text-center text-slate-400 font-bold italic">Aucune entreprise répertoriée.</td>
                </tr>
              ) : (
                filteredCompanies.map((company, index) => (
                  <motion.tr 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={company.id} 
                    className="hover:bg-blue-50/30 transition-colors group"
                  >
                    <td className="p-8">
                      <div className="flex items-center gap-5">
                        <div className="h-14 w-14 rounded-2xl bg-slate-950 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                          <Building2 size={24} />
                        </div>
                        <span className="font-black text-slate-900 text-xl tracking-tight">{company.name}</span>
                      </div>
                    </td>
                    <td className="p-8">
                      <div className="flex items-center gap-2">
                        <Factory size={14} className="text-blue-500" />
                        <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-wider">
                          {company.industry || 'Non spécifié'}
                        </span>
                      </div>
                    </td>
                    <td className="p-8">
                      {company.website ? (
                        <a 
                          href={company.website.startsWith('http') ? company.website : `https://${company.website}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors font-bold text-sm"
                        >
                          <Globe size={16} /> 
                          {company.website.replace(/^https?:\/\//, '')}
                        </a>
                      ) : (
                        <span className="text-slate-300 italic text-sm">Non renseigné</span>
                      )}
                    </td>
                    <td className="p-8 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => openModal(company)} 
                          className="text-slate-200 hover:text-blue-600 transition-all p-3 hover:bg-blue-50 rounded-2xl"
                        >
                          <Edit2 size={20} />
                        </button>
                        <button 
                          onClick={() => handleDelete(company.id)} 
                          className="text-slate-200 hover:text-red-500 transition-all p-3 hover:bg-red-50 rounded-2xl"
                        >
                          <Trash2 size={22} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODALE STYLISÉE (UNIFIÉE CRÉATION / ÉDITION) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg overflow-hidden relative z-10 border border-white/20"
            >
              <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase">
                  {editingCompany ? 'Modifier' : 'Créer'} une <span className="text-blue-600">entreprise</span>
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="bg-white p-3 rounded-full shadow-sm text-slate-400 hover:text-red-500 transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-10 space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Nom de l'entreprise *</label>
                  <input 
                    type="text" required value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                    placeholder="Ex: Tesla Motors"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-slate-900 font-bold placeholder:text-slate-300 focus:border-blue-500 focus:bg-white outline-none transition-all" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Secteur d'activité</label>
                  <input 
                    type="text" value={formData.industry} 
                    onChange={(e) => setFormData({...formData, industry: e.target.value})} 
                    placeholder="Ex: Automobile, Tech..."
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-slate-900 font-bold placeholder:text-slate-300 focus:border-blue-500 focus:bg-white outline-none transition-all" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Site Web</label>
                  <input 
                    type="text" value={formData.website} 
                    onChange={(e) => setFormData({...formData, website: e.target.value})} 
                    placeholder="www.tesla.com"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-slate-900 font-bold placeholder:text-slate-300 focus:border-blue-500 focus:bg-white outline-none transition-all" 
                  />
                </div>
                
                <button type="submit" className="w-full bg-slate-900 hover:bg-blue-600 text-white font-black py-5 rounded-2xl shadow-xl transition-all uppercase tracking-[0.3em] text-xs mt-4">
                  {editingCompany ? 'Enregistrer les modifications' : "Enregistrer l'organisation"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}