# ONIP — Backend

API Express avec PostgreSQL/Prisma. Installer les dépendances avec `npm ci` depuis la racine du dépôt.

Depuis ce dossier :

```sh
npm run db:generate
npm run db:local
npm run db:migrate
npm run dev
```

Configuration : `.env`, à partir de `.env.example` pour une base externe. `db:local` conserve une base existante et crée la configuration lors d’une installation neuve.

Le backend charge toujours `backend/.env`, quel que soit le dossier de lancement. En développement, le `DATABASE_URL` de ce fichier est prioritaire sur une variable exportée dans le terminal. En production et en test, la variable d’environnement reste prioritaire. La base créée par `db:local` utilise le port `55432`.

Consulter le [guide d’administration](docs/administration.md) pour la création du compte administrateur, les tests et le déploiement.
