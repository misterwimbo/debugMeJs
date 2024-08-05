let bug, forms = null;
let submitFormOff, submitFormOn, log, displayForms, getCookies = null;

/**
 * Classe de débogage pour intercepter et afficher les formulaires et les cookies.
 */
class debugMe {
    constructor() {
        this.confirmSend = false;
        this.blockForms = false;
    }

    // ############## formSubmitListener ##############
    /**
     * Écouteur pour intercepter la soumission du formulaire.
     * @param {Event} event - L'événement de soumission du formulaire.
     */
    formSubmitListener = (event) => {
        if (!this.blockForms) return;

        // Empêche la soumission du formulaire
        event.preventDefault();

        // Récupère les données du formulaire
        const formData = new FormData(event.target);

        // Affiche les valeurs des données du formulaire
        console.groupCollapsed('Form Data Values');
        console.log('Action: ' + event.target.action);
        console.log('Method: ' + event.target.method);
        console.table(Array.from(formData.entries()));
        console.groupCollapsed('JSON');
        console.log(JSON.stringify(Object.fromEntries(formData.entries())));
        console.groupEnd();
        console.groupEnd();

        // Affiche les détails des données du formulaire
        console.groupCollapsed('Form Data Details');
        console.log('Action: ' + event.target.action);
        console.log('Method: ' + event.target.method);

        let data = [];
        for (let pair of formData.entries()) {
            let input = event.target.elements[pair[0]];
            let item = {
                name: pair[0],
                required: input.required,
                hidden: input.type === 'hidden',
                value: pair[1]
            };
            data.push(item);
        }

        console.table(data);
        console.groupCollapsed('JSON');
        console.log(JSON.stringify(data));
        console.groupEnd();
        console.groupEnd();

        // Demande de confirmation pour soumettre le formulaire
        if (this.confirmSend) {
            if (confirm('Soumettre le formulaire ?')) {
                event.target.submit();
            }
        }
    }

    // ############## submitFormOff ##############
    /**
     * Intercepte la soumission de tous les formulaires de la page.
     */
    submitFormOff = () => {
        for (let i = 0; i < forms.length; i++) {
            forms[i].addEventListener('submit', this.formSubmitListener);
        }
        this.displayStatusOff();
        this.blockForms = true;
    }

    // ############## submitFormOn ##############
    /**
     * Autorise la soumission de tous les formulaires de la page.
     */
    submitFormOn = () => {
        for (let i = 0; i < forms.length; i++) {
            forms[i].removeEventListener('submit', this.formSubmitListener);
        }
        this.removeDisplayOffStatus();
        this.blockForms = false;
    }

    // ############## log ##############
    /**
     * Affiche un objet ou un tableau dans la console de manière détaillée.
     * @param {*} args - Les données à afficher.
     */
    log = (args) => {
        console.log(typeof args);
        console.log(args);
        if (typeof args === 'object' || Array.isArray(args)) {
            console.groupCollapsed('Displaying Object');
            console.table(args);
            console.groupEnd();
        }
    }

