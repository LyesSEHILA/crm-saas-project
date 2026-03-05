# 1. Utiliser une image Node.js légère
FROM node:18-alpine

# 2. Définir le dossier de travail dans le conteneur
WORKDIR /app

# 3. Copier d'abord les fichiers de configuration npm
COPY package*.json ./

# 4. Installer les dépendances
RUN npm install

# 5. Copier tout le reste du code source
COPY . .

# 6. Compiler l'application NestJS (TypeScript -> JavaScript)
RUN npm run build

# 7. Exposer le port sur lequel l'API écoute
EXPOSE 3000

# 8. Commande pour démarrer l'API en mode production
CMD ["npm", "run", "start:prod"]