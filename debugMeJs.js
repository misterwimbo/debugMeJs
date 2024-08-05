




let bug,forms = null;
let submitFormOff, submitFormOn, log, displayForms, df = null;
class debugMe {
    constructor() {
        this.confirmSend = false;
        this.blockForms = false;
    }
    formSubmitListener = (event) => {
        if (!this.blockForms) return;
        // Empêche la soumission du formulaire
        event.preventDefault();
        // Récupère les données du formulaire
        var formData = new FormData(event.target);
        //******GROUP 1 */
        console.groupCollapsed('Form Data values');
        console.log('Action: ' + event.target.action);
        console.log('Method: ' + event.target.method);
        console.table(Array.from(formData.entries()));
        console.groupCollapsed('JSON');
        console.log(JSON.stringify(Object.fromEntries(formData.entries())));
        console.groupEnd();
        console.groupEnd();
        //******GROUP 1 */
        //******GROUP 2 */
        console.groupCollapsed('Form Data details');
        console.log('Action: ' + event.target.action);
        console.log('Method: ' + event.target.method);
        var data = []; // Crée un tableau pour stocker les données du formulaire
        // Affiche les données du formulaire dans la console
        for (var pair of formData.entries()) {
            // Récupère l'élément du formulaire correspondant à la paire clé/valeur
            var input = event.target.elements[pair[0]];
            // Crée un objet pour stocker les données de l'élément du formulaire
            var item = {
                name: pair[0],
                required: input.required,
                hidden: input.type === 'hidden',
                value: pair[1]
            };
            // Ajoute l'objet au tableau
            data.push(item);
        }
        // Affiche le tableau dans la console
        console.table(data);
        console.groupCollapsed('JSON');
        console.log(JSON.stringify(data));
        console.groupEnd();
        console.groupEnd();
        //******GROUP 2 */
        //need confirmation ? Oh yes sire ! 23h52 serieux Oo et je code encore, 00h30 maintenant ...
        //appelle la function avec active = true pour activer la confirmation   => stopForm(true)
        if (this.confirmSend) {
            if (confirm('Soumettre le formulaire ?')) {
                event.target.submit();
            }
        }
    }
    submitFormOff = () => {
        // Parcours chaque formulaire
        for (var i = 0; i < forms.length; i++) {
            // Ajoute un écouteur d'événement 'submit' au formulaire
            forms[i].addEventListener('submit', this.formSubmitListener);
        }
        this.blockForms = true;
    }
    submitFormOn = () => {
        let forms = document.getElementsByTagName('form');
        for (let i = 0; i < forms.length; i++) {
            //Remove the event listener
            forms[i].removeEventListener('submit', this.formSubmitListener);
        }
        this.blockForms = false;
    }
    log = (args) => {
        console.log(typeof args);
        console.log(args);
        if (typeof args === 'object' || typeof args === 'array') {
            console.groupCollapsed('Displaying object');
            console.table(args);
            console.groupEnd();
        }
    }
    displayForms = () => {
        if (forms == null || forms == undefined || forms.length == 0) {
            console.error('Aucun formulaire trouvé sur la page');
            return;
        }
        console.groupCollapsed('forms' );
        this.log(forms);
        console.groupEnd();
        console.groupCollapsed('details forms' );
        for (let i = 0; i < forms.length; i++) {
            console.groupCollapsed('Form ' + i);
            console.log('Action: ' + forms[i].action);
            console.log('Method: ' + forms[i].method);
            console.log('Name: ' + forms[i].name);
            // Ajout de l'URL du document contenant le formulaire
            console.log('Document URL: ' + forms[i].ownerDocument.location.href);
            var data = [];
            for (let j = 0; j < forms[i].elements.length; j++) {
                var input = forms[i].elements[j];
                var item = {
                    name: input.name,
                    required: input.required,
                    hidden: input.type === 'hidden',
                    value: input.value
                };
                data.push(item);
            }
            console.table(data);
            console.groupEnd();
        }
        console.groupEnd();
    }
}
function debugMeStart() {
    bug = new debugMe();
    // Récupère tous les formulaires de la page
    forms = document.getElementsByTagName('form');
    globalThis.fof    = submitFormOff = bug.submitFormOff;
    globalThis.fon    = submitFormOn  = bug.submitFormOn;
    globalThis.log    = log           = bug.log;
    globalThis.df     = displayForms  = bug.displayForms;
    globalThis.bug    = bug;
    globalThis.forms_ = forms;
    // Création du menu personnalisé
    const customMenu = document.createElement('div');
    customMenu.id = 'custom-context-menu';
    customMenu.style.cssText = `
        display: none;
        position: fixed;
        background: white;
        border: 1px solid rgb(239 167 167);
        box-shadow: 2px 2px 5px rgba(0,0,0,0.1);
        z-index: 1000;
    `;
    // Création des options du menu
    const options = [
        { text: 'Intercepter les Formulaires', action: () => bug.submitFormOff() },
        { text: 'Autoriser les Formulaires', action: () => bug.submitFormOn() },
        { text: 'Afficher les Formulaires', action: () => bug.displayForms() },
        { text: '---------------', action: () => {} },
        { text: 'Afficher le cookie', action: () => bug.log(document.cookie) },
    ];
    options.forEach(option => {
        const item = document.createElement('div');
        item.textContent = option.text;
        item.style.cssText = `
            padding: 8px 12px;
            cursor: pointer;
        `;
        item.addEventListener('mouseenter', () => item.style.backgroundColor = '#F0F0F0');
        item.addEventListener('mouseleave', () => item.style.backgroundColor = 'white');
        item.addEventListener('click', option.action);
        customMenu.appendChild(item);
    });
    // Ajout du menu au document
    document.body.appendChild(customMenu);
    // Gestion de l'affichage du menu
    document.addEventListener('contextmenu', (e) => {
        if (e.shiftKey) {
            e.preventDefault();
            customMenu.style.display = 'block';
            customMenu.style.left = `${e.pageX}px`;
            customMenu.style.top = `${e.pageY}px`;
        }
    });
    // Fermeture du menu personnalisé lors d'un clic ailleurs
    document.addEventListener('click', () => {
        customMenu.style.display = 'none';
    });
    // Empêcher la fermeture du menu lors d'un clic sur celui-ci
    // customMenu.addEventListener('click', (e) => {
    //     e.stopPropagation();
    // });
    function help()
{
    console.groupCollapsed('%chelp debugMe click me !', 'color: #810015; font-size: 12px; ;background-color: #F0F0F0; padding: 1px 3px; border-radius: 5px;');
    console.log('Bienvenue dans le mode debug');
    console.log(`
        fof() => Intercepter les formulaires\n
        fon() => Autoriser les formulaires\n
        df() => Afficher les formulaires\n
        log() => console.log amélioré\n
        bug.confirmSend = false => Désactiver la confirmation (par défaut)\n
        bug.confirmSend = true => Activer la confirmation\n\n
        -------------------------------------------\n
        click droit + shift pour afficher le menu\n\n
        h() => Afficher l'aide\n
    `);
}
globalThis.h = help;
help();   //retier cette ligne pour ne pas afficher l'aide au démarrage
}
debugMeStart();