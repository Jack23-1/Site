# ONIP — Site vitrine

Intégration React + Vite de la maquette fournie : accueil responsive, bandeau à quatre diapositives, raccourcis de services, chiffres clés et actualités.

## Démarrage

```sh
npm install
npm run dev
```

## Vérification

```sh
npm run lint
npm run build
```

Les cartes ouvrent des fenêtres de présentation. Le suivi de demande et l’espace agent ne sont pas connectés à un serveur. Les coordonnées et documents officiels restent à renseigner.

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
