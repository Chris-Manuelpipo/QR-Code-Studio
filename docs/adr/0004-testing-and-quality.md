# ADR 0004 — Stratégie de tests et de qualité

- **Statut** : accepté
- **Date** : 27 octobre 2026
- **Contexte** : validation du rendu, des exports et de l’accessibilité

## Contexte

L’application combine de la logique pure (payloads, schémas, rétention,
scannabilité), des composants React et des API navigateur difficiles à simuler
(canvas, téléchargements, presse-papiers, IndexedDB). Une seule couche de tests ne
peut pas couvrir les trois de façon fiable.

## Décision

### Tests unitaires et d’intégration — Vitest + jsdom

- Payloads des huit formats, schémas Zod, couleurs, rétention, description des
  entrées, règles de scannabilité, options QR, i18n, stores Zustand.
- IndexedDB avec `fake-indexeddb`, nettoyage Testing Library après chaque test.
- Composants critiques (`ChecksPanel`, `ToastViewport`) rendus avec Testing
  Library et interactions `user-event`.
- Couverture V8 avec seuil de **75 %** sur les lignes, branches, fonctions et
  instructions.
- Les modules dépendant de Canvas, du rendu QR ou des téléchargements sont exclus
  du périmètre de couverture unitaire : les simuler donnerait une fausse
  assurance. Ils restent testés par Playwright.

### Tests de bout en bout — Playwright

- Chromium, serveur Vite dédié, contexte neuf par test (IndexedDB et
  `localStorage` vides).
- Scénario A : URL, sauvegarde, PNG/SVG/PDF, presse-papiers, décodage du PNG
  téléchargé avec `jsQR`.
- Scénario B : WiFi accentué, logo SVG, avertissement de surface, correction,
  historique complet (création, nouvelle entrée, réédition, suppression,
  effacement).
- Scénario C : bascule FR/EN, persistance du thème, dialogues, 320/390 px, mode
  privé.
- Scénario D : axes WCAG 2.1 AA sur les deux thèmes, les dialogues, l’anglais et
  la mise en page à 320 px.
- Scénario E : **20 configurations visuelles** (six formes, dégradés, coins,
  tailles, marges, niveaux de correction) vérifiées comme scannables.
- Les erreurs console, exceptions et requêtes échouées sont surveillées dans les
  scénarios principaux.

### Qualité statique

- TypeScript strict, `noUncheckedIndexedAccess`, typecheck des tests E2E.
- ESLint avec React Hooks, React Refresh et `jsx-a11y`.
- Prettier.
- CI GitHub Actions : lint, typecheck, couverture, build et E2E.

## Conséquences

**Positives**

- Chaque couche est testée avec l’outil adapté.
- La matrice E2E détecte les régressions de rendu que jsdom ne peut pas voir.
- L’accessibilité est mesurée dans les états réels, pas seulement dans le DOM
  statique.
- Les téléchargements sont vérifiés par leur signature et leur contenu, pas
  seulement par l’absence d’erreur.

**Négatives / limites**

- La suite E2E est plus lente et dépend d’un navigateur installé.
- Le décodage du PNG dans le test E2E dépend de la même bibliothèque `jsQR` que
  l’application ; il vérifie le pipeline d’export, pas l’indépendance du décodeur.
- Les seuils de couverture portent sur la logique ; les chemins Canvas restent
  couverts fonctionnellement, pas ligne par ligne.
- Les tests de scannabilité ne remplacent pas un test physique sur plusieurs
  téléphones.
