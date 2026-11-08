# repo-anchor-audit

Un outil local pour repérer les liens cassés et les ancres manquantes dans la documentation Markdown d'un dépôt, sans transmettre son contenu à un service.

Cette première version, préparée avec une assistance IA, est publiée en source sur [GitHub](https://github.com/Arkyyzz/repo-anchor-audit). Aucun utilisateur externe ni téléchargement n'est revendiqué. Le nom du paquet reste à vérifier avant une éventuelle publication sur npm.

[English](README.md) · [Contribuer](CONTRIBUTING.md) · [Limites techniques](docs/ARCHITECTURE.md) · [Licence MIT](LICENSE)

## Démarrage

Node.js 22 ou plus récent suffit. Le projet ne dépend d'aucun paquet tiers.

```sh
node bin/repo-anchor-audit.js . --exclude examples/broken
node bin/repo-anchor-audit.js . --format json --exclude examples/broken
node --test
```

Exécuter ces commandes depuis le dossier du projet. Pour vérifier un autre dépôt, remplacer le `.` placé avant les options par son chemin. Choisir une racine contenant la documentation et les cibles de ses liens locaux. L'outil lit les fichiers locaux sans les modifier. Il ne contacte pas les sites cités, n'exécute pas les scripts du dépôt et n'utilise aucun identifiant.

## Fonctionnement

L'outil vérifie les liens et images Markdown en ligne, les liens par référence et les fragments d'ancres des fichiers Markdown, dans le sous-ensemble de syntaxe documenté. Il signale aussi les références non définies, les chemins sortant du dossier choisi et les fichiers Markdown trop gros ou illisibles.

Les liens ayant un schéma d'URL sont ignorés et comptés. Les liens vers des dossiers vérifient uniquement leur existence ; les fragments des fichiers qui ne sont pas Markdown ne sont pas validés. Les blocs de code et le code en ligne sont ignorés. La découverte ignore les dossiers `.git`, `node_modules`, `dist` et `coverage`.

Le scanner ne remplace pas un moteur CommonMark ou GitHub complet. Consulter les [limites précises](docs/ARCHITECTURE.md) avant d'en faire un contrôle bloquant.

Le [rapport de validation](docs/VALIDATION.fr.md) décrit les résultats locaux et la réussite des quatre configurations GitHub : Windows/Linux, Node.js 22/24, lors de la première publication.

## Options et résultats

```text
node bin/repo-anchor-audit.js [dossier]
  --format text|json
  --exclude chemin/relatif
  --max-file-bytes 1048576
  --help
  --version
```

Par défaut : dossier courant, sortie texte, limite de 1 048 576 octets par fichier Markdown. Répéter `--exclude` pour plusieurs chemins. Il s'agit de préfixes de fichiers ou dossiers, pas de motifs avec jokers.

Codes de sortie : `0` sans anomalie, `1` avec diagnostics, `2` pour un mauvais argument ou dossier racine. Le JSON expose `schemaVersion`, `filesScanned`, `linksChecked`, `linksSkipped` et `diagnostics`. Chaque diagnostic précise son code, son fichier, sa ligne, sa colonne, sa cible et son message.

## Démonstration

```sh
node bin/repo-anchor-audit.js examples/valid
node bin/repo-anchor-audit.js examples/broken --format json
```

Le second exemple contient volontairement des erreurs et renvoie `1` ; son [résultat attendu](examples/broken/EXPECTED.md) les explique. Ne pas l'inclure dans l'audit du dépôt complet : conserver `--exclude examples/broken`.

## Participer et publier

Le [guide de contribution](CONTRIBUTING.md) explique comment fournir une reproduction, un correctif et un test utile. Le [guide de publication](docs/PUBLISHING.fr.md) détaille les étapes qui nécessitent votre compte et vos décisions. La [feuille de route](docs/ROADMAP.fr.md) privilégie les besoins vérifiés, et le [journal des versions](CHANGELOG.md) distingue les livrables préparés des versions effectivement publiées.

Pour le dossier de soutien open source, consulter les [conditions vérifiées du programme Claude](docs/PROGRAMME_CLAUDE.fr.md), la [préparation de candidature](docs/CANDIDATURE.fr.md) et le [journal de preuves](docs/PREUVES.fr.md). Une nouvelle publication ne constitue pas à elle seule une preuve d'éligibilité ou d'impact.
