"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import "./globals.css";
import { 
  Users, 
  LayoutDashboard, 
  Rocket, 
  LogOut, 
  Briefcase, 
  CheckSquare, 
  Settings,
  FileText
} from 'lucide-react';
import GlobalSearch from "@/components/GlobalSearch"; 
import { Mail } from 'lucide-react'; // N'oublie pas d'importer l'icône !

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);
  // --- CORRECTION : Le rôle n'est jamais vide au démarrage ---
  const [userRole, setUserRole] = useState<string>('utilisateur standard'); 
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  // Gestion de la session, du thème et du rôle
  useEffect(() => {
    const initialize = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (session) {
        const { data } = await supabase
          .from('profiles')
          .select('theme, role') 
          .eq('id', session.user.id)
          .single();
        
        if (data) {
          // Gestion du thème
          if (data.theme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          
          // --- CORRECTION : Nettoyage du texte (minuscules + sans espaces) ---
          setUserRole(data.role?.trim().toLowerCase() || 'utilisateur standard');
        } else {
          // --- CORRECTION : Si le profil n'existe pas en base, rôle par défaut ---
          setUserRole('utilisateur standard');
        }
      }
      setLoading(false);
    };

    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [pathname]);

  // Ajout de allowedRoles pour chaque élément du menu
  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, allowedRoles: ['admin', 'commercial', 'utilisateur standard'] },
    { name: 'Contacts', href: '/', icon: Users, allowedRoles: ['admin', 'commercial'] },
    { name: 'Entreprises', href: '/companies', icon: Briefcase, allowedRoles: ['admin', 'commercial'] },
    { name: 'Pipeline', href: '/pipeline', icon: Rocket, allowedRoles: ['admin', 'commercial'] },
    { name: 'Tâches', href: '/tasks', icon: CheckSquare, allowedRoles: ['admin', 'commercial', 'utilisateur standard'] },
    { name: 'Factures', href: '/invoices', icon: FileText, allowedRoles: ['admin'] },
    { name: 'Campagnes', href: '/campaigns', icon: Mail, allowedRoles: ['admin', 'commercial'] },
    { name: 'Paramètres', href: '/settings', icon: Settings, allowedRoles: ['admin', 'commercial', 'utilisateur standard'] },
  ];

  // Fonction de déconnexion propre
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // Autoriser login ET register sans session
  const publicRoutes = ['/login', '/register'];
  if (publicRoutes.includes(pathname)) {
    return <html lang="fr"><body>{children}</body></html>;
  }

  if (loading) {
    return (
      <html lang="fr">
        <body className="h-screen flex items-center justify-center bg-white dark:bg-slate-950">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </body>
      </html>
    );
  }

  // Redirection si pas de session
  if (!session) {
    if (typeof window !== 'undefined') {
      router.push('/login');
    }
    return <html lang="fr"><body></body></html>;
  }

  return (
    <html lang="fr">
      <body className="flex h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 overflow-hidden transition-colors duration-300">
        
        <aside className="w-72 bg-slate-950 dark:bg-black text-white flex flex-col border-r border-slate-800 shadow-2xl relative z-50">
          <div className="p-8 pb-4">
            <div className="flex items-center gap-3 text-2xl font-black tracking-tighter italic">
              <div className="bg-blue-600 p-2 rounded-xl not-italic shadow-lg shadow-blue-500/20">
                <Rocket size={22} className="text-white" />
              </div>
              <span>SOLO<span className="text-blue-500">CRM</span></span>
            </div>
          </div>

          <GlobalSearch />
          
          <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto scrollbar-hide">
            {/* Filtre des items par rapport au userRole */}
            {navItems
              .filter(item => item.allowedRoles.includes(userRole))
              .map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link 
                    key={item.name} 
                    href={item.href} 
                    className={`flex items-center gap-3 p-3.5 rounded-xl transition-all duration-200 font-bold group ${
                      isActive 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                      : 'text-slate-400 hover:bg-slate-900 dark:hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <item.icon size={20} className={isActive ? 'text-white' : 'group-hover:text-blue-400'} />
                    <span className="uppercase text-[11px] tracking-widest">{item.name}</span>
                  </Link>
                );
            })}
          </nav>

          <div className="p-4 border-t border-slate-900">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 w-full p-3.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all font-black uppercase text-[10px] tracking-widest group"
            >
              <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
              Déconnexion
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 relative z-10 transition-colors duration-300">
            <div className="p-8">
              {children}
            </div>
        </main>
      </body>
    </html>
  );
}