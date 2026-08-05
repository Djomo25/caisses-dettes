# Carnet — backend

API NestJS + Prisma pour le suivi de caisse et de dettes clients (commerçants informels à Kinshasa).

## Développement local

```bash
npm install
cp .env.example .env   # puis renseigner DATABASE_URL, JWT_SECRET, RESEND_API_KEY
npx prisma migrate deploy
npm run start:dev
```

`GET /health` retourne `{ status: "ok", db: true|false }`.

### Emails

L'envoi des codes de connexion passe par [Resend](https://resend.com) (API HTTPS), pas par du SMTP classique :
Railway et la plupart des PaaS bloquent les ports SMTP sortants (25/465/587) sur les plans standards, ce qui
casse nodemailer en production. Resend contourne ce blocage puisqu'il n'utilise que des requêtes HTTPS.

Pour développer en local, crée un compte gratuit sur [resend.com](https://resend.com), génère une clé API
(*API Keys* → *Create API Key*), et mets-la dans `RESEND_API_KEY`. Sans domaine vérifié, Resend impose
`onboarding@resend.dev` comme expéditeur et limite l'envoi à l'adresse email du compte Resend — suffisant
pour tester. Pour envoyer à n'importe quel destinataire (production), vérifier un domaine dans Resend
(*Domains* → *Add Domain*, puis ajouter les enregistrements DNS fournis) et utiliser une adresse de ce
domaine dans `MAIL_FROM`.

## Variables d'environnement

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | Chaîne de connexion PostgreSQL |
| `PORT` | Port d'écoute (injecté automatiquement par Railway) |
| `FRONTEND_URL` | Origine autorisée en CORS (URL du frontend déployé) |
| `JWT_SECRET` | Secret de signature des tokens JWT (30 jours de validité) |
| `RESEND_API_KEY` | Clé API Resend pour l'envoi des codes de connexion par email |
| `MAIL_FROM` | Adresse expéditeur (ex. `Carnet <no-reply@tondomaine.com>`) |

## Déploiement (Railway)

Le dépôt est un monorepo (`backend/` + `frontend/`) : sur Railway, créer le service avec **Root Directory = `backend`**.

1. **Nouveau projet Railway** → *Deploy from GitHub repo* → sélectionner ce dépôt, `Root Directory: backend`.
2. **Ajouter une base de données** → *New* → *Database* → *PostgreSQL*. Railway crée la variable `DATABASE_URL` sur ce service Postgres.
3. Sur le service backend, onglet **Variables**, ajouter :
   - `DATABASE_URL` → référencer `${{Postgres.DATABASE_URL}}` (autocomplétion Railway)
   - `JWT_SECRET` → une valeur aléatoire forte, différente de celle utilisée en local (`openssl rand -hex 32`)
   - `FRONTEND_URL` → l'URL du frontend une fois déployé (ex. `https://carnet.vercel.app`)
   - `RESEND_API_KEY` → clé API Resend (voir section *Emails* ci-dessus). Sans ça, les commerçants ne reçoivent jamais leur code de connexion.
   - `MAIL_FROM` → une adresse d'un domaine vérifié dans Resend (ex. `Carnet <no-reply@tondomaine.com>`)
   - `PORT` → `3000` (fixe cette valeur explicitement : le champ "port cible" utilisé pour générer le domaine public ne synchronise pas automatiquement la variable `PORT` de l'app, il faut que les deux correspondent).
4. Railway détecte Node.js via Nixpacks et lit `railway.json` à la racine de `backend/` : au déploiement, il exécute `npx prisma migrate deploy` (applique les migrations sur la base de prod) puis démarre l'app avec `npm run start:prod`. Le healthcheck interroge `/health`.
5. **Settings → Networking → Generate Domain** : entre `3000` comme port cible (même valeur que la variable `PORT` ci-dessus).
6. Une fois déployé, vérifier `https://<ton-service>.up.railway.app/health` → doit répondre `{"status":"ok","db":true}`.

### Migrations futures

Chaque nouveau déploiement ré-exécute `prisma migrate deploy`, qui applique uniquement les migrations pas encore appliquées — pas besoin d'étape manuelle après un `git push`.
