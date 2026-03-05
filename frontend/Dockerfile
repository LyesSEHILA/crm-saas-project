# 1. Image Node.js
FROM node:18-alpine

# 2. Dossier de travail
WORKDIR /app

# 3. Copier et installer les dépendances
COPY package*.json ./
RUN npm install

# 4. Copier le code
COPY . .

# 5. Variables d'environnement factices pour que Next.js accepte de compiler
# (Elles seront remplacées par les vraies au démarrage)
ARG NEXT_PUBLIC_SUPABASE_URL="https://placeholder.supabase.co"
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY="placeholder"
ARG NEXT_PUBLIC_API_URL="http://localhost:3000"

# 6. Compiler l'application Next.js
RUN npm run build

# 7. Exposer le port par défaut de Next.js
EXPOSE 3000

# 8. Démarrer l'application
CMD ["npm", "start"]