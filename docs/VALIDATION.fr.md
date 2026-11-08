# Validation locale du 8 novembre 2026

Environnement observé : **Windows, Node.js v24.22.1**. Aucun paquet tiers installé pour lancer l'outil ou ses tests. Les vérifications utilisent les sources livrées.

## Résultats

- **28 tests réussis, zéro échec, zéro test ignoré.**
- Audit de la documentation du projet, hors exemple volontairement incorrect : aucun diagnostic.
- Exemple valide : sortie `0`, 5 liens locaux contrôlés, 1 lien externe ignoré.
- Exemple incorrect : sortie `1`, exactement trois diagnostics attendus : fichier manquant, ancre manquante, référence non définie. Les rapports observés sont dans les fichiers `expected.json` des deux dossiers d'exemples.
- Aucune publication, aucune connexion de compte ni aucun envoi de candidature effectué.

## Ce que les tests établissent

Les tests construisent des petits dépôts temporaires indépendants. Ils vérifient les liens locaux et images, références, ancres répétées, chemins Unicode et encodés, blocs de code avec différentes fins de ligne, destinations parenthésées et titres, UTF-8 invalide et limites de taille.

Ils vérifient aussi les exclusions et leurs limites de chemin, les sorties JSON, les codes de retour de la commande, l'absence de modification des fichiers audités et le rejet des traversées hors racine. Le test de jonction de dossier a effectivement été exécuté sur cette machine.

Une régression traite une entrée comportant 100 000 crochets non fermés, 10 000 liens externes à ignorer puis un lien local incorrect. Elle impose une limite de cinq secondes et vérifie la position finale du diagnostic. C'est une donnée synthétique de test, sans rapport avec une adoption réelle du projet.

## Reproduire

Depuis la racine du projet :

```sh
node --test
node bin/repo-anchor-audit.js . --exclude examples/broken --format json
node bin/repo-anchor-audit.js examples/valid --format json
node bin/repo-anchor-audit.js examples/broken --format json
```

La dernière commande renvoie volontairement `1`. Les autres doivent renvoyer `0`.

## Limites de cette validation

La matrice Linux/Windows et Node.js 22/24 est configurée dans la CI, mais aucun résultat GitHub Actions distant n'est revendiqué. Seul l'environnement local indiqué ci-dessus a été exécuté ici. npm n'était pas disponible dans cet environnement ; l'archive npm et sa publication restent à vérifier avec votre installation.

Les tests ne prouvent ni une conformité CommonMark/GFM complète, ni une compatibilité avec tous les générateurs de documentation, ni l'absence de tous les défauts. Le scanner ne vérifie pas les URL externes. Le système de fichiers doit rester stable pendant l'audit. Voir [l'architecture et le périmètre exact](ARCHITECTURE.md).
