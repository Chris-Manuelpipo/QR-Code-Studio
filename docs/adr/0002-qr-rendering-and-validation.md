# ADR 0002 — Rendu stylisé et validation réelle du QR code

- **Statut** : accepté
- **Date** : 27 octobre 2026
- **Contexte** : formes personnalisées, logo central et promesse de scannabilité

## Contexte

Un aperçu joli ne garantit pas qu’un QR code reste lisible après application d’un
logo, d’un dégradé ou d’une marge insuffisante. Les bibliothèques de rendu
stylisé ne disent pas si le résultat final est décodable, et les règles
géométriques seules (surface du logo, marge) ne suffisent pas.

Il fallait concilier :

- six formes de modules et des coins personnalisés ;
- des couleurs unies ou en dégradé ;
- un logo central ;
- une taille d’export et une marge choisies ;
- une vérification fiable du fichier réellement produit.

## Décision

1. **`qr-code-styling`** produit le rendu stylisé (canvas pour le PNG et l’aperçu,
   SVG pour l’export vectoriel).
2. **`qrcode-generator`** fournit le nombre de modules et détecte les dépassements
   de capacité. Il sert aussi à convertir la marge en modules vers une marge en
   pixels cohérente avec le rendu.
3. **`jsQR`** décode le bitmap rendu à la **taille d’export sélectionnée**, et non
   l’aperçu agrandi. Le résultat est comparé octet à octet au contenu attendu.
4. Les règles complémentaires sont calculées dans `lib/validation` : surface du
   logo, marge, contraste, niveau de correction avec logo, inversion.
5. Le statut est vert, orange ou rouge. Un export orange/rouge reste possible mais
   affiche un avertissement ; l’outil ne prétend pas garantir une lisibilité
   physique.

### Encodage UTF-8

`qr-code-styling` transmet les données à `qrcode-generator`, qui traite les
chaînes comme des octets Latin-1. Pour éviter de corrompre les accents et les
caractères non latins, le contenu est converti en **chaîne binaire UTF-8**
(`toUtf8BinaryString`) avant le rendu. Le décodeur renvoie alors le texte UTF-8
correct, ce qui permet la comparaison exacte.

### Cycle de validation

Le hook `useQrPreview` annule le rendu précédent à chaque frappe, attend un court
délai de stabilisation, rend le bitmap, le décode, puis met à jour l’état. Les
blobs d’aperçu sont convertis en data URLs pour éviter les courses liées aux
object URLs révoquées.

## Conséquences

**Positives**

- La validation correspond au fichier que l’utilisateur télécharge.
- Les contenus accentués restent intacts.
- Les avertissements sont actionnables (réduire le logo, passer en H, remettre la
  marge à 4, renforcer le contraste).
- Les exports restent disponibles pour les cas volontairement risqués.

**Négatives / limites**

- Le décodage ajoute du travail sur le thread principal, surtout aux grandes
  tailles.
- `jsQR` peut échouer là où un lecteur natif réussirait, ou l’inverse ; le statut
  est une aide, pas une certification.
- Le PDF embarque un rendu raster haute résolution ; le SVG reste la voie
  vectorielle.
- La dépendance à `qr-code-styling` impose le contournement UTF-8 et limite le
  contrôle fin du SVG généré.

## Alternatives écartées

- **Validation géométrique uniquement** : trop optimiste, ne détecte pas les
  dégradés ou les formes qui gênent la lecture.
- **Décoder l’aperçu écran** : ne reflète pas la taille, la marge et la
  compression réelles de l’export.
- **Service de décodage distant** : viole la confidentialité et ajoute une
  dépendance réseau.
- **Rendu maison de zéro** : coût de développement et risque de régression très
  supérieurs pour un résultat visuel équivalent.
