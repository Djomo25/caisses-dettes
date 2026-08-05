# Carnet — frontend

PWA React + Vite + TypeScript pour le suivi de caisse et de dettes clients (commerçants informels à Kinshasa).

## Développement local

```bash
npm install
cp .env.example .env   # puis renseigner VITE_API_URL (URL du backend)
npm run dev
```

## Déploiement (Vercel)

Le dépôt est un monorepo (`backend/` + `frontend/`) : sur Vercel, créer le projet avec **Root Directory = `frontend`**.

1. **New Project** sur [vercel.com](https://vercel.com) → *Import Git Repository* → sélectionner ce dépôt.
2. Dans les options d'import, régler **Root Directory** sur `frontend`. Vercel détecte automatiquement le framework (Vite) — build command et output directory n'ont pas besoin d'être modifiés.
3. **Environment Variables** → ajouter `VITE_API_URL` avec l'URL du backend déployé (ex. `https://caisses-dettes-production.up.railway.app`), sans slash final.
4. `vercel.json` (à la racine de `frontend/`) redirige toutes les routes vers `index.html`, nécessaire pour que le routing côté client (React Router) fonctionne sur un rechargement ou un lien direct (`/caisse`, `/dettes`, etc.).
5. Déployer. Une fois en ligne, mettre à jour `FRONTEND_URL` sur le service backend (Railway) avec l'URL Vercel finale, pour restreindre le CORS (au lieu de `*`).

### Note PWA

`vite-plugin-pwa` génère le service worker et le manifeste automatiquement au build (`registerType: 'autoUpdate'`) — aucune configuration Vercel additionnelle n'est nécessaire pour ça.
