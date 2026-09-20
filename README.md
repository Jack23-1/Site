# ONIP — Site web

Le projet est séparé en deux applications, gérées par npm workspaces :

- `frontend/` : interface React, Vite, styles et ressources publiques.
- `backend/` : API Express, PostgreSQL/Prisma, administration des données, médias et tests d’intégration.

## Installation

Depuis la racine, avec Node.js 20.9 ou ultérieur compatible avec Prisma 6 :

```sh
npm ci
npm run db:generate
```

Pour une nouvelle installation avec PostgreSQL local :

```sh
npm run db:local
npm run db:migrate
npm run admin:create -- --email admin@onip.gouv.cd
```

La configuration privée se trouve dans `backend/.env` (modèle : `backend/.env.example`). Les données existantes sont conservées dans `backend/.local-postgres/`, les fichiers importés dans `backend/.local-media/`.

## Développement

Dans deux terminaux, depuis la racine :

```sh
npm run dev:api
```

```sh
npm run dev
```

Site : http://localhost:5173 — administration : http://localhost:5173/admin. Le frontend transmet `/api` au backend sur le port 3001.

On peut aussi lancer `npm run dev` directement dans chacun des dossiers `frontend/` et `backend/`.

## Vérification

```sh
npm run lint
npm run build
npm run test:language
npm run test:api
npm run test:browser
```

Les tests API et navigateur nécessitent la base locale et `TEST_DATABASE_URL` dans `backend/.env`. Ils utilisent des schémas temporaires isolés.

## Production

Configurer PostgreSQL et les variables de `backend/.env`, puis, depuis la racine :

```sh
npm ci
npm run db:generate
npm run db:migrate
npm run build
NODE_ENV=production npm start
```

La compilation est générée dans `frontend/dist/` et servie par le backend sur la même origine que l’API. Conserver les deux dossiers côte à côte pour ce mode de déploiement.

Voir le [guide backend](backend/docs/administration.md) et la [présentation du frontend](frontend/README.md).
