"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Lock } from 'lucide-react';

export default function RegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 1. Supabase gère l'inscription, le hachage du mot de passe et le JWT
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { 
          first_name: firstName,
          last_name: lastName
        },
      },
    });

    if (error) {
      alert("Erreur d'inscription : " + error.message);
    } else {
      alert("Inscription réussie ! Vous pouvez maintenant vous connecter.");
      router.push('/login');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl p-10 border border-slate-100 dark:border-slate-800">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase italic">
            SOLO<span className="text-blue-600">CRM</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Créez votre compte (Utilisateur Standard)</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Prénom</label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input required type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl pl-12 pr-5 py-4 text-slate-900 dark:text-white font-bold outline-none focus:border-blue-500" placeholder="Jean" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nom</label>
              <div className="relative">
                <input required type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-5 py-4 text-slate-900 dark:text-white font-bold outline-none focus:border-blue-500" placeholder="Dupont" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email professionnel</label>
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl pl-12 pr-5 py-4 text-slate-900 dark:text-white font-bold outline-none focus:border-blue-500" placeholder="jean@entreprise.com" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mot de passe</label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl pl-12 pr-5 py-4 text-slate-900 dark:text-white font-bold outline-none focus:border-blue-500" placeholder="••••••••" />
            </div>
          </div>

          <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl uppercase text-xs tracking-[0.2em] transition-all disabled:opacity-50 mt-4">
            {loading ? "Création..." : "S'inscrire"}
          </button>
        </form>

        <p className="mt-8 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
          Déjà un compte ? <Link href="/login" className="text-blue-600 hover:underline">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}