'use client';

import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

export default function CalendarPage() {
  const [events, setEvents] = useState([]);

  // Fetch des tâches depuis ton Backend NestJS
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks`);
        const data = await res.json();
        
        // Formatage des données pour FullCalendar
        const formattedEvents = data.map((task: any) => ({
          id: task.id,
          title: task.title,
          date: task.due_date, // Format ISO : '2026-03-09T10:00:00Z'
          color: task.status === 'terminé' ? '#10b981' : '#3b82f6', // Vert si fini, Bleu sinon
        }));
        
        setEvents(formattedEvents);
      } catch (error) {
        console.error("Erreur de chargement des tâches :", error);
      }
    };

    fetchTasks();
  }, []);

  const handleDateClick = (arg: any) => {
    alert(`Créer une tâche pour le : ${arg.dateStr}`);
    // Ici, tu pourrais ouvrir un Modal pour créer une nouvelle tâche
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow-lg m-4">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
        📅 Mon Planning
      </h1>
      
      <div className="calendar-container">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          events={events}
          dateClick={handleDateClick}
          height="75vh"
          locale="fr" // Pour avoir les jours en Français
          eventClassNames="cursor-pointer rounded-md px-2 py-1 shadow-sm text-sm"
        />
      </div>
    </div>
  );
}