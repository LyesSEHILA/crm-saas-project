"use client";
import React, { useState, useEffect } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths 
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    // 1. On récupère l'utilisateur connecté
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    // 2. On ajoute le filtre .eq('user_id', user.id)
    const { data } = await supabase
      .from('tasks')
      .select('*, contacts(first_name, last_name)')
      .eq('user_id', user.id); // Isolation des données
      
    setTasks(data || []);
    setLoading(false);
  }

  // ... (Le reste du code reste strictement identique)
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        
        {/* Header du Calendrier */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white italic uppercase tracking-tighter">
              Planning <span className="text-blue-600">& Échéances</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Visualisez vos tâches et rendez-vous.</p>
          </div>

          <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-2 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-600 dark:text-slate-400">
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm font-black uppercase tracking-widest min-w-[140px] text-center text-slate-900 dark:text-white">
              {format(currentMonth, 'MMMM yyyy', { locale: fr })}
            </span>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-600 dark:text-slate-400">
              <ChevronRight size={20} />
            </button>
          </div>
        </header>

        {/* Grille du Calendrier */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
          
          {/* Jours de la semaine */}
          <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-800">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
              <div key={day} className="p-4 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                {day}
              </div>
            ))}
          </div>

          {/* Jours du mois */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day, idx) => {
              const dayTasks = tasks.filter(t => isSameDay(new Date(t.due_date), day));
              const isCurrentMonth = isSameMonth(day, monthStart);
              const isToday = isSameDay(day, new Date());

              return (
                <div 
                  key={idx} 
                  className={`min-h-[140px] p-4 border-r border-b border-slate-50 dark:border-slate-800/50 transition-colors ${
                    !isCurrentMonth ? 'bg-slate-50/50 dark:bg-slate-950/20 opacity-30' : ''
                  } ${isToday ? 'bg-blue-50/30 dark:bg-blue-900/5' : ''}`}
                >
                  <span className={`text-sm font-black ${isToday ? 'text-blue-600' : 'text-slate-400 dark:text-slate-600'}`}>
                    {format(day, 'd')}
                  </span>

                  <div className="mt-2 space-y-1">
                    {dayTasks.map((task) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -5 }} 
                        animate={{ opacity: 1, x: 0 }}
                        key={task.id} 
                        className="p-2 bg-blue-600 text-white rounded-lg shadow-sm group cursor-pointer hover:bg-blue-700 transition-all"
                      >
                        <p className="text-[10px] font-bold leading-tight truncate">{task.title}</p>
                        <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Clock size={8} />
                          <span className="text-[8px] font-black uppercase tracking-tighter">
                            {task.contacts ? `${task.contacts.first_name}` : 'A faire'}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}