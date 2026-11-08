# Validation du 8 novembre 2026

Environnement observé : **Windows, Node.js v24.22.1**. Aucun paquet tiers installé pour lancer l'outil ou ses tests. Les vérifications utilisent les sources livrées.

## Résultats

- **28 tests réussis, zéro échec, zéro test ignoré.**
- Audit de la documentation du projet, hors exemple volontairement incorrect : aucun diagnostic.
- Exemple valide : sortie `0`, 5 liens locaux contrôlés, 1 lien externe ignoré.
- Exemple incorrect : sortie `1`, exactement trois diagnostics attendus : fichier manquant, ancre manquante, référence non définie. Les rapports observés sont dans les fichiers `expected.json` des deux dossiers d'exemples.
- Lors de la préparation locale initiale, aucune publication ni connexion de compte n'avait été effectuée. La publication ultérieure est consignée ci-dessous ; aucune candidature n'a été envoyée.

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

## Validation publique complémentaire

Le [commit initial publié](https://github.com/Arkyyzz/repo-anchor-audit/commit/ac2e5023b7a6e5dd6f54b8bcb4c8f46344b70c93) a déclenché le [run GitHub Actions 42434350088](https://github.com/Arkyyzz/repo-anchor-audit/actions/runs/42434350088). Les quatre jobs se sont terminés avec le résultat `success` :

| Système | Node.js | Résultat |
| --- | --- | --- |
| Windows | 22 | Réussi |
| Windows | 24 | Réussi |
| Ubuntu | 22 | Réussi |
| Ubuntu | 24 | Réussi |

Chaque job exécute les tests et l'audit de la documentation. Les 32 fichiers publiés ont aussi été comparés aux fichiers préparés par leurs empreintes Git.

## Limites de cette validation

Les résultats distants ci-dessus concernent précisément le commit indiqué. Ils ne garantissent pas les futures versions. npm n'était pas disponible dans l'environnement local ; l'archive npm et sa publication restent à vérifier avec votre installation.

Les tests ne prouvent ni une conformité CommonMark/GFM complète, ni une compatibilité avec tous les générateurs de documentation, ni l'absence de tous les défauts. Le scanner ne vérifie pas les URL externes. Le système de fichiers doit rester stable pendant l'audit. Voir [l'architecture et le périmètre exact](ARCHITECTURE.md).
