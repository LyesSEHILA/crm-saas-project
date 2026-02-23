"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // 1. Vérifier la session actuelle
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // 2. Écouter les changements de connexion
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Si on est sur la page login, on affiche juste le contenu (le formulaire)
  if (pathname === '/login') return <html lang="fr"><body>{children}</body></html>;

  // Pendant le chargement, on peut mettre un petit spinner
  if (loading) return <html lang="fr"><body><div className="h-screen flex items-center justify-center">Chargement...</div></body></html>;

  // Si pas de session, on redirige vers /login
  if (!session) {
    router.push('/login');
    return <html lang="fr"><body></body></html>;
  }

  return (
    <html lang="fr">
      <body className="flex h-screen bg-slate-50">
        <aside className="w-64 bg-slate-900 text-white flex flex-col p-6">
          <div className="text-2xl font-black mb-10 text-blue-400">SOLO<span className="text-white">CRM</span></div>
          <nav className="flex-1 space-y-2">
            <Link href="/" className="block p-3 rounded-lg hover:bg-slate-800 transition">👥 Contacts</Link>
            <Link href="/pipeline" className="block p-3 rounded-lg hover:bg-slate-800 transition">🚀 Pipeline</Link>
            <Link href="/dashboard" className="block p-3 rounded-lg hover:bg-slate-800 transition">📊 Dashboard</Link>
          </nav>
          <button 
            onClick={() => supabase.auth.signOut()}
            className="mt-10 text-sm text-slate-400 hover:text-white transition text-left"
          >
            Déconnexion 👋
          </button>
        </aside>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </body>
    </html>
  );
}