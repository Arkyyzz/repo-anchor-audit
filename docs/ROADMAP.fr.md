# Feuille de route orientée utilité

Les échéances ci-dessous sont des objectifs de travail adaptables, pas des délais d'éligibilité à une offre. Le projet doit rester utile même si aucune candidature n'est retenue.

## Jours 1 à 30 : vérifier le besoin

Revoir l'implémentation et publier une version dont la CI réussit réellement. Essayer l'outil sur vos propres documentations, puis sur un petit nombre de dépôts publics choisis pour leur documentation, sans leur envoyer automatiquement des tickets. Conserver les reproductions de défauts du scanner et les liens réellement cassés que vous confirmez manuellement.

Pour chaque problème, distinguer un lien cassé d'une syntaxe volontairement hors périmètre. Choisir la prochaine amélioration à partir de ces observations. Demander des retours dans les espaces où la présentation de ce type d'outil est acceptée, avec une description sobre de ses limites.

## Jours 31 à 60 : corriger les usages observés

Traiter les défauts reproductibles, ajouter les tests correspondants et publier des notes de version claires. Stabiliser les comportements d'ancres les plus utiles aux documentations effectivement rencontrées. Mesurer le temps d'audit sur des jeux de fichiers reproductibles avant de promettre une meilleure performance.

Si un défaut de documentation est confirmé dans un autre projet, lire ses consignes, vérifier qu'il n'est pas déjà signalé et proposer un correctif proportionné seulement si vous souhaitez réellement le maintenir. Ne pas multiplier des modifications sans intérêt pour produire des statistiques.

## Jours 61 à 90 : maintenir et documenter l'impact

Répondre aux retours dans la mesure de votre disponibilité, améliorer la compatibilité selon les besoins établis et décider si un parseur Markdown complet est justifié. Préférer une petite surface fiable à une liste de fonctionnalités non vérifiées.

Conserver un journal public factuel : date, problème, lien vers le ticket ou le changement, validation, statut de publication et éventuel usage externe avec sa source. Un ticket ouvert n'est pas un correctif fusionné ; un téléchargement n'est pas un utilisateur unique. Ne pas extrapoler l'adoption à partir des tests ou des téléchargements d'automates.

## Journal de preuves à démarrer

| Date réelle | Action et problème traité | Preuve publique | Statut réel |
| --- | --- | --- | --- |
| À renseigner | Première publication après revue | URL de la release une fois créée | Non publiée à ce stade |

N'ajouter une ligne que lorsqu'une action a eu lieu. Les tests locaux et la documentation préparée peuvent être décrits comme tels ; ils ne prouvent ni une utilisation externe ni une ancienneté de maintenance.
