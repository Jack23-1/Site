# Administration ONIP — PostgreSQL et Prisma

L’administration `/admin` est raccordée à une API Express et à PostgreSQL via Prisma. Les actualités, documents et photos sont enregistrés en français et en anglais. Un brouillon n’apparaît pas sur le site ; la publication le rend disponible sur l’accueil et les pages publiques correspondantes.

## Démarrage local

Prérequis : Node.js 20.9 ou ultérieur compatible avec Prisma 6, npm, PostgreSQL avec `initdb`, `pg_ctl` et `psql` accessibles dans le PATH.

Depuis la racine du projet (commandes relayées vers `backend`) :

```sh
npm ci
npm run db:local
npm run db:generate
npm run db:migrate
npm run admin:create -- --email admin@onip.gouv.cd
```

`db:local` crée un cluster isolé dans `backend/.local-postgres`, deux bases (`onip`, `onip_test`), un rôle applicatif sans privilèges superutilisateur et un `backend/.env` privé. Il écoute uniquement sur `127.0.0.1:55432`. Il ne remplace pas un `.env` existant. Pour une base déjà disponible, renseigner `backend/.env` à partir de `backend/.env.example` et ignorer `db:local`.

La commande `admin:create` demande un mot de passe masqué dans le terminal (12 à 256 caractères). Ajouter `--generate` crée un mot de passe aléatoire dans `.local-postgres/admin-access-<date>.txt`, lisible seulement par le propriétaire. Aucun identifiant n’est intégré au code. `--reset` permet de remplacer le mot de passe d’un compte existant et révoque toutes ses sessions.

Dans deux terminaux :

```sh
npm run dev:api
```

```sh
npm run dev
```

Ouvrir **http://localhost:5173/admin**. Vite transmet `/api` au serveur sur `127.0.0.1:3001`. Utiliser `localhost`, conformément à `APP_ORIGIN`. Le port du frontend est strict pour éviter une origine incohérente. `API_PROXY_TARGET` permet de choisir une autre adresse d’API pour le développement ou les tests.

`npm run db:stop` arrête le cluster local sans supprimer les données. `npm run db:local` le redémarre.

## Contenus

- Actualités : titres et textes bilingues, lien HTTPS facultatif vers une image.
- Documents : titres et descriptions bilingues, lien HTTPS obligatoire vers le document.
- Galerie : titres et descriptions bilingues, lien HTTPS obligatoire vers l’image.
- Publication des actualités : titres et corps de texte requis dans les deux langues.
- Les textes sont rendus comme du texte brut, sans HTML exécutable.
- Les mises à jour et suppressions vérifient la version pour éviter d’écraser les modifications d’une autre session.
- `npm run db:seed` importe les trois anciennes actualités de démonstration comme brouillons. La commande est réexécutable sans écraser les contenus existants. Ces exemples restent à vérifier avant publication.

La médiathèque permet d’importer des images et des PDF, conservés dans `backend/.local-media`. Les ressources peuvent également être référencées par URL HTTPS. Le carrousel et les coordonnées sont modifiables dans l’administration. L’administration est en français ; les contenus et pages publiques sont bilingues. Les demandes citoyennes et le pré-enregistrement restent hors de ce module.

## API

Toutes les réponses sont du JSON, y compris suppression et déconnexion. Les erreurs ont la forme `{ "message": "…" }`.

| Méthode | Route | Fonction |
| --- | --- | --- |
| GET | `/api/health` | Vérifie la connexion PostgreSQL |
| GET | `/api/admin/session` | Utilisateur connecté et jeton CSRF, ou 401 |
| POST | `/api/admin/login` | Connexion avec `{ email, password }` |
| POST | `/api/admin/logout` | Révocation de la session |
| GET | `/api/admin/content?type=news` | Contenus du type demandé, brouillons inclus |
| POST | `/api/admin/content` | Création d’un contenu |
| PUT | `/api/admin/content/:id` | Modification avec numéro `version` courant |
| DELETE | `/api/admin/content/:id` | Suppression avec `{ version }` |
| GET | `/api/content?type=news&limit=24` | Contenus publiés, pagination par `nextCursor` |

Types : `news`, `documents`, `gallery`. Statuts : `draft`, `published`.

```json
{
  "type": "news",
  "status": "draft",
  "title": { "fr": "Titre français", "en": "English title" },
  "body": { "fr": "Texte français", "en": "English text" },
  "resourceUrl": "https://example.org/photo.jpg"
}
```

La réponse `{ item }` ajoute `id`, `version`, `createdAt`, `updatedAt` et `publishedAt`. La liste publique renvoie `{ items, nextCursor }`. Passer `cursor=<nextCursor>` pour la suite.

