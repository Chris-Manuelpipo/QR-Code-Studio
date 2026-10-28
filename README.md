# QR Code Studio

Atelier de QR codes **100 % local** : huit formats de contenu, un rendu entièrement
personnalisable, une vérification réelle de la lisibilité et des exports prêts à
imprimer. Aucun compte, aucun serveur, aucune télémétrie.

L’interface est disponible en **français** (par défaut) et en **anglais**, en thème
clair ou sombre, et reste utilisable dès **320 px** de large.

## Ce que fait l’application

- **Huit types de contenu** : URL, texte libre, WiFi, vCard, événement (vEvent),
  coordonnées GPS, email/téléphone/SMS et adresse crypto.
- **Aperçu en direct** : chaque modification est rendue immédiatement.
- **Personnalisation** : six formes de modules, coins extérieurs et cœur de coin,
  couleurs unies, dégradés linéaires ou radiaux, logo central, taille de 128 à
  2048 px, marge de 0 à 8 modules et niveaux de correction L/M/Q/H.
- **Vérification de scannabilité réelle** : le QR code final, rendu à la taille
  d’export choisie, est décodé localement avec `jsQR`, puis comparé au contenu
  attendu.
- **Bilan vert / orange / rouge** : décodage, surface du logo, marge, contraste et
  niveau de correction, avec des actions correctives en un clic.
- **Exports** : PNG, SVG vectoriel modifiable, PDF A4 avec traits de coupe et copie
  du PNG dans le presse-papiers.
- **Historique local** : IndexedDB, vignettes, limite de rétention réglable,
  réédition et suppression, sans aucune synchronisation distante.
- **Mode privé** : suspend l’historique et l’enregistrement automatique à la demande.
- **Accessibilité** : navigation clavier, focus visible, dialogues piégés, libellés
  explicites, respect de `prefers-reduced-motion` et audits axe sans violation
  WCAG 2.1 AA.

## Démarrage rapide

Prérequis : **Node.js 22.12 ou plus récent** et npm 10+.

```bash
npm install
npm run dev
```

L’application est servie par défaut sur `http://localhost:5173`.

```bash
npm run build      # typecheck + build de production dans dist/
npm run preview    # prévisualise le build de production
```

## Scripts

| Commande                | Rôle                                                    |
| ----------------------- | ------------------------------------------------------- |
| `npm run dev`           | Serveur de développement Vite                           |
| `npm run build`         | Vérification TypeScript puis build statique             |
| `npm run preview`       | Sert le contenu de `dist/`                              |
| `npm run typecheck`     | `tsc -b` sur l’application, les outils et les tests E2E |
| `npm run lint`          | ESLint, règles React Hooks, React Refresh et jsx-a11y   |
| `npm run format`        | Prettier sur tout le dépôt                              |
| `npm run format:check`  | Vérifie le formatage sans écrire                        |
| `npm run test`          | Tests unitaires et d’intégration Vitest                 |
| `npm run test:watch`    | Vitest en mode watch                                    |
| `npm run test:coverage` | Vitest avec rapport et seuils de couverture             |
| `npm run test:e2e`      | Scénarios Playwright dans Chromium                      |
| `npm run check`         | Lint + typecheck + tests unitaires                      |

## Architecture

```text
src/
  components/        interface, formulaires, aperçu, historique, dialogues
  hooks/             aperçu QR, autosauvegarde, raccourcis, i18n
  i18n/              dictionnaires FR/EN typés
  lib/
    config.ts        constantes, formulaires et presets par défaut
    export/          PNG, SVG, PDF A4 et presse-papiers
    history/         descriptions lisibles des entrées
    logo/            validation, assainissement SVG et composition du logo
    payloads/        sérialisation des huit formats de QR
    qr/              options de rendu, marges et décodage jsQR
    schemas/         schémas Zod des formulaires
    storage/         IndexedDB et politique de rétention
    validation/      règles de scannabilité
  store/             état Zustand : studio, historique, préférences, UI, toasts
  test/              configuration Vitest et fabriques de données
e2e/                 scénarios Playwright, matrice de styles et axe
docs/                ADR et guides utilisateur FR/EN
```

Flux principal :

1. React Hook Form valide la saisie avec Zod.
2. `lib/payloads` produit la chaîne encodée (UTF-8).
3. `lib/qr` construit les options de `qr-code-styling` et calcule la marge.
4. `useQrPreview` rend le bitmap à la taille d’export, le décode avec `jsQR` et
   lance `analyzeScannability`.
5. Après interaction, `useAutosave` enregistre l’entrée validée dans IndexedDB,
   sauf en mode privé.
6. `lib/export` réutilise le rendu pour les fichiers téléchargés.

## Formats de contenu

| Type    | Contenu encodé                                                |
| ------- | ------------------------------------------------------------- |
| URL     | Lien `http` ou `https`                                        |
| Texte   | Texte libre jusqu’à 1 000 caractères                          |
| WiFi    | `WIFI:T:…` avec SSID, mot de passe, sécurité et réseau masqué |
| vCard   | Carte de visite vCard 3.0                                     |
| vEvent  | Événement iCalendar avec début, fin, lieu et description      |
| Lieu    | URI `geo:` avec latitude, longitude et libellé optionnel      |
| Contact | `MATMSG:` pour email, `tel:` pour appel, `SMSTO:` pour SMS    |
| Crypto  | URI de type `bitcoin:` / `ethereum:` avec montant et libellé  |

