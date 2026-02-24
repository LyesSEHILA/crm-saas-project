"use client";
import React, { useState, useEffect } from 'react';
import { Search, User, Building2, Rocket, X } from 'lucide-react'; // On utilise Rocket pour le pipeline
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length > 1) {
        const res = await fetch(`http://localhost:3000/search?q=${query}`);
        setResults(await res.json());
        setIsOpen(true);
      } else {
        setResults(null);
        setIsOpen(false);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // Fonction de redirection forcée
  const handleNavigate = (path: string) => {
    setIsOpen(false);
    setQuery('');
    router.push(path);
  };

  return (
    <div className="relative w-full px-4 mb-6">
      <div className="relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={16} />
        <input
          type="text"
          placeholder="Rechercher..."
          className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold text-white placeholder:text-slate-600 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <X 
            size={14} 
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-slate-500 hover:text-white" 
            onClick={() => setQuery('')} 
          />
        )}
      </div>

      <AnimatePresence>
        {isOpen && results && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="absolute left-4 right-4 mt-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-[100] p-3 max-h-96 overflow-y-auto"
          >
            {/* CONTACTS -> Redirige vers / (ta page contacts) */}
            {results.contacts.length > 0 && (
              <div className="mb-3">
                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2 px-2">Contacts</p>
                {results.contacts.map((c: any) => (
                  <button key={c.id} onClick={() => handleNavigate('/')} className="w-full flex items-center gap-3 p-2 hover:bg-slate-800 rounded-lg transition-colors text-left">
                    <User size={14} className="text-blue-500" />
                    <span className="text-xs font-bold text-slate-300">{c.first_name} {c.last_name}</span>
                  </button>
                ))}
              </div>
            )}

            {/* ENTREPRISES -> Redirige vers /companies */}
            {results.companies.length > 0 && (
              <div className="mb-3">
                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2 px-2">Entreprises</p>
                {results.companies.map((c: any) => (
                  <button key={c.id} onClick={() => handleNavigate('/companies')} className="w-full flex items-center gap-3 p-2 hover:bg-slate-800 rounded-lg transition-colors text-left">
                    <Building2 size={14} className="text-slate-500" />
                    <span className="text-xs font-bold text-slate-300">{c.name}</span>
                  </button>
                ))}
              </div>
            )}

            {/* LEADS -> Redirige vers /pipeline */}
            {results.leads.length > 0 && (
              <div>
                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2 px-2">Pipeline</p>
                {results.leads.map((l: any) => (
                  <button key={l.id} onClick={() => handleNavigate('/pipeline')} className="w-full flex items-center gap-3 p-2 hover:bg-slate-800 rounded-lg transition-colors text-left">
                    <Rocket size={14} className="text-emerald-500" />
                    <span className="text-xs font-bold text-slate-300">{l.title}</span>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}