    // ############## displayStatusOff ##############
    /**
     * Affiche un message indiquant que la soumission des formulaires est interceptée.
     */
    displayStatusOff = () => {
        if (document.getElementById('debugMeJs_status') != null) return;

        const statusDiv = document.createElement('div');
        statusDiv.id = 'debugMeJs_status';
        statusDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            background: red;
            color: white;
            border: 1px solid #ccc;
            padding: 5px;
            z-index: 1000;
        `;
        statusDiv.innerHTML = `Submit form off`;

        document.body.appendChild(statusDiv);
    }

    // ############## removeDisplayOffStatus ##############
    /**
     * Supprime le message indiquant que la soumission des formulaires est interceptée.
     */
    removeDisplayOffStatus = () => {
        if (document.getElementById('debugMeJs_status') == null) return;
        document.getElementById('debugMeJs_status').remove();
    }

    // ############## displayForms ##############
    /**
     * Affiche les détails de tous les formulaires de la page dans la console.
     */
    displayForms = () => {
        forms = document.getElementsByTagName('form');

        if (forms == null || forms.length == 0) {
            console.error('Aucun formulaire');
            return;
        }

        console.groupCollapsed('Forms');
        this.log(forms);
        console.groupEnd();

        console.groupCollapsed('Forms Details');
        for (let i = 0; i < forms.length; i++) {
            console.groupCollapsed('Form ' + i + ' : ' + forms[i].action);

            let formData = {
                action: forms[i].action,
                method: forms[i].method,
                name: forms[i].name,
                document_url: forms[i].ownerDocument.location.href
            };

            let formInputs = {};
            for (let j = 0; j < forms[i].elements.length; j++) {
                let input = forms[i].elements[j];
                if (input.type === 'submit' || input.type === 'button' || input.type === 'reset' || input.name.trim() === '') {
                    continue;
                }
                let item = {
                    name: input.name,
                    required: input.required,
                    hidden: input.type === 'hidden',
                    value: input.value
                };
                formInputs[`Input ${j}`] = item;
            }

            console.table({[`Form ${i}`]: formData});
            console.table(formInputs);
            console.groupEnd();
        }
        console.groupEnd();
    }

    // ############## getCookies ##############
    /**
     * Affiche tous les cookies de la page dans la console.
     */
    getCookies = () => {
        this.log(document.cookie);

        let cookies = document.cookie.split(';');
        let data = [];
        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i].split('=');
            let item = {
                name: cookie[0].trim(),
                value: cookie[1]
            };
            data.push(item);
        }
        console.groupCollapsed('Cookies');
        console.table(data);
        console.groupEnd();
    }
}

// ############## debugMeStart ##############
/**
 * Initialisation de l'instance de débogage et des fonctions globales.
 */
function debugMeStart() {
    bug = new debugMe();

    // Récupération de tous les formulaires de la page
    forms = document.getElementsByTagName('form');

    // Définition des alias pour un accès rapide
    globalThis.fof = submitFormOff = bug.submitFormOff;
    globalThis.fon = submitFormOn = bug.submitFormOn;
    globalThis.log = log = bug.log;
    globalThis.df = displayForms = bug.displayForms;
    globalThis.cc = getCookies = bug.getCookies;

    globalThis.bug = bug;
    globalThis.forms_ = forms;

    // Création du menu contextuel personnalisé
    const customMenu = document.createElement('div');
    customMenu.id = 'custom-context-menu';
    customMenu.style.cssText = `
        display: none;
        position: fixed;
        background: white;
        border: 1px solid rgb(239, 167, 167);
        box-shadow: 2px 2px 5px rgba(0,0,0,0.1);
        z-index: 1000;
    `;

    // Options du menu
    const options = [
        { text: 'Intercepter les Formulaires', action: () => bug.submitFormOff() },
        { text: 'Autoriser les Formulaires', action: () => bug.submitFormOn() },
        { text: 'Afficher les Formulaires', action: () => displayForms() },
        { text: '---------------', action: () => {} },
        { text: 'Afficher les Cookies', action: () => bug.getCookies() }
    ];

    options.forEach(option => {
        const item = document.createElement('div');
        item.textContent = option.text;
        item.style.cssText = 'padding: 8px 12px; cursor: pointer;';
        item.addEventListener('mouseenter', () => item.style.backgroundColor = '#F0F0F0');
        item.addEventListener('mouseleave', () => item.style.backgroundColor = 'white');
        item.addEventListener('click', option.action);
        customMenu.appendChild(item);
    });

    // Ajout du menu au document
    document.body.appendChild(customMenu);

    // Gestion de l'affichage du menu contextuel
    document.addEventListener('contextmenu', (e) => {
        if (e.shiftKey) {
            e.preventDefault();
            customMenu.style.display = 'block';
            customMenu.style.left = `${e.pageX}px`;
            customMenu.style.top = `${e.pageY}px`;
        }
    });

    // Fermeture du menu contextuel personnalisé lors d'un clic ailleurs
    document.addEventListener('click', () => {
        customMenu.style.display = 'none';
    });

    // Fonction d'aide
    function help() {
        console.groupCollapsed('%cHelp DebugMe - Click Me!', 'color: #810015; font-size: 12px; background-color: #F0F0F0; padding: 1px 3px; border-radius: 5px;');
        console.log('Bienvenue dans le mode debug');
        console.log(`
            fof() => Intercepter les formulaires
            fon() => Autoriser les formulaires
            df() => Afficher les formulaires
            log() => Nouvelle méthode console.log
            bug.confirmSend = false => Désactiver la confirmation (par défaut)
            bug.confirmSend = true => Activer la confirmation
            -------------------------------------------
            Click droit + Shift pour afficher le menu
            h() => Afficher l'aide
        `);
        console.groupEnd();
    }
    globalThis.h = help;
    help(); // Retirer cette ligne pour ne pas afficher l'aide au démarrage
}
debugMeStart();
