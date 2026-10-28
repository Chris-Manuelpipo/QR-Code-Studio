# ADR 0003 — Historique local, rétention et mode privé

- **Statut** : accepté
- **Date** : 27 octobre 2026
- **Contexte** : persistance sans backend, réédition et confidentialité

## Contexte

L’utilisateur doit retrouver ses créations après rechargement, les rouvrir pour les
modifier et les supprimer. Aucune donnée ne doit quitter l’appareil. Les contenus
peuvent être sensibles (mot de passe WiFi, coordonnées, carnet de contacts), et
certains utilisateurs ne veulent aucune trace.

## Décision

- **IndexedDB** via `idb` stocke les entrées (`qr-code-studio`, magasin `entries`),
  avec un index sur `updatedAt`. Les entrées contiennent le type, le payload, les
  données de formulaire, le style, une vignette et les dates.
- **Rétention** : limite réglable de 10, 25, 50 ou 100 entrées. Les plus anciennes
  sont supprimées à chaque sauvegarde (`applyRetention`), avec un minimum d’une
  entrée conservée.
- **Sauvegarde automatique après interaction** : l’état `isDirty` empêche
  d’enregistrer le QR de démonstration au premier chargement. Chaque nouvelle
  exécution de l’effet invalide une sauvegarde en vol pour éviter les écritures
  obsolètes.
- **Mode privé** : désactive l’écriture et l’affichage de l’historique pour la
  session ; l’indicateur explique clairement que rien n’est enregistré.
- **Aucune télémétrie, aucun cookie, aucun identifiant** : les préférences
  (langue, thème, limite, mode privé) vont dans `localStorage`, l’historique dans
  IndexedDB.
- **Suppression explicite** : suppression unitaire, « Tout effacer » avec
  confirmation, et détachement de l’entrée courante lorsqu’elle est supprimée.

## Conséquences

**Positives**

- Réédition instantanée et vignettes sans requête réseau.
- Politique de rétention prévisible et limitée.
- Le mode privé couvre les cas d’usage sur poste partagé.
- La suppression est locale et immédiate.

**Négatives / limites**

- Pas de sauvegarde si l’utilisateur vide les données du site, change de navigateur
  ou utilise une fenêtre privée.
- Les quotas IndexedDB varient selon les navigateurs ; les vignettes augmentent
  l’espace utilisé.
- Le mode privé n’efface pas les anciennes entrées ; il empêche seulement les
  nouvelles écritures.
- L’historique d’un profil de navigateur peut être accessible à une autre personne
  utilisant le même profil ; le mode privé ou l’effacement restent nécessaires.

## Alternatives écartées

- **`localStorage` seul** : synchrone, taille limitée, inadapté aux vignettes et
  aux objets structurés.
- **OPFS / fichiers** : plus complexe pour un besoin de liste et d’index.
- **Base distante** : incompatible avec le sans-compte et la confidentialité.
- **Pas de rétention** : croissance non bornée et risque de quota.
