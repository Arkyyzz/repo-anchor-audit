# Préparer une candidature fondée sur des preuves

Commencer par [les conditions vérifiées](PROGRAMME_CLAUDE.fr.md). Ce document est un brouillon de travail : aucun dossier n'a été envoyé. Les informations personnelles et l'historique GitHub ne sont pas connus.

## Décider s'il est pertinent de candidater

1. Vérifier vos prérequis personnels sur les pages officielles, avec votre vrai compte. Ne pas acheter ni emprunter un compte ancien.
2. Identifier la voie qui correspond à votre activité déjà observable, éventuellement sur d'autres projets que celui-ci.
3. Préparer des liens datés : rôle officiel, pages de paquets, dépendances, PR réellement fusionnées, ou usages indépendants documentés.
4. Distinguer une PR ouverte, une PR fusionnée et un simple commit local. Ne pas compter des utilisateurs de démonstration, téléchargements de test ou contributions de robots comme adoption indépendante.
5. Si vous ne pouvez pas encore expliquer une utilité publique réelle et vérifiable, poursuivre la maintenance. Une candidature anticipée n'est pas une étape obligatoire du lancement.

Pour une recherche GitHub de votre activité, remplacer les valeurs dans ce texte puis vérifier chaque résultat :

```text
is:pr is:merged author:VOTRE_COMPTE merged:AAAA-MM-JJ..AAAA-MM-JJ -user:VOTRE_COMPTE
```

Ce filtre est seulement un point de départ. Il faut aussi exclure manuellement vos dépôts d'organisation et tout dépôt dont vous êtes propriétaire. Vérifier les dates de fusion et la substance des changements. Ne pas publier une somme sans conserver sa liste de sources.

## Texte à compléter, pas à envoyer tel quel

Le texte suivant ne revendique aucun résultat non établi. Remplacer les champs, supprimer les phrases non prouvées, puis relire la version finale.

```text
Je suis [identité / compte GitHub] et mon rôle vérifiable est [rôle, depuis quand,
lien vers la liste officielle des mainteneurs ou l'historique de travail].

Je demande l'examen de mon dossier au titre de [voie réellement justifiée].
Les preuves publiques correspondantes sont [liens, dates et méthode de comptage].

Mon travail porte sur [projet(s)]. Le problème rencontré par leurs utilisateurs
est [problème concret]. J'ai réalisé [changements effectivement publiés,
avec liens vers les versions ou PR fusionnées].

repo-anchor-audit est [statut exact : local / public / version publiée]. Il vérifie
hors ligne certains liens locaux et ancres Markdown. Son code initial a été
préparé avec une assistance IA, puis [revue et validation réellement effectuées].
Son adoption indépendante documentée est [preuves ; sinon « non établie »].

J'utiliserais l'abonnement pour [tâches de maintenance concrètes : reproduire
des erreurs de parsing, examiner des correctifs, améliorer la documentation].
Je resterais responsable de la revue du code, des tests et des publications.
```

Ce brouillon peut être largement insuffisant si aucune preuve d'impact n'existe. Ne pas présenter le simple lancement comme une infrastructure dont d'autres dépendent. Préférer vos contributions antérieures substantielles si elles constituent les preuves les plus fortes.

## Actions qui vous appartiennent

- Choisir l'identité et le dépôt, relire le code, assumer la maintenance et les droits de publication.
- Publier les sources et accepter ou refuser les contributions sous votre responsabilité.
- Vérifier les informations privées de compte, les autorisations GitHub et le courriel de réception.
- Compléter et envoyer personnellement le formulaire officiel après relecture des conditions applicables.
- Si vous recevez une décision favorable, gérer l'activation et votre abonnement depuis votre propre compte.

Aucun badge « partenaire », « accepté » ou « sponsorisé par Anthropic » ne doit être affiché sans confirmation réelle.
