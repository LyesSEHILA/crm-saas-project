# 🚀 SoloCRM - Solution SaaS de Gestion Client & Marketing Automation

**SoloCRM** est un CRM moderne et performant conçu pour optimiser la gestion des relations clients et automatiser les processus de vente.

## 🛠️ Stack Technique

L'application repose sur une architecture découplée (Full-Stack) robuste :

* **Frontend :** [Next.js 15+](https://nextjs.org/) (React) avec **Tailwind CSS** pour une interface moderne et responsive.
* **Backend :** [NestJS](https://nestjs.com/) (Node.js) pour une API REST structurée et scalable.
* **Base de Données :** [Supabase](https://supabase.com/) (PostgreSQL) pour le stockage des données et l'authentification.
* **Emailing :** API [Brevo](https://www.brevo.com/) pour l'automatisation marketing.
* **Déploiement :** **Vercel** (Frontend) et **Render** (Backend).

---

## ✨ Fonctionnalités Clés

### 📊 Dashboard Analytique (BI)

* Suivi en temps réel du **Chiffre d'Affaires** estimé.
* Calcul automatique du **Taux de Conversion** des leads.
* Visualisation du funnel de vente par barres de progression.

### 🚀 Pipeline Commercial (Kanban)

* Gestion visuelle des opportunités de vente.
* Suivi des statuts : *Nouveau, En cours, Converti, Perdu*.
* Interface intuitive pour déplacer les leads dans le cycle de vente.

### 👥 Gestion des Contacts & Leads

* CRUD complet (Création, Lecture, Mise à jour, Suppression) des clients.
* Association dynamique entre contacts et opportunités commerciales.

### 📧 Marketing Automation

* Envoi automatique d'un **Email de Bienvenue** via l'API Brevo lors de la création d'un nouveau contact.
* Notifications professionnelles personnalisées.

### 🔐 Sécurité & Authentification

* Accès sécurisé via **Supabase Auth**.
* Protection des routes et gestion des sessions persistantes.

---

## ⚙️ Installation & Configuration

### Pré-requis

* Node.js (v18+)
* Un compte Supabase & Brevo

### Installation

1. **Cloner le dépôt :**
```bash
git clone https://github.com/LyesSEHILA/crm-saas-project.git
cd crm-saas-project

```


2. **Configurer le Backend :**
```bash
cd backend
npm install
# Créer un fichier .env avec vos clés (SUPABASE_URL, SUPABASE_KEY, BREVO_API_KEY)
npm run start:dev

```


3. **Configurer le Frontend :**
```bash
cd ../frontend
npm install
# Créer un fichier .env.local (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
npm run dev

```



---

## 🌍 Liens de Déploiement

* **Application (Frontend) :** `crm-saas-project-kjze.vercel.app`
* **API (Backend) :** `https://crm-saas-project.onrender.com`

---

## 👤 Auteur

* **Lyes Sehila** 

---
