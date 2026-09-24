# ONIP — Site vitrine

Intégration React + Vite de la maquette fournie : accueil responsive, bandeau à quatre diapositives, raccourcis de services, chiffres clés et actualités.

## Démarrage

```sh
npm ci --prefix ..
npm run dev
```

## Vérification

```sh
npm run lint
npm run build
```

Le site fonctionne par défaut sans backend. Les quatre diapositives et les trois actualités de démonstration existantes sont intégrées dans `src/data/static-content.json`, avec leurs images locales. Les actualités n’ont pas de date de publication inventée. Modifier ce fichier puis reconstruire le site pour mettre à jour les contenus. La galerie et les documents affichent leur message d’attente tant que leurs listes sont vides. Les liens sociaux existants sont conservés ; les coordonnées restent à renseigner.

Exécuter `npm run build` depuis la racine et publier le contenu de `frontend/dist`. Configurer l’hébergeur pour servir `index.html` sur les routes du site (`/actualites`, `/galerie`, etc.), afin de permettre leur ouverture directe. Aucune API ni connexion temps réel n’est utilisée par les pages publiques en mode statique et l’administration est désactivée.

Pour réactiver le backend ultérieurement, définir `VITE_CONTENT_MODE=api` dans `frontend/.env.local`, reconstruire et remettre l’API à disposition sous `/api`. Le suivi des demandes et le pré-enregistrement restent à connecter.

Les photographies générées se trouvent dans `public/images/` ; les prompts exacts figurent dans `IMAGE-PROMPTS.md`. Le logo original fourni dans `src/assets/logoonip.png` est utilisé dans l’en-tête et le footer. La police Chakra Petch (400, 500, 600 et 700) est hébergée localement dans `public/fonts/`, avec Arial en secours. Sa licence OFL est incluse.

## Carte des provinces

La section placée immédiatement après les actualités utilise les 26 tracés SVG récupérés sur https://onip.vercel.app/ le 10 septembre 2026. Les tracés sont conservés dans `src/data/province-paths.json`, avec leur association géographique aux provinces dans `src/ProvinceMap.jsx`. L’ancien tableau de survol alphabétique ne suivait pas l’ordre des tracés ; cette association a été corrigée.

La carte permet le survol, la sélection au clic, au clavier (Entrée/Espace), par liste déroulante ou par boutons. Les anciens chiffres de centres et de couverture ne sont pas repris : cette section présente les provinces, sans données opérationnelles non validées.

Vérifications : 26 tracés et 26 boutons, placement après les actualités, sélection synchronisée et réinitialisation, aucun débordement à 360, 390, 768, 1024 et 1440 pixels ; lint et compilation réussis.

## Footer et adaptation aux écrans

Footer bleu nuit avec appel à l’action, navigation institutionnelle, accès aux démarches, assistance et retour en haut. Les actions réutilisent les fenêtres existantes. La typographie et les mises en page sont adaptées aux écrans de 320 à 2560 pixels ; le menu mobile apparaît à 900 pixels. Les contrôles tactiles et la navigation au clavier sont pris en charge.

Vérifications Chrome : chargement effectif de Chakra Petch, 15 largeurs sans débordement horizontal ni collision dans l’en-tête, menu mobile et accès au suivi depuis le footer. Lint et compilation réussis.

## Fiches provinciales et footer compact

Les 26 noms sont affichés sur le SVG. Le clic, Entrée/Espace ou le sélecteur mobile mettent à jour la fiche de gauche (superficie, population, personnes enrôlées, centres et taux de couverture). Tous les chiffres de cette fiche sont des simulations demandées par l’utilisateur, signalées dans l’interface. Le taux est calculé à partir des effectifs simulés. Sur petit écran, la carte est défilable horizontalement pour conserver les noms lisibles.

Le footer compact comprend X, YouTube et Facebook. Les liens pointent provisoirement vers les plateformes ; les comptes officiels restent à renseigner.

Le bandeau supérieur a été retiré. Les animations d’apparition au défilement et les transitions de survol respectent `prefers-reduced-motion`. Le contenu reste visible si les animations ne peuvent pas être exécutées.

La recherche a été retirée de l’en-tête. La séparation verticale entre le logo et le nom complet reprend les couleurs bleu, jaune et rouge.

## Administration — PostgreSQL et Prisma

L’administration `/admin` permet de gérer les actualités, documents et galerie en français et anglais, avec connexion, brouillons et publication. L’API Express utilise Prisma et une base PostgreSQL persistante. Les pages publiques affichent les contenus publiés uniquement en mode API (`VITE_CONTENT_MODE=api`).

Consultez le [guide de démarrage, le contrat d’API et les tests](../backend/docs/administration.md). Depuis la racine du dépôt, pour le développement local, démarrer la base avec `npm run db:local`, puis l’API avec `npm run dev:api` et le site avec `npm run dev` dans deux terminaux.
