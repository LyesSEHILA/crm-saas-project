"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import "./globals.css";
import { Users, LayoutDashboard, Rocket, LogOut, Briefcase, CheckSquare } from 'lucide-react';
import GlobalSearch from "@/components/GlobalSearch"; 

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

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Contacts', href: '/', icon: Users },
    { name: 'Entreprises', href: '/companies', icon: Briefcase },
    { name: 'Pipeline', href: '/pipeline', icon: Rocket },
    { name: 'Tâches', href: '/tasks', icon: CheckSquare },
  ];

  if (pathname === '/login') return <html lang="fr"><body>{children}</body></html>;

  if (loading) {
    return (
      <html lang="fr">
        <body className="h-screen flex items-center justify-center bg-white">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </body>
      </html>
    );
  }

  if (!session) {
    router.push('/login');
    return <html lang="fr"><body></body></html>;
  }

  return (
    <html lang="fr">
      <body className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
        
        {/* SIDEBAR : On s'assure qu'elle ne crée pas de voile sur le reste */}
        <aside className="w-72 bg-slate-950 text-white flex flex-col border-r border-slate-800 shadow-2xl relative z-50">
          
          {/* LOGO */}
          <div className="p-8 pb-4">
            <div className="flex items-center gap-3 text-2xl font-black tracking-tighter italic">
              <div className="bg-blue-600 p-2 rounded-xl not-italic shadow-lg shadow-blue-500/20">
                <Rocket size={22} className="text-white" />
              </div>
              <span>SOLO<span className="text-blue-500">CRM</span></span>
            </div>
          </div>

          {/* RECHERCHE GLOBALE */}
          <GlobalSearch />
          
          {/* NAVIGATION */}
          <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.name} 
                  href={item.href} 
                  className={`flex items-center gap-3 p-3.5 rounded-xl transition-all duration-200 font-bold group ${
                    isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <item.icon size={20} className={isActive ? 'text-white' : 'group-hover:text-blue-400'} />
                  <span className="uppercase text-[11px] tracking-widest">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* DÉCONNEXION */}
          <div className="p-4 border-t border-slate-900">
            <button 
              onClick={() => supabase.auth.signOut()}
              className="flex items-center gap-3 w-full p-3.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all font-black uppercase text-[10px] tracking-widest group"
            >
              <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
              Déconnexion
            </button>
          </div>
        </aside>

        {/* CONTENU PRINCIPAL : Fond solide pour éviter l'effet grisé */}
        <main className="flex-1 overflow-y-auto bg-slate-50 relative z-10">
            <div className="p-8">
              {children}
            </div>
        </main>

      </body>
    </html>
  );
}