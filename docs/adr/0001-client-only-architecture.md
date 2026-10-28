# ADR 0001 — Application statique, entièrement locale

- **Statut** : accepté
- **Date** : 27 octobre 2026
- **Contexte** : QR Code Studio, générateur de QR codes avec validation et exports

## Contexte

Le cahier des charges impose un outil sans backend, sans compte et sans télémétrie.
Toutes les données, y compris les contenus sensibles (WiFi, vCard, coordonnées),
doivent rester dans le navigateur. Les exports et le décodage de vérification
doivent fonctionner hors ligne après chargement.

Deux familles de solutions étaient possibles :

1. une application React servie par un serveur (Next.js, Remix, etc.) ;
2. une application entièrement statique, compilée en HTML/CSS/JS.

## Décision

Nous utilisons **Vite + React 19 + TypeScript strict** et produisons un site
statique dans `dist/`. Aucun serveur applicatif, aucune fonction serverless et
aucune base distante ne sont nécessaires. Zustand porte l’état, IndexedDB la
persistance, et les exports sont générés dans le navigateur.

## Conséquences

**Positives**

- Aucune donnée envoyée à un serveur ; la promesse de confidentialité est
  vérifiable dans le réseau du navigateur.
- Déploiement statique simple (Netlify, Vercel, CDN, fichier local).
- Coût d’exploitation quasi nul et surface d’attaque réduite.
- Vite offre un démarrage rapide et un build optimisé, avec découpage des bundles.

**Négatives / limites**

- Pas de synchronisation entre appareils ni de sauvegarde cloud.
- L’historique dépend du stockage du navigateur ; le vider le supprime.
- Les ressources lourdes (rendu, PDF) s’exécutent sur le poste client.
- Une politique de sécurité du contenu stricte est nécessaire pour compenser
  l’absence de contrôle serveur.

## Alternatives écartées

- **Next.js** : apportait du rendu serveur et des routes API inutiles pour une
  application qui ne doit rien envoyer. Le surcoût de configuration et de
  déploiement n’était pas justifié.
- **Backend + base de données** : incompatible avec l’exigence de traitement
  local et de simplicité opérationnelle.
- **Application de bureau** : installation et mises à jour plus lourdes, sans
  bénéfice fonctionnel pour ce cas d’usage.
