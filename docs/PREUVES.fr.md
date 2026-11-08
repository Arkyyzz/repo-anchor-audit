# Journal de travail et preuves d'impact

Ce journal permet de distinguer ce qui existe de ce qui reste à établir. Il ne calcule pas une éligibilité et ne transforme pas des tests locaux en utilisateurs.

## Point de départ du 8 novembre 2026

| Élément | État établi |
| --- | --- |
| Code initial | Préparé localement avec assistance IA ; voir les sources et le rapport de validation livré. |
| Auteur humain / mainteneur public | À désigner par l'utilisateur après revue. |
| Dépôt public / version publique | Pas publiés lors de la préparation initiale ; voir le suivi ci-dessous. |
| Utilisateurs indépendants | Non établis. |
| Téléchargements / dépendances / score critique | Non établis, aucun nombre revendiqué. |
| PR dans des projets externes | Aucune envoyée ni fusionnée dans cette intervention. |
| Abonnement / candidature | Aucun abonnement obtenu, aucune candidature envoyée. |

## Suivi : première publication du 8 novembre 2026

Le dépôt [Arkyyzz/repo-anchor-audit](https://github.com/Arkyyzz/repo-anchor-audit) est désormais public. Le [commit initial](https://github.com/Arkyyzz/repo-anchor-audit/commit/ac2e5023b7a6e5dd6f54b8bcb4c8f46344b70c93) contient les 32 fichiers préparés, avec leurs métadonnées de dépôt. Leur contenu publié a été comparé au contenu préparé.

Les [quatre jobs GitHub Actions](https://github.com/Arkyyzz/repo-anchor-audit/actions/runs/42434350088) ont réussi pour ce commit : Linux/Windows, Node.js 22/24. La publication et cette validation n'établissent aucune adoption indépendante. Aucun paquet npm, aucune release GitHub, aucune PR externe et aucune candidature n'ont été publiés à ce stade.

## Enregistrer les travaux futurs

Une ligne par changement substantiel, avec une source publique si elle existe :

| Date | Problème réel | Changement et rôle personnel | Preuve | Résultat observable |
| --- | --- | --- | --- | --- |
| À compléter | Reproduction signalée par un utilisateur | Correctif revu et testé | Lien de PR / version | Ouverte, fusionnée, publiée ou abandonnée |

Une correction utile à une autre bibliothèque mérite d'être proposée seulement après lecture de ses règles, reproduction du problème et accord sur le périmètre. Éviter les PR répétitives, les demandes promotionnelles et les changements sans valeur pour leurs mainteneurs. Toute prise de contact externe reste une action volontaire de l'utilisateur.

## Mesurer sans gonfler les chiffres

- Consigner la date, le lien source et la méthode de chaque mesure.
- Séparer téléchargements totaux, CI et usages connus ; ne pas traduire automatiquement des téléchargements en personnes.
- Conserver les dates de fusion des PR et distinguer auteurs externes, collaborateurs internes et robots.
- Décrire précisément ce que vous avez conçu, revu et maintenu. Ne pas attribuer à votre compte le travail historique d'autrui.
- Ne pas créer de faux témoignages, étoiles, dépendances, comptes, commits antidatés ou échanges de contributions.

Le succès produit se mesure d'abord par des erreurs réellement détectées et corrigées, des rapports compréhensibles et une maintenance suivie. L'acceptation à un programme reste une décision extérieure.
