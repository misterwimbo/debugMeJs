




let bug,forms = null;
let submitFormOff, submitFormOn, log, displayForms,getCookies = null;
class debugMe {


    constructor() {
        this.confirmSend = false;
        this.blockForms = false;
    }



    formSubmitListener = (event) => {
        if (!this.blockForms) return;
        // EmpÃªche la soumission du formulaire
        event.preventDefault();
        // RÃ©cupÃ¨re les donnÃ©es du formulaire
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
        var data = []; // CrÃ©e un tableau pour stocker les donnÃ©es du formulaire
        // Affiche les donnÃ©es du formulaire dans la console
        for (var pair of formData.entries()) {
            // RÃ©cupÃ¨re l'Ã©lÃ©ment du formulaire correspondant Ã  la paire clÃ©/valeur
            var input = event.target.elements[pair[0]];
            // CrÃ©e un objet pour stocker les donnÃ©es de l'Ã©lÃ©ment du formulaire
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
            // Ajoute un Ã©couteur d'Ã©vÃ©nement 'submit' au formulaire
            forms[i].addEventListener('submit', this.formSubmitListener);
        }
        this.displayStatusOff();
        this.blockForms = true;
    }

    submitFormOn = () => {
        let forms = document.getElementsByTagName('form');
        for (let i = 0; i < forms.length; i++) {
            //Remove the event listener
            forms[i].removeEventListener('submit', this.formSubmitListener);
        }
        this.removeDisplayOffStatus();
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

    displayStatusOff = () => {

        if (document.getElementById('debugMeJs_status') != null) 
            return;

        const statusDiv = document.createElement('div');
        statusDiv.id = 'debugMeJs_status';
        statusDiv.style.cssText = `position: fixed; top: 0; left: 0; background: red; color:white;border: 1px solid #ccc; padding: 5px; z-index: 1000;`;

        statusDiv.innerHTML = `submit form off`;

        document.body.appendChild(statusDiv);
    }

    removeDisplayOffStatus = () => {

        if (document.getElementById('debugMeJs_status') == null) 
            return;

        document.getElementById('debugMeJs_status').remove();
    }
    

    displayForms = () => {


        forms = document.getElementsByTagName('form');

        if (forms == null || forms == undefined || forms.length == 0) {
            console.error('Aucun formulaire');
            return;
        }

     
       

        
       

        console.groupCollapsed('forms' );
            this.log(forms);
        console.groupEnd();
        


        console.groupCollapsed('Forms_details ');
        for (let i = 0; i < forms.length; i++) {

            console.groupCollapsed('Forms ' + i + ' : ' + forms[i].action) ;

                let data_form = {};
                let form_imput = {};

                data_form[`Form ${i}`] = {
                    action: forms[i].action,
                    method: forms[i].method,
                    name: forms[i].name,
                    document_url: forms[i].ownerDocument.location.href
                };


                for (let j = 0; j < forms[i].elements.length; j++) {
                    var input = forms[i].elements[j];


                if ( input.type === 'submit' || input.type === 'button' || input.type === 'reset'  || input.name.trim()  == '' ) { continue; }

                    var item = {
                        name: input.name,
                        required: input.required,
                        hidden: input.type === 'hidden',
                        value: input.value
                    };

                    form_imput[`Input ${j}`] = item;

                }

                console.table(data_form);
                console.table(form_imput);
            console.groupEnd();
        }
        console.groupEnd();

       


        //  data_form[`Form ${i}`].inputs = form_imput;



        //     console.groupCollapsed('Form ' + i);
        //     console.log('Action: ' + forms[i].action);
        //     console.log('Method: ' + forms[i].method);
        //     console.log('Name: ' + forms[i].name);

        //     // Ajout de l'URL du document contenant le formulaire
        //     console.log('Document URL: ' + forms[i].ownerDocument.location.href);
        //     var data = [];
        //     for (let j = 0; j < forms[i].elements.length; j++) {
        //         var input = forms[i].elements[j];
        //         var item = {
        //             name: input.name,
        //             required: input.required,
        //             hidden: input.type === 'hidden',
        //             value: input.value
        //         };
        //         data.push(item);
        //     }
        //     console.table(data);
        //     console.groupEnd();
        // }
        // console.groupEnd();
    }

    getCookies = () => {

        this.log(document.cookie);

        let cookies = document.cookie.split(';');
        let data = [];
        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i].split('=');
            let item = {
                name: cookie[0],
                value: cookie[1]
            };
            data.push(item);
        }
        console.groupCollapsed('Cookies');
        console.table(data);
        console.groupEnd();
    }   
}

function debugMeStart() {
    bug = new debugMe();

    // tous les formulaires de la page
    forms = document.getElementsByTagName('form');

    globalThis.fof    = submitFormOff = bug.submitFormOff;
    globalThis.fon    = submitFormOn  = bug.submitFormOn;
    globalThis.log    = log           = bug.log;
    globalThis.df     = displayForms  = bug.displayForms;
    globalThis.cc     = getCookies    = bug.getCookies;


    globalThis.bug    = bug;
    globalThis.forms_ = forms;
 
    

    // CrÃ©ation du menu personnalisÃ©
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
    //   options du menu
    const options = [
        { text: 'Intercepter les Formulaires', action: () => bug.submitFormOff() },
        { text: 'Autoriser les Formulaires', action: () => bug.submitFormOn() },
        { text: 'Afficher les Formulaires', action: () => displayForms() },
        { text: '---------------', action: () => {} },
        { text: 'Afficher le cookie', action: () => bug.getCookies() },
    ];

    options.forEach(option => {
        const item = document.createElement('div');
        item.textContent = option.text;
        item.style.cssText = ` padding: 8px 12px; cursor: pointer; `;
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

    // Fermeture du menu personnalisÃ© lors d'un clic ailleurs
    document.addEventListener('click', () => {
        customMenu.style.display = 'none';
    });

    //EmpÃªcher la fermeture du menu lors d'un clic sur celui-ci
    // customMenu.addEventListener('click', (e) => {
    //     e.stopPropagation();
    // });


    function help(){
   
    console.groupCollapsed('%chelp debugMe click me !', 'color: #810015; font-size: 12px; ;background-color: #F0F0F0; padding: 1px 3px; border-radius: 5px;');
    console.log('Bienvenue dans le mode debug');
    console.log(`
        fof() => Intercepter les formulaires\n
        fon() => Autoriser les formulaires\n
        df() => Afficher les formulaires\n
        log() => new console.log \n
        bug.confirmSend = false => Desactiver la confirmation (par defaut)\n
        bug.confirmSend = true => Activer la confirmation\n\n
        -------------------------------------------\n
        click droit + shift pour afficher le menu\n\n
        h() => Afficher l'aide\n
    `);
    console.groupEnd();
}
globalThis.h = help;
help();   //retier cette ligne pour ne pas afficher l'aide au dÃ©marrage
}
debugMeStart();