# Publier une première version

Le code est préparé localement. Aucun dépôt distant, compte de registre, commit public ou candidature n'a été créé en votre nom. Les commandes suivantes sont à exécuter après votre revue, depuis le dossier du projet. Les mots en majuscules sont à remplacer ; ne les publiez pas tels quels.

## 1. Revoir et personnaliser

Lire le code, les tests et les limites. Vérifier vos droits sur les contributions. Adapter le titulaire du copyright de `LICENSE` si nécessaire, sans attribuer à une personne un travail qu'elle n'a pas réalisé. Choisir un nom disponible pour le dépôt et, si souhaité, pour le paquet. Le nom actuel est un nom de travail.

Ajouter un contact privé dans `CODE_OF_CONDUCT.md` et `SECURITY.md`, ou activer les signalements privés GitHub puis décrire ce canal. Ne pas exposer une adresse que vous ne voulez pas rendre publique. Renseigner le futur lien du dépôt dans `package.json` et les informations de maintenance réellement assumées. Garder `private: true` tant qu'une publication npm n'est pas décidée.

```sh
node --test
node bin/repo-anchor-audit.js . --exclude examples/broken
node bin/repo-anchor-audit.js examples/valid
```

## 2. Créer un dépôt GitHub public

Dans votre compte GitHub, créer un dépôt public vide avec le nom choisi. Ne pas demander à GitHub de générer un second README ou une seconde licence. Relire les fichiers avant le premier envoi : seuls les fichiers que vous souhaitez rendre publics doivent y figurer.

Si ce dossier ne contient pas déjà un dépôt Git, exécuter :

```sh
git init -b main
git config user.name "VOTRE NOM PUBLIC"
git config user.email "VOTRE ADRESSE OU ADRESSE NOREPLY GITHUB"
git add .
git diff --cached --stat
git diff --cached
git commit -m "Add initial offline Markdown link auditor"
git remote add origin https://github.com/VOTRE-COMPTE/VOTRE-DEPOT.git
git push -u origin main
```

Si un dépôt Git existe déjà, contrôler `git status` et `git remote -v` avant de réutiliser l'historique ou d'ajouter un distant. Configurer l'identité pour ce dépôt uniquement. Ne pas antidater les commits : ce commit documente la mise en place initiale, pas un historique de maintenance inexistant.

L'authentification se fait avec votre compte. Utiliser les mécanismes pris en charge par GitHub, protéger le compte avec une authentification forte et ne jamais mettre de jeton dans les fichiers, les exemples ou l'URL du distant.

## 3. Vérifier la publication et la CI

Vérifier dans le dépôt distant que les sources, la licence, la documentation et les exemples sont accessibles. Ouvrir l'onglet Actions et attendre les résultats de la matrice Linux/Windows, Node.js 22/24. Corriger toute erreur réellement observée. Le workflow utilise des permissions de lecture et aucun secret.

Avant une utilisation durable, revoir les versions des actions GitHub et envisager de les figer sur des empreintes de commit vérifiées. Les tags de version du workflow sont une configuration initiale, pas une garantie d'immuabilité.

Créer quelques tickets décrivant des problèmes ou améliorations effectivement identifiés ; laisser de côté les faux utilisateurs, faux témoignages ou tickets de remplissage. Ajouter une description claire du projet et des sujets pertinents au dépôt. Ne pas afficher de badge indiquant une réussite qui n'a pas été observée.

## 4. Préparer la release GitHub

Quand les tests, la CI et la revue sont satisfaisants, remplacer l'entrée « préparée » du journal par la date réelle de publication, puis créer un tag et une release :

```sh
git tag -a v0.1.0 -m "Release 0.1.0"
git push origin v0.1.0
```

Créer ensuite la release `v0.1.0` depuis l'interface GitHub et décrire le périmètre exact, les limites et la validation observée. Un tag ne garantit ni l'adoption du projet ni son acceptation par un programme de soutien.

## 5. Publication npm facultative

Un dépôt public utilisable suffit pour partager le code source. npm est facultatif. Vérifier d'abord le nom disponible, les droits sur ce nom, le compte et ses exigences d'authentification. Un paquet sous votre propre espace de noms peut éviter une collision ; cela demande d'adapter `name` dans `package.json`.

Avec npm disponible, inspecter l'archive avant tout envoi :

```sh
npm pack --dry-run
```

Après décision de publier, retirer `private: true`, renseigner les métadonnées réelles, relancer les contrôles et revoir la liste des fichiers. Puis, avec votre authentification et le second facteur ou mécanisme demandé par npm :

```sh
npm publish --access public
```

Cette dernière commande rend le paquet public. Ne l'exécuter qu'après validation de l'archive et du compte. Ajouter le lien du paquet et sa version aux documents seulement après publication effective. Les tests et le workflow initial n'effectuent aucune publication automatique.
