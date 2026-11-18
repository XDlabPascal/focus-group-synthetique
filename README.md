# Focus group synthétique

Outil web pour tester un concept ou une proposition de valeur auprès de personae simulées par Claude : réactions individuelles à froid, discussion animée, synthèse (consensus, divergences, objections, hypothèses à valider).

Les résultats sont des hypothèses à valider avec de vrais utilisateurs, pas des résultats d'étude.

## Comment l'accès est protégé

- `build.mjs` chiffre toute l'application (AES-256-GCM, clé dérivée du mot de passe par PBKDF2-SHA256, 600 000 itérations).
- Le site publié ne contient que la page de déverrouillage et le contenu chiffré. Sans le mot de passe, le code de l'outil n'est pas lisible.
- Le mot de passe vit dans un secret GitHub (`PAGE_PASSWORD`), jamais dans le dépôt.
- La clé API Anthropic est saisie dans l'onglet Réglages de l'outil. Elle reste dans le stockage local du navigateur et n'est pas incluse dans les exports.

Limites à connaître :

- La vérification a lieu dans le navigateur. Quelqu'un qui récupère le fichier chiffré peut tenter de deviner le mot de passe hors ligne : choisissez une phrase de passe longue (16 caractères ou plus, au hasard).
- Le mot de passe protège l'accès à l'outil, pas votre compte Anthropic. Utilisez une clé API dédiée, avec une limite de dépense dans la console Anthropic.
- Les personae et les sessions sont enregistrées dans le navigateur (stockage local). Exportez en JSON pour les sauvegarder ou les changer d'appareil.

## Mise en place sur GitHub

1. Créer le dépôt (privé) et pousser ce dossier sur la branche `main`.
2. Dans **Settings > Secrets and variables > Actions**, créer le secret `PAGE_PASSWORD` (12 caractères minimum).
3. Dans **Settings > Pages**, choisir **Source : GitHub Actions**. GitHub Pages sur un dépôt privé demande un plan GitHub payant (Pro, Team ou Enterprise). Sur un compte gratuit, le dépôt doit être public : le code est alors lisible, mais pas le mot de passe ni la clé API.
4. Pousser un commit (ou lancer le workflow à la main depuis l'onglet **Actions**). L'adresse du site s'affiche à la fin du déploiement.

Pour changer le mot de passe : modifier le secret `PAGE_PASSWORD`, puis relancer le workflow **Déployer sur GitHub Pages**.

## Utilisation en local

```bash
PAGE_PASSWORD='une-phrase-de-passe-longue' node build.mjs
python3 -m http.server 8000 -d dist
```

Ouvrir http://localhost:8000. Pour travailler sans le verrou, ouvrir directement `src/index.html`.

## Structure

- `src/index.html` : l'application (une seule page, sans dépendance, appels directs à l'API Anthropic).
- `src/unlock.html` : page de déverrouillage qui déchiffre et affiche l'application.
- `build.mjs` : chiffrement, produit `dist/index.html`.
- `.github/workflows/pages.yml` : build et déploiement sur GitHub Pages.

## Modèles utilisés

Trois niveaux de réflexion (Rapide, Standard, Approfondi), associés par défaut à `claude-haiku-5-5`, `claude-sonnet-5-5` et `claude-opus-5-5`. Les identifiants se changent dans l'onglet Réglages.
