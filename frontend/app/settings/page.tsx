"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Building, Save, ShieldCheck, Bell, 
  Lock, CheckCircle2, AlertCircle, Sun, Moon, Palette 
} from 'lucide-react';

// Mise à jour du type des onglets
type Tab = 'Compte' | 'Notifications' | 'Sécurité' | 'Apparence';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Compte');
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  
  // États des formulaires avec ajout du thème
  const [profile, setProfile] = useState({ 
    first_name: '', 
    last_name: '', 
    company_name: '',
    notif_new_lead: true, 
    notif_task_reminder: true,
    theme: 'light' 
  });
  const [passwords, setPasswords] = useState({ new: '', confirm: '' });
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    getProfile();
  }, []);

  async function getProfile() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setUserEmail(session.user.email || '');
      const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      if (data) setProfile(data);
    }
    setLoading(false);
  }

  async function updateProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    showMessage('error', "Session expirée. Reconnectez-vous.");
    return;
  }

  const { error } = await supabase.from('profiles').upsert({
    id: user.id,
    ...profile,
    updated_at: new Date().toISOString(),
  });
  
  if (error) {
    // On log les détails précis pour le debug
    console.error("Erreur Supabase détaillée:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    });
    showMessage('error', `Erreur: ${error.message}`);
  } else {
    showMessage('success', "Paramètres enregistrés !");
    // Appliquer le thème
    if (profile.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}

  async function handlePasswordUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
        return showMessage('error', "Les mots de passe ne correspondent pas.");
    }
    const { error } = await supabase.auth.updateUser({ password: passwords.new });
    if (error) showMessage('error', error.message);
    else {
        showMessage('success', "Mot de passe modifié !");
        setPasswords({ new: '', confirm: '' });
    }
  }

  function showMessage(type: 'success' | 'error', text: string) {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  }

  if (loading) return <div className="p-8 text-slate-400 font-black italic uppercase animate-pulse">Chargement...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase">Configuration <span className="text-blue-600">Système</span></h1>
          <p className="text-slate-500 font-medium text-sm">Gérez votre expérience SoloCRM.</p>
        </div>
        
        <AnimatePresence>
            {message && (
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`px-6 py-3 rounded-2xl flex items-center gap-2 font-bold text-xs uppercase tracking-widest ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                    {message.type === 'success' ? <CheckCircle2 size={16}/> : <AlertCircle size={16}/>}
                    {message.text}
                </motion.div>
            )}
        </AnimatePresence>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* SIDEBAR PARAMÈTRES */}
        <div className="space-y-2">
            {[
                { id: 'Compte', icon: User },
                { id: 'Notifications', icon: Bell },
                { id: 'Sécurité', icon: ShieldCheck },
                { id: 'Apparence', icon: Palette }
            ].map((tab) => (
                <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as Tab)}
                    className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] transition-all ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-xl translate-x-2' : 'text-slate-400 hover:bg-white hover:text-slate-900 dark:hover:bg-slate-800'}`}
                >
                    <tab.icon size={16} />
                    {tab.id}
                </button>
            ))}
        </div>

        {/* CONTENU DYNAMIQUE */}
        <div className="md:col-span-3">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-xl border border-slate-100 dark:border-slate-800 min-h-[500px]"
          >
            {/* --- ONGLET COMPTE --- */}
            {activeTab === 'Compte' && (
              <div className="space-y-8">
                <div className="flex items-center gap-4 pb-8 border-b border-slate-50 dark:border-slate-800">
                    <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600"><User size={30} /></div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Compte actif</p>
                        <p className="text-lg font-bold text-slate-900 dark:text-white">{userEmail}</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Prénom</label>
                    <input value={profile.first_name} onChange={e => setProfile({...profile, first_name: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-5 py-4 text-slate-900 dark:text-white font-bold focus:border-blue-500 outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nom</label>
                    <input value={profile.last_name} onChange={e => setProfile({...profile, last_name: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-5 py-4 text-slate-900 dark:text-white font-bold focus:border-blue-500 outline-none transition-all" />
                  </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Organisation</label>
                    <div className="relative">
                        <Building size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                        <input value={profile.company_name} onChange={e => setProfile({...profile, company_name: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl pl-12 pr-5 py-4 text-slate-900 dark:text-white font-bold focus:border-blue-500 outline-none transition-all" />
                    </div>
                </div>
                <button onClick={updateProfile} className="w-full bg-slate-900 dark:bg-blue-600 hover:bg-blue-600 text-white font-black py-5 rounded-2xl shadow-xl transition-all uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-2">
                  <Save size={18} /> Enregistrer le profil
                </button>
              </div>
            )}

            {/* --- ONGLET NOTIFICATIONS --- */}
            {activeTab === 'Notifications' && (
              <div className="space-y-8">
                <div className="pb-6 border-b border-slate-50 dark:border-slate-800">
                    <h3 className="text-xl font-black italic uppercase text-slate-900 dark:text-white">Alertes Email</h3>
                    <p className="text-slate-400 text-sm">Choisissez quand SoloCRM doit vous contacter.</p>
                </div>
                <div className="space-y-4">
                  {[
                    { id: 'notif_new_lead', label: 'Nouveau Lead assigné', desc: 'Recevoir un email dès qu\'un prospect est créé.' },
                    { id: 'notif_task_reminder', label: 'Rappels de tâches', desc: 'Notifications pour les tâches arrivant à échéance.' }
                  ].map((notif) => (
                    <div key={notif.id} className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 hover:border-blue-200 transition-all">
                      <div className="pr-4">
                        <p className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-tight">{notif.label}</p>
                        <p className="text-xs text-slate-400 font-medium">{notif.desc}</p>
                      </div>
                      <button 
                        onClick={() => setProfile({...profile, [notif.id]: !profile[notif.id as keyof typeof profile]})}
                        className={`w-14 h-8 rounded-full transition-all relative ${profile[notif.id as keyof typeof profile] ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}
                      >
                        <motion.div animate={{ x: profile[notif.id as keyof typeof profile] ? 24 : 4 }} className="w-6 h-6 bg-white rounded-full absolute top-1 shadow-sm" />
                      </button>
                    </div>
                  ))}
                </div>
                <button onClick={updateProfile} className="w-full bg-slate-900 dark:bg-blue-600 text-white font-black py-5 rounded-2xl uppercase tracking-widest text-xs mt-4">Enregistrer les préférences</button>
              </div>
            )}

            {/* --- ONGLET SÉCURITÉ --- */}
            {activeTab === 'Sécurité' && (
              <form onSubmit={handlePasswordUpdate} className="space-y-8">
                <div className="pb-6 border-b border-slate-50 dark:border-slate-800">
                    <h3 className="text-xl font-black italic uppercase text-slate-900 dark:text-white">Mot de passe</h3>
                    <p className="text-slate-400 text-sm">Sécurisez votre accès à la plateforme.</p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nouveau mot de passe</label>
                    <div className="relative">
                        <Lock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                        <input type="password" required value={passwords.new} onChange={e => setPasswords({...passwords, new: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl pl-12 pr-5 py-4 text-slate-900 dark:text-white font-bold focus:border-blue-500 outline-none transition-all" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirmer le mot de passe</label>
                    <div className="relative">
                        <Lock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                        <input type="password" required value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl pl-12 pr-5 py-4 text-slate-900 dark:text-white font-bold focus:border-blue-500 outline-none transition-all" />
                    </div>
                  </div>
                </div>
                <button type="submit" className="w-full bg-blue-600 hover:bg-slate-900 text-white font-black py-5 rounded-2xl uppercase tracking-widest text-xs shadow-xl shadow-blue-100 transition-all">Mettre à jour la sécurité</button>
              </form>
            )}

            {/* --- ONGLET APPARENCE --- */}
            {activeTab === 'Apparence' && (
              <div className="space-y-8">
                <div className="pb-6 border-b border-slate-50 dark:border-slate-800">
                    <h3 className="text-xl font-black italic uppercase text-slate-900 dark:text-white">Apparence</h3>
                    <p className="text-slate-400 text-sm">Personnalisez l'interface de votre espace de travail.</p>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { id: 'light', label: 'Mode Clair', icon: Sun, colors: 'bg-white border-slate-200' },
                    { id: 'dark', label: 'Mode Sombre', icon: Moon, colors: 'bg-slate-900 border-slate-800' }
                  ].map((t) => (
                    <button 
                      key={t.id}
                      onClick={() => setProfile({...profile, theme: t.id})}
                      className={`p-6 rounded-[2rem] border-4 transition-all flex flex-col items-center gap-4 ${profile.theme === t.id ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-900/20' : 'border-transparent bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                    >
                      <div className={`w-20 h-12 rounded-xl shadow-sm ${t.colors} flex items-center justify-center`}>
                        <t.icon size={20} className={t.id === 'dark' ? 'text-white' : 'text-slate-900'} />
                      </div>
                      <p className="font-black uppercase text-[10px] tracking-widest text-slate-900 dark:text-white">{t.label}</p>
                    </button>
                  ))}
                </div>
                <button onClick={updateProfile} className="w-full bg-slate-900 dark:bg-blue-600 text-white font-black py-5 rounded-2xl uppercase tracking-widest text-xs mt-4 transition-all">Appliquer le thème</button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}