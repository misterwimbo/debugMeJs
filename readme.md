# Script Utilisateur DebugJs

## Vue d'ensemble

DebugJs est un script utilisateur conçu pour aider les développeurs à déboguer les formulaires web et les cookies. Il offre des fonctionnalités pour intercepter les soumissions de formulaires, enregistrer les données des formulaires de manière détaillée, et afficher les informations des cookies. Le script ajoute un menu contextuel personnalisé, accessible via un clic droit + Shift, offrant diverses options de débogage.

## Fonctionnalités

- **Intercepter les Soumissions de Formulaires** : Empêche la soumission des formulaires et enregistre les données des formulaires.
- **Autoriser les Soumissions de Formulaires** : Réactive les soumissions de formulaires.
- **Afficher les Formulaires** : Affiche des informations détaillées sur tous les formulaires de la page web actuelle.
- **Afficher les Cookies** : Affiche les informations des cookies.
- **Afficher les Logs** : Affiche des informations détaillées sur les objets ou tableaux.
- **Menu Contextuel Personnalisé** : Accessible via un clic droit + Shift, fournissant un accès facile aux options de débogage.

## Installation

1. **Installer un Gestionnaire de Scripts Utilisateurs** : Vous avez besoin d'une extension de navigateur comme Tampermonkey ou Greasemonkey.
2. **Ajouter le Script** : Copiez le code dans un nouveau script dans votre gestionnaire de scripts utilisateurs et enregistrez-le.

## Utilisation

### Variables et Méthodes Globales

Le script initialise plusieurs variables et méthodes globales pour un accès facile :

- `fof()`: Intercepter les soumissions de formulaires.
- `fon()`: Autoriser les soumissions de formulaires.
- `df()`: Afficher les formulaires.
- `log(args)`: Afficher des informations détaillées sur un objet ou un tableau.
- `cc()`: Afficher les cookies.
- `bug`: Instance de la classe `debugMe`.
- `forms_`: Collection de formulaires sur la page actuelle.

### Options de Débogage (Menu Contextuel Personnalisé)

- **Intercepter les Soumissions de Formulaires**: Empêche les soumissions de formulaires et enregistre les données des formulaires.
- **Autoriser les Soumissions de Formulaires**: Réactive les soumissions de formulaires.
- **Afficher les Formulaires**: Affiche des informations détaillées sur tous les formulaires de la page actuelle.
- **Afficher les Cookies**: Affiche les informations des cookies.

### Comment Accéder au Menu Contextuel Personnalisé

1. Maintenez la touche `Shift`.
2. Faites un clic droit sur la page web.
3. Le menu contextuel personnalisé apparaîtra avec les options de débogage.

### Paramètres Additionnels

- **Confirmation pour la Soumission de Formulaires**: Par défaut, le script ne demande pas de confirmation avant de soumettre un formulaire. Pour activer la confirmation, définissez `bug.confirmSend = true`.

### Aide

Pour afficher les informations d'aide à tout moment, utilisez la méthode globale `h()` dans la console.

## Explication Détaillée

### Classe debugMe

La classe `debugMe` contient des méthodes pour diverses fonctionnalités de débogage :

- **Constructeur**: Initialise les indicateurs `confirmSend` et `blockForms`.
- **formSubmitListener**: Intercepte les soumissions de formulaires, enregistre les données des formulaires, et demande éventuellement une confirmation avant de soumettre.
- **submitFormOff**: Ajoute un écouteur d'événements de soumission à tous les formulaires, empêchant la soumission des formulaires et enregistrant les données des formulaires.
- **submitFormOn**: Supprime l'écouteur d'événements de soumission de tous les formulaires, permettant la soumission des formulaires.
- **log**: Affiche des informations détaillées sur un objet ou un tableau dans un format structuré. Utilisez `log(args)` pour afficher des informations détaillées sur n'importe quel objet ou tableau passé en argument.
- **displayStatusOff**: Affiche un indicateur de statut lorsque les soumissions de formulaires sont interceptées.
- **removeDisplayOffStatus**: Supprime l'indicateur de statut.
- **displayForms**: Affiche des informations détaillées sur tous les formulaires de la page actuelle.
- **getCookies**: Affiche les informations des cookies.

### Menu Contextuel Personnalisé

Le menu contextuel personnalisé est créé et affiché en fonction de l'interaction de l'utilisateur (clic droit + Shift). Il fournit un accès rapide aux options de débogage.

### Initialisation

La fonction `debugMeStart` initialise l'instance `debugMe`, configure les variables et méthodes globales, et crée le menu contextuel personnalisé.

### Fonction d'Aide

La fonction `help` affiche les informations d'aide dans la console, fournissant une référence rapide aux méthodes et options de débogage disponibles.

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
