# Guide utilisateur — QR Code Studio

## 1. Créer un QR code

1. Choisissez un format dans **Contenu** : URL, texte, WiFi, vCard, événement,
   lieu, contact ou crypto.
2. Remplissez les champs. La validation est immédiate : les erreurs apparaissent
   sous le champ concerné et le bouton d’export reste désactivé tant que le contenu
   n’est pas valide.
3. L’aperçu et le bilan de scannabilité se mettent à jour automatiquement.

Quelques repères :

- **URL** : seuls `http` et `https` sont acceptés.
- **Texte** : 1 000 caractères maximum.
- **WiFi** : le mot de passe est obligatoire sauf pour un réseau ouvert
  (`nopass`). Le SSID et le mot de passe sont échappés correctement.
- **vCard** : le nom est obligatoire ; les autres informations sont optionnelles.
- **Événement** : la fin doit être postérieure au début.
- **Lieu** : latitude entre -90 et 90, longitude entre -180 et 180. La virgule
  décimale française est acceptée.
- **Contact** : choisissez email, téléphone ou SMS ; les champs changent selon le
  canal.
- **Crypto** : adresse obligatoire, montant optionnel strictement positif.

## 2. Lire le bilan de scannabilité

Le QR code affiché est rendu à la taille d’export sélectionnée, puis réellement
décodé dans le navigateur.

| Statut            | Signification                                                   |
| ----------------- | --------------------------------------------------------------- |
| **Scannable**     | Le décodeur relit exactement le contenu attendu.                |
| **Attention**     | Le code est lisible, mais une règle de sécurité est fragilisée. |
| **Non scannable** | Le décodeur ne relit pas le contenu, ou relit autre chose.      |

Les points d’attention possibles :

- logo au-delà de **20 %** de la surface ;
- correction inférieure à **Q** avec un logo ;
- marge inférieure à **4 modules** ;
- contraste inférieur à **4,5:1** ;
- modules plus clairs que le fond.

Chaque alerte propose une correction : réduire le logo, passer en H, remettre la
marge à 4 ou renforcer le contraste. Les exports restent autorisés en orange ou en
rouge, mais un avertissement s’affiche : ne les utilisez pas en production sans
avoir corrigé le problème.

## 3. Styliser

- **Presets** : quatre points de départ (minimal, corporate, chaleureux, éditorial).
- **Modules** : carrés, arrondis, points, classy, classy arrondi, très arrondis.
- **Coins** : forme extérieure et cœur du coin.
- **Couleurs** : uni, dégradé linéaire ou radial, avec rotation du dégradé.
- **Logo** : PNG, JPEG ou SVG jusqu’à 1 Mio. Les SVG sont assainis ; les scripts,
  gestionnaires d’événements et références externes sont retirés.
- **Taille** : 128, 256, 512 ou 1024 px, ou une valeur personnalisée jusqu’à
  2048 px.
- **Marge** : 0 à 8 modules. Gardez au moins 4 modules pour l’impression.
- **Correction** : L, M, Q ou H. Un logo force automatiquement H.

Conseils :

- un logo de **10 à 15 %** de la surface est plus sûr qu’un logo proche de 20 % ;
- évitez les dégradés trop clairs ou trop contrastés d’un module à l’autre ;
- un fond clair et des modules sombres restent la combinaison la plus fiable ;
- vérifiez le rendu à la taille finale, pas seulement à l’écran.

## 4. Exporter et imprimer

| Format             | Usage recommandé                                                     |
| ------------------ | -------------------------------------------------------------------- |
| **PNG**            | Écran, réseaux sociaux, documents bureautiques                       |
| **SVG**            | Impression vectorielle, découpe, retouche dans un logiciel graphique |
| **PDF A4**         | Impression papier avec traits de coupe                               |
| **Presse-papiers** | Collage direct d’un PNG dans une autre application                   |

- Le PNG utilise la taille sélectionnée. L’option **Fond transparent** produit un
  PNG sans fond, utile pour un collage.
- Le SVG est vectoriel et contient le QR code stylisé.
- Le PDF est au format A4 avec traits de coupe ; imprimez à **100 %**, sans
  « ajuster à la page ».
- Testez toujours un exemplaire imprimé avec plusieurs téléphones et à une distance
  réaliste. Un code lisible à l’écran peut échouer sur un support brillant, trop
  petit ou mal contrasté.

## 5. Historique local

- Chaque contenu valide est enregistré automatiquement après votre première
  modification.
- L’historique conserve une vignette, le type, la description et le contenu ; vous
  pouvez rouvrir une entrée pour la modifier.
- La limite est réglable dans **Réglages** : 10, 25, 50 ou 100 entrées. Les plus
  anciennes sont purgées en priorité.
- **Supprimer** retire une entrée ; **Tout effacer** vide l’historique après
  confirmation.
- **Mode privé** suspend l’enregistrement et l’historique pour la session en cours.
  Désactivez-le pour reprendre l’enregistrement.

L’historique reste dans ce navigateur et ce profil. Il n’y a ni compte, ni serveur,
ni synchronisation. Vider les données du site ou utiliser une fenêtre de navigation
privée supprime l’accès à l’historique.

## 6. Raccourcis clavier

| Raccourci                    | Action             |
| ---------------------------- | ------------------ |
| `Ctrl`/`Cmd` + `S`           | Télécharger le PNG |
| `Ctrl`/`Cmd` + `Shift` + `D` | Basculer le thème  |
| `Ctrl`/`Cmd` + `Shift` + `L` | Basculer la langue |
| `Échap`                      | Fermer un dialogue |

## 7. Dépannage

**Le statut est « Non scannable »**  
Réduisez le logo, augmentez la marge à 4 modules, passez en correction Q ou H,
renforcez le contraste, puis vérifiez que le contenu attendu est bien celui affiché.
Si le problème persiste, simplifiez la forme des modules ou augmentez la taille.

**Le logo est refusé**  
Vérifiez le format (PNG, JPEG ou SVG) et la taille (1 Mio maximum). Un SVG
malformé ou contenant uniquement des références externes peut aussi être rejeté.
Réessayez avec un PNG.

**Le bouton d’export est désactivé**  
Le contenu n’est pas encore valide. Corrigez les champs signalés ; l’état
« En attente » de la vérification peut aussi bloquer brièvement l’export.

**L’historique ne s’enregistre plus**  
Le mode privé est peut-être actif. Ouvrez **Réglages** et désactivez-le. Vérifiez
aussi que le navigateur autorise le stockage local pour ce site.

**Le thème ou la langue ne sont pas conservés**  
Les préférences sont stockées dans le stockage local du navigateur. Une navigation
privée ou un nettoyage des données du site les réinitialise.

## 8. Accessibilité

L’application fonctionne au clavier, annonce les changements de statut, piège le
focus dans les dialogues et respecte la préférence système de réduction des
animations. Les contrastes sont vérifiés pour WCAG 2.1 AA dans les deux thèmes.
