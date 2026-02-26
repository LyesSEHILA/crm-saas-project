# 🚀 SoloCRM - Solution SaaS de Gestion Client & Marketing Automation

**SoloCRM** est un CRM moderne et performant conçu pour optimiser la gestion des relations clients et automatiser les processus de vente.

## 🛠️ Stack Technique

L'application repose sur une architecture Full-Stack robuste et animée :

* **Frontend :** [Next.js 15+](https://nextjs.org/) (React) avec **Tailwind CSS**.
* **Animations & UI :** [Framer Motion](https://www.framer.com/motion/) pour les transitions fluides et [Lucide React](https://lucide.dev/) pour l'iconographie.
* **Charts :** [Recharts](https://recharts.org/) pour la visualisation des données.
* **Drag & Drop :** [@hello-pangea/dnd](https://github.com/hello-pangea/dnd) pour le pipeline Kanban.
* **Backend :** [NestJS](https://nestjs.com/) (Node.js) avec architecture modulaire (Leads, Contacts, Companies, Tasks, Stats).
* **Base de Données :** [Supabase](https://supabase.com/) (PostgreSQL) et authentification.
* **Déploiement :** **Vercel** (Frontend) et **Render** (Backend).

---

## ✨ Fonctionnalités Clés

### 📊 Dashboard Analytique & BI

* Suivi en temps réel : Chiffre d'Affaires, Taux de Conversion, Contacts et Entreprises.
* **Visualisation de données :** Graphique de tendance des revenus généré dynamiquement via l'API Stats.
* **Tâches prioritaires :** Affichage des rappels immédiats directement sur le tableau de bord.

### 🚀 Pipeline Commercial (Kanban)

* **Gestion visuelle :** Système de drag-and-drop pour déplacer les opportunités entre les colonnes (*Nouveau, En cours, Converti, Perdu*).
* **Historique :** Ajout de notes de suivi et commentaires sur chaque affaire.
* **Exportation :** Fonctionnalité d'exportation des leads au format CSV.

### 👥 Répertoire Client complet

* **Contacts :** Gestion des clients avec association dynamique aux entreprises.
* **Entreprises Partenaires :** Module dédié pour gérer les organisations, secteurs d'activité et sites web.

### 📋 Rappels & Gestion des Tâches

* Planification de missions liées à des contacts spécifiques.
* Suivi d'état (À faire / Terminé) avec interface interactive.

### 🔎 Recherche Globale & UX

* **Global Search :** Barre de recherche intelligente accessible partout pour trouver contacts, leads ou entreprises instantanément.
* **Mode Sombre :** Support complet du thème Dark/Light basé sur les préférences système ou le choix utilisateur.

### 📧 Marketing Automation

* Intégration de l'API **Brevo** pour l'envoi automatique d'emails de bienvenue.

---

## ⚙️ Installation & Configuration

### Pré-requis

* Node.js (v18+)
* Un compte Supabase & Brevo

### Configuration du Backend

1. Aller dans le dossier `backend` : `cd backend`
2. Installer les dépendances : `npm install`
3. Créer un fichier `.env` :
```env
SUPABASE_URL=votre_url
SUPABASE_KEY=votre_cle_service_role
BREVO_API_KEY=votre_cle_api
PORT=3000

```


4. Lancer le serveur : `npm run start:dev`

### Configuration du Frontend

1. Aller dans le dossier `frontend` : `cd ../frontend`
2. Installer les dépendances : `npm install`
3. Créer un fichier `.env.local` :
```env
NEXT_PUBLIC_SUPABASE_URL=votre_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon
NEXT_PUBLIC_API_URL=http://localhost:3000

```


4. Lancer l'application : `npm run dev`

---

## 🌍 Liens de Déploiement

* **Application (Frontend) :** `crm-saas-project-kjze.vercel.app`
* **API (Backend) :** `https://crm-saas-project.onrender.com`

---

## 👤 Auteur

* **Lyes Sehila**
