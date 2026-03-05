"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Mail, Send, History } from "lucide-react";

export default function CampaignsPage() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ contactId: "", subject: "", body: "" });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    // Charger les contacts
    const { data: contactsData } = await supabase.from('contacts').select('*');
    setContacts(contactsData || []);

    // Charger l'historique
    const { data: historyData } = await supabase.from('communications').select('*').order('sent_at', { ascending: false });
    setHistory(historyData || []);
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const selectedContact = contacts.find(c => c.id === formData.contactId);
      if (!selectedContact) throw new Error("Contact introuvable");

      const { data: { session } } = await supabase.auth.getSession();

      // 1. Envoyer via l'API NestJS -> Brevo
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/mail/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: selectedContact.email,
          subject: formData.subject,
          htmlContent: `<p>${formData.body.replace(/\n/g, '<br/>')}</p>`
        })
      });

      if (!res.ok) throw new Error("Erreur d'envoi");

      // 2. Sauvegarder dans l'historique (Supabase)
      await supabase.from('communications').insert([{
        contact_id: selectedContact.id,
        user_id: session?.user.id,
        contact_email: selectedContact.email,
        subject: formData.subject,
        body: formData.body
      }]);

      alert("Email envoyé et historisé avec succès !");
      setFormData({ contactId: "", subject: "", body: "" });
      fetchData(); // Rafraîchir l'historique
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      <header className="flex items-center gap-4 mb-10">
        <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-500/30">
          <Mail size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white italic uppercase">Campagnes</h1>
          <p className="text-slate-500 font-medium">Envoyez des emails personnalisés et suivez l'historique.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulaire d'envoi */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-black uppercase text-slate-900 dark:text-white mb-6 flex items-center gap-2"><Send size={20}/> Nouvel Email</h2>
          <form onSubmit={handleSendEmail} className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Destinataire</label>
              <select required value={formData.contactId} onChange={e => setFormData({...formData, contactId: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-5 py-3 text-sm font-bold outline-none mt-1">
                <option value="">Sélectionner un contact...</option>
                {contacts.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name} ({c.email})</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sujet</label>
              <input required type="text" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-5 py-3 text-sm font-bold outline-none mt-1" placeholder="Ex: Suite à notre rendez-vous" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Message</label>
              <textarea required value={formData.body} onChange={e => setFormData({...formData, body: e.target.value})} rows={6} className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-5 py-3 text-sm font-bold outline-none mt-1" placeholder="Rédigez votre email ici..."></textarea>
            </div>
            <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl uppercase text-xs tracking-[0.2em] transition-all disabled:opacity-50">
              {loading ? "Envoi en cours..." : "Envoyer l'email"}
            </button>
          </form>
        </div>

        {/* Historique */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-black uppercase text-slate-900 dark:text-white mb-6 flex items-center gap-2"><History size={20}/> Historique</h2>
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {history.length === 0 ? (
              <p className="text-slate-400 text-sm font-medium italic">Aucun email envoyé pour le moment.</p>
            ) : (
              history.map(h => (
                <div key={h.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-black text-blue-600 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-md">{h.contact_email}</span>
                    <span className="text-[10px] font-bold text-slate-400">{new Date(h.sent_at).toLocaleDateString()}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">{h.subject}</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 truncate">{h.body}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}