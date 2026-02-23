"use client";

import React, { useState, useEffect } from 'react';

export default function Home() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const res = await fetch('http://localhost:3000/contacts');
      const data = await res.json();
      setContacts(data);
    } catch (error) {
      console.error("Erreur de connexion", error);
    }
  };

  // --- NOUVELLE FONCTION : SUPPRIMER UN CONTACT ---
  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce contact ?")) return;

    try {
      const res = await fetch(`http://localhost:3000/contacts/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        // On rafraîchit la liste après suppression
        fetchContacts();
      } else {
        alert("Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Erreur réseau", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3000/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setIsModalOpen(false);
        setFormData({ first_name: '', last_name: '', email: '', phone: '' });
        fetchContacts();
      } else {
        const err = await res.json();
        alert("Erreur : " + err.message);
      }
    } catch (error) {
      console.error("Erreur lors de la création", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Mes Contacts</h1>
            <p className="text-slate-500 mt-1">Gérez vos relations clients et vos leads.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-lg shadow-sm transition"
          >
            + Nouveau Contact
          </button>
        </header>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {contacts.length === 0 ? (
            <div className="p-16 text-center">
              <h3 className="text-lg font-semibold text-slate-900">Aucun contact</h3>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase">
                  <th className="p-5 font-semibold">Nom complet</th>
                  <th className="p-5 font-semibold">Email</th>
                  <th className="p-5 font-semibold">Téléphone</th>
                  <th className="p-5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {contacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-slate-50 group">
                    <td className="p-5 font-medium">{contact.first_name} {contact.last_name}</td>
                    <td className="p-5 text-slate-600">{contact.email}</td>
                    <td className="p-5 text-slate-600">{contact.phone || '—'}</td>
                    <td className="p-5 text-right">
                      {/* BOUTON SUPPRIMER */}
                      <button 
                        onClick={() => handleDelete(contact.id)}
                        className="text-red-500 hover:text-red-700 font-medium text-sm transition-colors"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* MODALE (identique à précédemment) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Ajouter un contact</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input type="text" required placeholder="Prénom" value={formData.first_name} onChange={(e) => setFormData({...formData, first_name: e.target.value})} className="border p-2 rounded w-full" />
                <input type="text" required placeholder="Nom" value={formData.last_name} onChange={(e) => setFormData({...formData, last_name: e.target.value})} className="border p-2 rounded w-full" />
              </div>
              <input type="email" required placeholder="Email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="border p-2 rounded w-full" />
              <input type="tel" placeholder="Téléphone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="border p-2 rounded w-full" />
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-500">Annuler</button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}