## Authentification et exploitation

Les mots de passe sont hachés avec scrypt (sel aléatoire, N=32768, r=8, p=3). Les sessions expirent après huit heures et persistent en PostgreSQL ; seul le hachage du jeton de session est stocké. Le cookie est HttpOnly et SameSite=Strict ; en production il est Secure et préfixé `__Host-`.

Chaque mutation vérifie l’origine exacte `APP_ORIGIN` et le jeton `X-CSRF-Token` de la session. La connexion vérifie l’origine et limite les tentatives par IP et par adresse e-mail. Un compte désactivé ne peut plus utiliser ses sessions. Le serveur valide les champs et applique les autorisations indépendamment de React.

Le limiteur de tentatives est en mémoire, adapté à une instance. Pour un déploiement multi-instance, utiliser un stockage partagé. Il n’y a pas de rôle éditeur distinct : chaque compte créé est administrateur. Le renouvellement du mot de passe se fait via la commande locale documentée ci-dessus.

Pour déployer sur un serveur persistant : configurer une base PostgreSQL dédiée, une origine HTTPS, le reverse proxy et ses sauts de confiance (`TRUST_PROXY_HOPS`, 0 par défaut), puis exécuter :

```sh
npm ci
npm run db:generate
npm run db:migrate
npm run build
NODE_ENV=production npm start
```

Le serveur sert alors l’API et `frontend/dist/` sur la même origine. Ne pas mettre `NODE_ENV=development` dans `.env` : cela modifierait aussi la compilation Vite. `HOST` reste `127.0.0.1` par défaut pour un reverse proxy local. Les secrets et `.local-postgres/` sont exclus de Git ; prévoir des sauvegardes PostgreSQL pour un déploiement réel.

## Vérifications

```sh
npm run lint
npm run build
npm run test:api
npm run test:browser
```

Les tests nécessitent `TEST_DATABASE_URL`. Ils créent un schéma aléatoire dans la base de test, appliquent la migration et le suppriment en fin de test ; les contenus du site ne sont pas utilisés. Les tests navigateur emploient Chrome installé, les ports 5174 et 3002 et génèrent des captures dans `test-results/` (exclu de Git).

Les tests API couvrent l’accès anonyme, la connexion, les cookies, CSRF, la validation, les conflits de versions, la publication et la dépublication, la pagination, la suppression, la révocation, l’expiration, les comptes inactifs, la limitation des tentatives et la persistance. Les tests navigateur vérifient les parcours de connexion, rédaction, publication, langues, documents, galerie et déconnexion, ainsi que les largeurs 390, 768 et 1440 px.

Prisma et son client sont alignés sur 6.19.3, compatibles avec Node 20.18 installé ([prérequis Prisma 6](https://www.prisma.io/docs/guides/upgrade-prisma-orm/v6)). Une surcharge de `deepmerge-ts` vers la version 8 corrige une vulnérabilité dans l’outil de configuration Prisma ; les migrations sont testées avec cette surcharge. Vite a été mis à jour vers 6.4.3 pour corriger les alertes de sécurité de l’ancienne version.

## Organisation du dépôt

`frontend/` contient React, Vite et les ressources publiques. `backend/` contient l’API Express, Prisma, les scripts de base de données et les tests API/navigateur. Les dépendances sont installées depuis la racine avec npm workspaces et un fichier de verrouillage commun. Les commandes npm exécutent chaque outil dans le dossier approprié.

Les tests navigateur lancent Vite depuis `frontend/` et l’API depuis `backend/`. En production, garder les deux dossiers côte à côte : le backend sert la compilation `frontend/dist/`.

## Carrousel en direct

Dans Administration → Carrousel, ouvrir une diapositive, importer une nouvelle photo (ou choisir dans la médiathèque), puis saisir le texte et cliquer sur Enregistrer. Le formulaire du carrousel contient uniquement la photo et un texte sans traductions à saisir. L’enregistrement publie directement ; une nouvelle diapositive est ajoutée à la suite. Supprimer retire la diapositive du site. Le texte saisi est affiché dans les deux langues du site. Les pages déjà ouvertes reçoivent les changements via `/api/content/events` (Server-Sent Events), sans actualisation manuelle. Aucun visuel codé en dur ne remplace les diapositives supprimées ; un carrousel vide est masqué.

La diffusion des événements est locale au processus API. Le déploiement actuel utilise une instance ; plusieurs instances nécessiteraient une diffusion partagée. Le reverse proxy doit laisser passer les événements sans mise en tampon.
