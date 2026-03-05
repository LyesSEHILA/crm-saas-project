"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

  // Fonction pour changer le statut en "payée"
  async function handleMarkAsPaid(id: string) {
    if (!confirm("Confirmer la réception du paiement pour cette facture ?")) return;

    const { error } = await supabase
      .from('invoices')
      .update({ status: 'payée' })
      .eq('id', id);

    if (error) {
      console.error("Erreur lors de la mise à jour:", error);
    } else {
      // On rafraîchit la liste localement pour voir le changement direct
      setInvoices(invoices.map(inv => inv.id === id ? { ...inv, status: 'payée' } : inv));
    }
  }

  const generatePDF = (inv: any) => {
    const doc = new jsPDF();
    const primaryColor = [37, 99, 235]; // Bleu SoloCRM
    const darkColor = [30, 41, 59];    // Slate-800
    const lightBg = [248, 250, 252];   // Slate-50

    // --- 1. BANDEAU HAUT ---
    doc.setFillColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.rect(0, 0, 210, 45, 'F');

    // --- 2. LOGO ---
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.text("SOLO", 20, 28);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("CRM", 58, 28);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(160);
    doc.text("SOLUTIONS DE GESTION INTELLIGENTE", 20, 35);

    // --- 3. BADGE DE STATUT ---
    const isPaid = inv.status === 'payée';
    const statusColor = isPaid ? [16, 185, 129] : [249, 115, 22];
    doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.roundedRect(140, 18, 50, 12, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(inv.status.toUpperCase(), 165, 26, { align: "center" });

    // --- 4. BLOCS INFOS ---
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("ÉMETTEUR", 20, 60);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text("SoloCRM International", 20, 66);
    doc.text("123 Avenue du Code, Paris", 20, 71);
    doc.text("contact@solocrm.com", 20, 76);

    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.setFont("helvetica", "bold");
    doc.text("DESTINATAIRE", 120, 60);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(`${inv.contacts?.first_name} ${inv.contacts?.last_name}`, 120, 66);
    doc.text(inv.contacts?.email || "Email non renseigné", 120, 71);
    doc.text(inv.contacts?.phone || "", 120, 76);

    doc.setDrawColor(230);
    doc.line(20, 85, 190, 85);
    
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text(`NUMÉRO DE FACTURE :`, 20, 95);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.setFont("helvetica", "bold");
    doc.text(inv.invoice_number, 60, 95);

    doc.setTextColor(150);
    doc.setFont("helvetica", "normal");
    doc.text(`DATE D'ÉMISSION :`, 20, 101);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text(new Date(inv.created_at).toLocaleDateString(), 60, 101);

    // --- 5. TABLEAU ---
    autoTable(doc, {
      startY: 110,
      head: [['DESCRIPTION', 'QTÉ', 'PRIX UNITAIRE', 'MONTANT HT']],
      body: [
        ['Prestation de services digitaux (SoloCRM)', '1', `${inv.amount} €`, `${inv.amount} €`],
        ['Support technique inclus (30 jours)', '1', '0.00 €', 'OFFERT'],
      ],
      headStyles: { fillColor: [40, 40, 40], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center' },
      columnStyles: { 0: { cellWidth: 80 }, 1: { halign: 'center' }, 2: { halign: 'right' }, 3: { halign: 'right', fontStyle: 'bold' } },
      styles: { font: "helvetica", fontSize: 10, cellPadding: 6 },
      alternateRowStyles: { fillColor: [250, 250, 250] },
      margin: { left: 20, right: 20 }
    });

    // --- 6. RÉCAPITULATIF FINAL ---
    const finalY = (doc as any).lastAutoTable.finalY + 20;
    const amountFormatted = Number(inv.amount).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + " €";

    doc.setFillColor(245, 247, 250);
    doc.roundedRect(115, finalY - 10, 75, 30, 2, 2, 'F');
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.setFont("helvetica", "normal");
    doc.text("TOTAL NET :", 120, finalY);
    doc.text(amountFormatted, 185, finalY, { align: "right" });
    
    doc.setDrawColor(220);
    doc.line(120, finalY + 4, 185, finalY + 4);

    doc.setFontSize(12);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont("helvetica", "bold");
    doc.text("TOTAL À PAYER", 120, finalY + 12);
    doc.text(amountFormatted, 185, finalY + 12, { align: "right" });

    // --- 7. PIED DE PAGE ---
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(180);
    doc.text("SoloCRM - SIRET : 123 456 789 00001", 105, 275, { align: "center" });
    doc.text("TVA non applicable, art. 293 B du CGI - Conditions de paiement : 30 jours.", 105, 280, { align: "center" });
    
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 290, 210, 7, 'F');

    doc.save(`SoloCRM_Facture_${inv.invoice_number}.pdf`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center gap-4 mb-10">
          <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-500/20">
            <FileText size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white italic uppercase tracking-tighter leading-none">
              Facturation
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Suivi automatique des revenus générés.</p>
          </div>
        </header>

        <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 uppercase tracking-[0.3em] font-black">
                <th className="p-8">N° de Document</th>
                <th className="p-8">Client</th>
                <th className="p-8 text-center">Montant</th>
                <th className="p-8">Statut du paiement</th>
                <th className="p-8 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors group">
                  <td className="p-8 font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">
                    {inv.invoice_number}
                  </td>
                  <td className="p-8">
                    <div className="font-bold text-slate-700 dark:text-slate-200">
                      {inv.contacts?.first_name} {inv.contacts?.last_name}
                    </div>
                    <div className="text-[10px] font-medium text-slate-400">{inv.contacts?.email}</div>
                  </td>
                  <td className="p-8 text-center">
                    <div className="inline-flex items-center gap-1 font-black text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-4 py-1.5 rounded-xl">
                      {Number(inv.amount).toLocaleString()} €
                    </div>
                  </td>
                  <td className="p-8">
                    <div className="flex items-center gap-2">
                      {inv.status === 'payée' ? (
                        <CheckCircle size={14} className="text-emerald-500" />
                      ) : (
                        <Clock size={14} className="text-orange-500 animate-pulse" />
                      )}
                      <span className={`text-[10px] font-black uppercase tracking-widest ${
                        inv.status === 'payée' 
                        ? 'text-emerald-600' 
                        : 'text-orange-600'
                      }`}>
                        {inv.status}
                      </span>
                    </div>
                  </td>
                  <td className="p-8 text-right">
                    <div className="flex justify-end gap-2">
                      {/* --- NOUVEAU BOUTON : Marquer comme payée --- */}
                      {inv.status !== 'payée' && (
                        <button 
                          onClick={() => handleMarkAsPaid(inv.id)}
                          className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-xl transition-all group"
                          title="Marquer comme payée"
                        >
                          <CheckCircle size={18} className="group-hover:scale-110 transition-transform" />
                        </button>
                      )}

                      {/* Bouton Télécharger PDF */}
                      <button 
                        onClick={() => generatePDF(inv)}
                        className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        title="Télécharger le PDF"
                      >
                        <Download size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {invoices.length === 0 && !loading && (
            <div className="p-24 text-center">
              <div className="inline-flex p-4 bg-slate-50 dark:bg-slate-800 rounded-full mb-4">
                <TrendingUp size={32} className="text-slate-300" />
              </div>
              <p className="text-slate-400 font-bold italic max-w-xs mx-auto">
                Aucune facture générée. <br/> 
                <span className="text-blue-600">Gagnez une opportunité</span> dans votre pipeline pour déclencher une facture automatique ! 🚀
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}