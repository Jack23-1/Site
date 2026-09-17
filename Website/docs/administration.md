# Administration — état et contrat d’API

L’interface React est accessible à `/admin`. Le backend n’est pas encore implémenté : l’installation des dépendances proposée a été refusée pendant la session. Aucun compte, mot de passe par défaut ou stockage fictif n’a été créé. La connexion et les opérations de contenu nécessitent les routes ci-dessous. Les pages publiques ne consomment pas encore ces contenus.

## Échanges attendus

Les routes sont sous `/api/admin`, sur la même origine que le site. Toutes les réponses, y compris suppression et déconnexion, sont du JSON. Les erreurs ont la forme `{ "message": "…" }`.

| Méthode | Route | Réponse |
| --- | --- | --- |
| GET | `/session` | `{ user: { id, email, name }, csrfToken }` ou 401 |
| POST | `/login` | Reçoit `{ email, password }`, crée une session et renvoie `{ user, csrfToken }` |
| POST | `/logout` | Révoque la session et renvoie `{ ok: true }` |
| GET | `/content?type=news` | `{ items: [...] }` ; types : `news`, `documents`, `gallery` |
| POST | `/content` | Valide, crée et renvoie `{ item }` |
| PUT | `/content/:id` | Valide, modifie et renvoie `{ item }` |
| DELETE | `/content/:id` | Supprime et renvoie `{ ok: true }` |

Exemple de contenu :

```json
{
  "id": "identifiant-fourni-par-le-serveur",
  "type": "news",
  "status": "draft",
  "title": { "fr": "Titre français", "en": "English title" },
  "body": { "fr": "Texte français", "en": "English text" },
  "resourceUrl": "https://example.org/photo.jpg"
}
```

Le formulaire accepte un lien HTTPS vers une image ou un document ; le téléversement de fichiers n’est pas implémenté. Les deux titres sont nécessaires. Le texte est du texte brut, sans HTML. Les contenus sont affichés dans l’interface uniquement après confirmation du serveur.

## Travail serveur restant

- Choisir la technologie puis installer ses dépendances avec l’autorisation de l’utilisateur.
- Base persistante, migrations, compte administrateur créé via une commande locale sans identifiants intégrés au code.
- Hachage des mots de passe, limitation des tentatives de connexion, sessions révocables avec cookie HttpOnly, SameSite et Secure en production.
- Contrôle d’accès serveur sur toutes les routes d’administration ; validation d’origine à la connexion et jeton CSRF sur les mutations authentifiées. Le client transmet `X-CSRF-Token`.
- Validation des types, statuts, longueurs, liens HTTPS et identifiants côté serveur ; requêtes SQL paramétrées.
- API publique limitée aux contenus publiés, puis raccordement des actualités, documents et galerie.
- Tests d’authentification, de révocation, de CSRF, de validation et de persistance ; vérifications de l’interface dans un navigateur.

L’affichage conditionnel de React n’est pas une protection d’accès. Seul le serveur doit décider des autorisations. Les principes de session suivent la [documentation de sécurité Express](https://expressjs.com/en/advanced/best-practice-security.html), si Node.js/Express est retenu.
