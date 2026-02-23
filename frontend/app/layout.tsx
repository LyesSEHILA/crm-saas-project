"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import "./globals.css";
import { Users, LayoutDashboard, Rocket, LogOut, Building2, CheckSquare  } from 'lucide-react';
import { Briefcase } from 'lucide-react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Liste des liens de navigation pour éviter la répétition
  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Contacts', href: '/', icon: Users },
    { name: 'Entreprises', href: '/companies', icon: Briefcase },
    { name: 'Pipeline', href: '/pipeline', icon: Rocket },
    { name: 'Tâches', href: '/tasks', icon: CheckSquare },
  ];

  // 1. Cas : Page de Login (Pas de sidebar)
  if (pathname === '/login') {
    return (
      <html lang="fr">
        <body>{children}</body>
      </html>
    );
  }

  // 2. Cas : Chargement
  if (loading) {
    return (
      <html lang="fr">
        <body>
          <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-slate-500 font-medium">Chargement de SoloCRM...</p>
          </div>
        </body>
      </html>
    );
  }

  // 3. Cas : Pas de session (Redirection)
  if (!session) {
    router.push('/login');
    return <html lang="fr"><body></body></html>;
  }

  // 4. Cas : Utilisateur connecté (Interface complète)
  return (
    <html lang="fr">
      <body className="flex h-screen bg-slate-50 font-sans text-slate-900">
        
        {/* SIDEBAR DESIGN PRO */}
        <aside className="w-72 bg-slate-950 text-white flex flex-col border-r border-slate-800 shadow-2xl">
          
          {/* LOGO SECTION */}
          <div className="p-8">
            <div className="flex items-center gap-3 text-2xl font-black tracking-tighter italic">
              <div className="bg-blue-600 p-2 rounded-xl not-italic shadow-lg shadow-blue-500/20">
                <Rocket size={22} className="text-white" />
              </div>
              <span>SOLO<span className="text-blue-500">CRM</span></span>
            </div>
          </div>
          
          {/* NAVIGATION */}
          <nav className="flex-1 px-4 space-y-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.name} 
                  href={item.href} 
                  className={`flex items-center gap-3 p-3.5 rounded-xl transition-all duration-200 font-medium group ${
                    isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <item.icon size={20} className={isActive ? 'text-white' : 'group-hover:text-blue-400'} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* FOOTER / USER SECTION */}
          <div className="p-4 mt-auto border-t border-slate-900">
            <button 
              onClick={() => supabase.auth.signOut()}
              className="flex items-center gap-3 w-full p-3.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all duration-200 font-semibold group"
            >
              <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
              Déconnexion
            </button>
          </div>
        </aside>

        {/* ZONE DE CONTENU PRINCIPAL */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          <div className="min-h-full">
            {children}
          </div>
        </main>

      </body>
    </html>
  );
}