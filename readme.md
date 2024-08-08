# Script Utilisateur DebugJs


DebugJs est un script utilisateur conçu pour aider les développeurs à déboguer 

## Fonctionnalités


- **Intercepter les Soumissions de Formulaires** : Empêche la soumission des formulaires et enregistre les données des formulaires.
- **Autoriser les Soumissions de Formulaires** : Réactive les soumissions de formulaires.
- **Afficher les Formulaires** : Affiche des informations détaillées sur tous les formulaires de la page web actuelle.
- **Afficher les Cookies** : Affiche les informations des cookies.
- **Afficher les Logs** : Affiche des informations détaillées sur les objets ou tableaux.
- **Trouver les Doublons d'Identifiants** : Recherche les identifiants dupliqués dans le DOM.
- **Afficher les Input Hidden** : Affiche ou masque les input de type hidden.
- **Aide** : Affiche une liste des commandes disponibles.

- **Menu Contextuel Personnalisé** : Accessible via un clic droit + Shift, fournissant un accès facile aux options de débogage.

## Installation

1. **Installer un Gestionnaire de Scripts Utilisateurs** : Vous avez besoin d'une extension de navigateur comme Tampermonkey ou Greasemonkey.
2. **Ajouter le Script** : Copiez le code dans un nouveau script dans votre gestionnaire de scripts utilisateurs et enregistrez-le.

## Utilisation



- `fof()`: Intercepter les soumissions de formulaires.
- `fon()`: Autoriser les soumissions de formulaires.
- `df()`: Afficher les formulaires.
- `log(args)`: Afficher des informations détaillées sur un objet ou un tableau.
- `cc()`: Afficher les cookies.
- `bug`: Instance de la classe `debugMe`.
- `forms_`: Collection de formulaires sur la page actuelle.
- `ids()`: Trouver les doublons d'identifiants.
- `sh()`: Afficher ou masquer les champs de type `hidden`.
- `h()`: Afficher l'aide.

- 'bug.confirmSend = false': Désactiver la confirmation par défaut.
- 'bug.confirmSend = true': Activer la confirmation



### Comment Accéder au Menu Contextuel Personnalisé

1. Maintenez la touche `Shift`.
2. Faites un clic droit sur la page web.
3. Le menu contextuel personnalisé apparaîtra avec les options de débogage.

### Paramètres Additionnels

- **Confirmation pour la Soumission de Formulaires**: Par défaut, le script ne demande pas de confirmation avant de soumettre un formulaire. Pour activer la confirmation, définissez `bug.confirmSend = true`.






### Exemple d'Utilisation

```javascript
// Intercepter les soumissions de formulaires
fof();

// Autoriser les soumissions de formulaires
fon();

// Afficher tous les formulaires
df();

// Afficher les cookies
cc();

//Affiche les inputs hidden avec leur attribut name
sh();

//Affiche les doublons d'id ( se lance à chaque rafraichissement de page )
ids();


//custom log amelioré
log(args) // affichera args avec plus de details que console.log(args)