Les caractères accentués et non latins sont convertis en octets UTF-8 avant le
rendu afin de préserver le contenu réel.

## Scannabilité : ce que signifient les statuts

- **Vert — Scannable** : le décodeur relit exactement le contenu attendu.
- **Orange — Attention** : le code est lisible, mais une règle de sécurité est
  fragilisée (logo trop grand, marge faible, contraste limite, correction
  insuffisante avec logo ou modules inversés).
- **Rouge — Non scannable** : le décodeur ne relit pas le contenu, ou lit autre
  chose. Le contenu et les exports restent disponibles, avec un avertissement
  explicite.

Règles appliquées :

- surface du logo supérieure à **20 %** du QR code ;
- niveau de correction inférieur à **Q** en présence d’un logo ;
- marge inférieure à **4 modules** ;
- contraste des modules inférieur à **4,5:1** ;
- modules plus clairs que le fond (code inversé).

La vérification porte sur le bitmap réellement exporté à la taille choisie, pas
seulement sur l’aperçu. Elle reste une aide : testez toujours un exemplaire imprimé
sur plusieurs téléphones avant une production en volume.

## Confidentialité et stockage

- Aucun appel réseau après le chargement de l’application.
- Aucun cookie, compte, analytics ou identifiant publicitaire.
- L’historique est stocké dans IndexedDB (`qr-code-studio`), avec vignettes et
  limite de 10, 25, 50 ou 100 entrées.
- L’enregistrement automatique ne démarre qu’après une modification réelle.
- Le mode privé désactive l’écriture jusqu’à sa désactivation.
- « Tout effacer » supprime les entrées locales ; vider les données du navigateur
  produit le même effet.

## Accessibilité

- Cible **WCAG 2.1 AA**, vérifiée avec axe dans les deux thèmes, les dialogues, en
  anglais et à 320 px.
- Structure de titres, liens d’évitement, libellés de formulaire et messages
  d’état accessibles.
- Focus piégé dans les dialogues, fermeture par `Échap`, retour du focus au
  déclencheur.
- Contrastes renforcés et animations réduites si l’utilisateur le demande.

## Tests

```bash
npm run test            # 123 tests unitaires et d’intégration
npm run test:coverage   # seuils : 75 % lignes, branches, fonctions, instructions
npm run test:e2e        # scénarios navigateur + matrice + axe
```

Les tests Vitest couvrent les payloads, schémas Zod, règles de scannabilité,
couleurs, rétention, IndexedDB, options QR, descriptions, i18n, stores, logo SVG,
exports et composants. Les modules dépendant de Canvas, du rendu QR ou du
téléchargement sont exercés par Playwright plutôt que par jsdom ; ils sont donc
exclus du périmètre de couverture unitaire.

Les scénarios Playwright vérifient notamment :

- création, sauvegarde, export PNG/SVG/PDF et copie presse-papiers ;
- décodage du PNG téléchargé avec `jsQR` ;
- WiFi accentué, logo, avertissement puis correction, historique et mode privé ;
- bascule FR/EN, persistance du thème, dialogues et mise en page à 320/390 px ;
- audits axe WCAG 2.1 AA ;
- **20 configurations visuelles** (formes, dégradés, coins, tailles, marges et
  niveaux de correction) qui restent scannables.

## Déploiement

Le build produit un site statique dans `dist/`. Aucune variable d’environnement
n’est nécessaire.

- **Netlify** : `netlify.toml` est fourni (build, redirection SPA, en-têtes de
  sécurité et cache des assets).
- **Vercel** : `vercel.json` est fourni (build, réécriture SPA, en-têtes et cache).
- **Hébergement statique** : publiez `dist/` et configurez une réécriture de
  `/*` vers `/index.html` si votre hébergeur ne le fait pas automatiquement.

Les en-têtes incluent une CSP stricte, `X-Content-Type-Options`, `Referrer-Policy`,
`X-Frame-Options` et une `Permissions-Policy` sans accès caméra, micro, géoloc ou
sujets publicitaires.

## Documentation

- [Guide utilisateur — français](docs/help/fr.md)
- [User guide — English](docs/help/en.md)
- [ADR 0001 — Application statique et locale](docs/adr/0001-client-only-architecture.md)
- [ADR 0002 — Rendu QR et validation réelle](docs/adr/0002-qr-rendering-and-validation.md)
- [ADR 0003 — Historique local et vie privée](docs/adr/0003-local-history-and-privacy.md)
- [ADR 0004 — Stratégie de tests et de qualité](docs/adr/0004-testing-and-quality.md)

## Limites connues

- La lecture d’un QR code dépend du lecteur, de l’objectif, de la lumière et du
  support imprimé : la validation ne remplace pas un test physique.
- Le PDF A4 intègre une image QR raster à haute résolution (`max(taille, 1024)`).
  Pour une impression vectorielle, préférez l’export SVG.
- L’historique est propre au navigateur et au profil ; il n’y a ni synchronisation
  ni sauvegarde cloud.
- Effacer les données du site, utiliser la navigation privée du navigateur ou
  changer d’appareil supprime l’accès à l’historique.
- Les logos SVG sont assainis (scripts, gestionnaires d’événements et références
  externes supprimés) ; les fichiers PNG/JPEG/SVG sont limités à 1 Mio.

## Licence

Aucune licence n’est déclarée dans ce dépôt. Ajoutez-en une avant toute diffusion
ou réutilisation publique.
