"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // Importation directe de la fonction

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, []);

  async function fetchInvoices() {
    const { data } = await supabase
      .from('invoices')
      .select('*, contacts(first_name, last_name, email, phone)')
      .order('created_at', { ascending: false });
    setInvoices(data || []);
    setLoading(false);
  }

  // --- FONCTION DE GÉNÉRATION DE PDF CORRIGÉE ---
  const generatePDF = (inv: any) => {
    const doc = new jsPDF();
    const date = new Date(inv.created_at).toLocaleDateString();
    const dueDate = new Date(inv.due_date).toLocaleDateString();

    // 1. En-tête (Logo & Entreprise)
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(37, 99, 235); // Bleu SoloCRM
    doc.text("SOLOCRM", 20, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.setFont("helvetica", "normal");
    doc.text("Logiciel de gestion commerciale intelligent", 20, 27);

    // 2. Infos Facture
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Facture N° : ${inv.invoice_number}`, 140, 20);
    doc.text(`Date : ${date}`, 140, 27);
    doc.text(`Échéance : ${dueDate}`, 140, 34);

    // 3. Infos Client
    doc.setFont("helvetica", "bold");
    doc.text("DESTINATAIRE :", 20, 50);
    doc.setFont("helvetica", "normal");
    doc.text(`${inv.contacts?.first_name} ${inv.contacts?.last_name}`, 20, 57);
    doc.text(inv.contacts?.email || "", 20, 64);
    if (inv.contacts?.phone) doc.text(inv.contacts.phone, 20, 71);

    // 4. Utilisation de la fonction autoTable directement (Correctif ici)
    autoTable(doc, {
      startY: 85,
      head: [['Description', 'Quantité', 'Prix Unitaire', 'Total']],
      body: [
        [`Prestation de service liée au lead : ${inv.lead_id}`, '1', `${inv.amount} €`, `${inv.amount} €`]
      ],
      headStyles: { fillColor: [37, 99, 235] },
      theme: 'grid'
    });

    // 5. Total final
    // Récupération de la position de fin du tableau
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFont("helvetica", "bold");
    doc.text(`TOTAL À PAYER : ${inv.amount.toLocaleString()} €`, 140, finalY);

    // 6. Pied de page
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text("Merci pour votre confiance. En cas de retard, des pénalités pourront s'appliquer.", 105, 280, { align: "center" });

    // 7. Téléchargement
    doc.save(`${inv.invoice_number}_${inv.contacts?.last_name}.pdf`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white italic uppercase tracking-tighter">
            Factures <span className="text-blue-600">& Revenus</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Gérez vos documents financiers et paiements.</p>
        </header>

        <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] font-black">
                <th className="p-8">N° Facture</th>
                <th className="p-8">Client</th>
                <th className="p-8">Montant</th>
                <th className="p-8">Statut</th>
                <th className="p-8 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors">
                  <td className="p-8 font-black text-slate-900 dark:text-white">{inv.invoice_number}</td>
                  <td className="p-8">
                    <div className="text-sm font-bold text-slate-600 dark:text-slate-300">
                      {inv.contacts?.first_name} {inv.contacts?.last_name}
                    </div>
                  </td>
                  <td className="p-8 font-black text-blue-600">{inv.amount ? inv.amount.toLocaleString() : 0} €</td>
                  <td className="p-8">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      inv.status === 'payée' 
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' 
                      : 'bg-orange-50 text-orange-600 dark:bg-orange-900/20'
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="p-8 text-right">
                    <button 
                      onClick={() => generatePDF(inv)}
                      className="p-3 text-slate-300 dark:text-slate-600 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                    >
                      <Download size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {invoices.length === 0 && !loading && (
            <div className="p-20 text-center text-slate-400 font-bold italic">
              Aucune facture générée. Convertissez un lead pour commencer ! 🚀
            </div>
          )}
        </div>
      </div>
    </div>
  );
}