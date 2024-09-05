// ==UserScript==
// @name         DebugJs
// @namespace    http://tampermonkey.net/
// @version      2024-08-05
// @description  try to take over the world!
// @author       wimbo
// @match         *://*/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=wrike.com
// @grant        none
// ==/UserScript==
(function() {

    let bug,forms = null;
    let submitFormOff, submitFormOn, log, displayForms,getCookies,findDuplicateIds = null;
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
                // Ajoute un listener 'submit' au formulaire
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

            let type = typeof args;

            if (args === null) {
                type = 'null';
            }

            if (args === "object" && Array.isArray(args)) {
                type = 'array';
            }

            console.log( '%cType : ' +  type , 'color: red');

            if (typeof args === 'string') {
                console.log('%clength : ' + args.length , 'color: red');
            }

           if ( typeof args === 'function') //inutile d'afficher le code d'une fonction en log, ce n'est pas complet
                console.table(args);
            else
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


        findDuplicateIds = () => {

            let identifiants = {}; // Objet pour stocker les identifiants uniques
            let ArrayRef = []; // Tableau pour stocker les identifiants dupliqués

            // Récupère tous les éléments du DOM
            let tousElements = document.all || document.getElementsByTagName("*");

            // Parcourt tous les éléments du DOM
            for (var i = 0, longueur = tousElements.length; i < longueur; i++) {
                var id = tousElements[i].id; // Récupère l'identifiant de l'élément actuel
                if (id) { // Vérifie si l'élément a un identifiant
                    if (identifiants[id]) { // Vérifie si l'identifiant est déjà dans l'objet identifiants
                        // Si l'identifiant est déjà dans l'objet identifiants et n'est pas encore dans ArrayRef
                        if (!ArrayRef.includes(id)) {
                            ArrayRef.push(id); // Ajoute l'identifiant au tableau ArrayRef
                        }
                    } else {
                        identifiants[id] = 1; // Ajoute l'identifiant à l'objet identifiants
                    }
                }
            }

            // Si des identifiants dupliqués ont été trouvés
            if (ArrayRef.length > 0) {
                // Affiche un groupe de messages dans la console, avec le nombre d'identifiants dupliqués
                console.groupCollapsed("%cDuplicate ids" + " (" + ArrayRef.length + ")", "color: red; font-weight: bold;");
                // Affiche les identifiants dupliqués sous forme de tableau
                console.table(ArrayRef);
                // Ferme le groupe de messages dans la console
                console.groupEnd();
            } else {
                // Si aucun identifiant dupliqué n'a été trouvé, affiche un message
                console.log("%cAucun doublon d'identifiant trouvé :) ", "color: green; font-weight: bold;");
            }
        }

        showHideInputHidden = () =>{

            let inputs         = document.getElementsByTagName('input');
            let show           = false;
            let nbrInputHidden = 0;



            for (let i = 0; i < inputs.length; i++) {

                if (inputs[i].type === 'hidden') {

                    inputs[i].classList.add('h_hidden_h');
                    inputs[i].type = "text";
                    show = true;
                    nbrInputHidden++;


                    //create temp label for hidden input label = input name, place label in dom before input
                    let label = document.createElement('label');
                    label.textContent = inputs[i].name;
                    label.classList.add('h_hidden_h_label');
                    inputs[i].parentNode.insertBefore(label, inputs[i]);



                }

                else if (inputs[i].type === 'text' && inputs[i].classList.contains('h_hidden_h')) {
                    inputs[i].type = "hidden";
                    inputs[i].classList.remove('h_hidden_h');
                    nbrInputHidden++;

                    let labels = document.getElementsByClassName('h_hidden_h_label');
                    for (let j = 0; j < labels.length; j++) {
                        labels[j].remove();
                    }
                }
            }

            if (nbrInputHidden === 0) {
                console.log('%cAucun input hidden trouvé', 'color: orange');
            }

            else{

                if (show) {
                    console.log('%cles input hidden sont visible', 'color: red');

                } else {
                    console.log('%cles input hidden sont a nouveau dans l\'ombre', 'color: green');
                }
            }

        }
    }

    //////////////////////////////////////////
    ///////////////////////////////////////
    var elementsWithEvents = document.querySelectorAll('[onclick], [onchange], [onkeyup], [onkeydown], [onkeypress], [ondblclick]');

    // Créer l'élément affiché en haut à gauche
    var topLeftCorner = document.createElement('div');
    topLeftCorner.style.position = 'fixed';
    topLeftCorner.style.top = '45px';
    topLeftCorner.style.left = '20px';
    topLeftCorner.style.background = 'black';
    topLeftCorner.style.padding = '10px';
    topLeftCorner.style.zIndex = '1000';
    topLeftCorner.style.color = 'white';
    topLeftCorner.style.display = 'none';
    topLeftCorner.style.borderRadius = '5px';
    topLeftCorner.style.boxShadow = '2px 2px 5px rgba(0,0,0,0.1)';
    topLeftCorner.id = 'topLeftCornerInfos';
    
    
    // Bouton pour fermer l'affichage
    // var closeButton = document.createElement('span');
    // closeButton.textContent = '✖';
    // closeButton.style.color = 'red';
    // closeButton.style.cursor = 'pointer';
    // closeButton.style.float = 'right';
    // closeButton.style.marginLeft = '10px';
    // closeButton.addEventListener('click', function () {
    //     topLeftCorner.style.display = 'none';
    // });
    // topLeftCorner.appendChild(closeButton);
    document.body.appendChild(topLeftCorner);
    
    // Fonction pour afficher les informations sur l'élément
    function showEventInfo(eventType, element) {
        let info = `<span style="color:red;">${eventType} :</span>  ${element.getAttribute(eventType)}<br>`;
        
        // Ajouter id s'il existe
        if (element.id) {
            info += `<span style="color:red;">id :</span>  ${element.id}<br>`;
        }
    
        // Ajouter name s'il existe
        if (element.name) {
            info += `<span style="color:red;">name :</span>  ${element.name}<br>`;
        }
    
        // Mettre à jour uniquement le contenu, sans recréer le bouton
        topLeftCorner.innerHTML = '';
        topLeftCorner.innerHTML += info;
        topLeftCorner.style.display = 'block';
    }
    
    // Parcourir tous les éléments et ajouter les listeners
    elementsWithEvents.forEach(function (element) {
        ['onclick', 'onchange', 'onkeyup', 'onkeydown', 'onkeypress', 'ondblclick'].forEach(function (eventType) {
            if (element.hasAttribute(eventType)) {
                element.addEventListener('mouseover', function () {
                    showEventInfo(eventType, element);
                });
            }
        });
    });
    
///////////////////////////////////////
///////////////////////////////////////





    function debugMeStart() {

        if ( bug != undefined) {
            return;
        }

        bug = new debugMe();

        // tous les formulaires de la page
        forms = document.getElementsByTagName('form');

        globalThis.fof = submitFormOff    = bug.submitFormOff;
        globalThis.fon = submitFormOn     = bug.submitFormOn;
        globalThis.log = log              = bug.log;
        globalThis.df  = displayForms     = bug.displayForms;
        globalThis.cc  = getCookies       = bug.getCookies;
        globalThis.ids = findDuplicateIds = bug.findDuplicateIds;
        globalThis.sh  = bug.showHideInputHidden;


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

        // Fermeture du menu personnalisé lors d'un clic ailleurs
        document.addEventListener('click', () => {
            customMenu.style.display = 'none';
        });

        //Empécher la fermeture du menu lors d'un clic sur celui-ci
        // customMenu.addEventListener('click', (e) => {
        //     e.stopPropagation();
        // });


        function help(){

            console.groupCollapsed('%chelp debugMe click me !', 'color: #810015; font-size: 12px; ;background-color: #F0F0F0; padding: 1px 3px; border-radius: 5px;');
            console.log('Bienvenue dans le mode debug');
            console.log(`
                fof()   => Intercepter les formulaires\n
                fon()   => Autoriser les formulaires\n
                df()    => Afficher les formulaires\n
                cc()    => Afficher les cookies\n
                ids()   => Trouve les doublon d'id\n\n
                sh()    => Afficher les input hidden\n

                log() => custom console.log \n

                bug.confirmSend = false => Desactiver la confirmation (par defaut)\n
                bug.confirmSend = true => Activer la confirmation\n\n
                -------------------------------------------\n
                click droit + shift pour afficher le menu\n\n
                h() => Afficher l'aide\n
            `);

            // console.table(
            //     {"fof()": "Intercepter les formulaires", "fon()": "Autoriser les formulaires",
            //     "df()": "Afficher les formulaires", "cc()": "Afficher les cookies",
            //     "ids()": "Trouve les doublon d'id", "sh()": "Afficher les input hidden",
            //     "log()": "custom console.log", "h()": "Afficher l'aide"}
            // );

            console.groupEnd();
        }


        const style_h_hidden_h = document.createElement('style');
        style_h_hidden_h.textContent = `.h_hidden_h { border: 4px solid red !important;  } label.h_hidden_h_label { color: #8f2222;font-style: oblique;font-size: x-large;margin: 10px;}`;

        document.head.appendChild(style_h_hidden_h);


        ids();
        globalThis.h = help;
        help();   //retier cette ligne pour ne pas afficher l'aide au dÃ©marrage
    }

    debugMeStart();
})();
