// ==UserScript==
// @name         DebugJs-console-last
// @namespace    http://tampermonkey.net/
// @version      2024-08-05
// @description  try to take over the world!
// @author       wimbo
// @match         *://*/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=wrike.com
// @grant        none
// @run-at      document-start
// ==/UserScript==

(function() {
    'use strict';

    ////////////////////////////////////////
    // Event Listener Injection           //
    ////////////////////////////////////////

    // Injects a patch for `addEventListener` immediately to track listeners
    function inject(fn) {
        const s = document.createElement('script');
        s.textContent = '(' + fn.toString() + ')();';
        (document.head || document.documentElement).appendChild(s);
        s.remove();
    }

    inject(function() {
        const _origAdd = EventTarget.prototype.addEventListener;
        EventTarget.prototype.addEventListener = function(type, listener, options) {
            if (!this._debugJsListeners) {
                // Map<type, Array<callback>>
                Object.defineProperty(this, '_debugJsListeners', {
                    value: new Map(),
                    writable: false,
                    configurable: false,
                    enumerable: false
                });
            }
            const map = this._debugJsListeners;
            if (!map.has(type)) map.set(type, []);
            map.get(type).push(listener);
            return _origAdd.call(this, type, listener, options);
        };
    });

    ////////////////////////////////////////
    // DOM Ready Helper                   //
    ////////////////////////////////////////

    // Executes a function when the DOM is ready
    function onReady(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn();
        }
    }

    ////////////////////////////////////////
    // Main DebugJs Logic                 //
    ////////////////////////////////////////

    onReady(function debugJsMain() {

        let bug, forms = null;
        let submitFormOff, submitFormOn, log, displayForms, getCookies, findDuplicateIds = null;

        class debugMe {

            constructor() {
                this.confirmSend = false;
                this.blockForms = false;
                this.blockNetwork = false;
                this.blockedRequests = []; // Queue pour stocker les requêtes bloquées
            }

            ////////////////////////////////////////
            // Form Submission Handling           //
            ////////////////////////////////////////

            formSubmitListener = (event) => {
                if (!this.blockForms) return;

                event.preventDefault(); // Prevents form submission
                var formData = new FormData(event.target); // Retrieves form data

                // Group 1: Basic Form Data
                console.groupCollapsed('Form Data values');
                console.log('Action: ' + event.target.action);
                console.log('Method: ' + event.target.method);
                console.table(Array.from(formData.entries()));
                console.groupCollapsed('JSON');
                console.log(JSON.stringify(Object.fromEntries(formData.entries())));
                console.groupEnd();
                console.groupEnd();

                // Group 2: Detailed Form Data
                console.groupCollapsed('Form Data details');
                console.log('Action: ' + event.target.action);
                console.log('Method: ' + event.target.method);
                var data = []; // Array to store form data details
                for (var pair of formData.entries()) {
                    var input = event.target.elements[pair[0]];
                    var item = {
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

                // Confirmation for submission if confirmSend is true
                if (this.confirmSend) {
                    if (confirm('Soumettre le formulaire ?')) {
                        event.target.submit();
                    }
                }
            }

            // Attaches `formSubmitListener` to all forms to block submission
            submitFormOff = () => {
                for (var i = 0; i < forms.length; i++) {
                    forms[i].addEventListener('submit', this.formSubmitListener);
                }
                this.displayStatusOff();
                this.blockForms = true;
            }

            // Removes `formSubmitListener` from all forms to allow submission
            submitFormOn = () => {
                let forms = document.getElementsByTagName('form');
                for (let i = 0; i < forms.length; i++) {
                    forms[i].removeEventListener('submit', this.formSubmitListener);
                }
                this.removeDisplayOffStatus();
                this.blockForms = false;
            }

            ////////////////////////////////////////
            // Logging and Display Utilities      //
            ////////////////////////////////////////

            // Custom logging function with type and length information
            log = (args) => {
                let type = typeof args;
                if (args === null) {
                    type = 'null';
                }
                if (args === "object" && Array.isArray(args)) {
                    type = 'array';
                }

                console.log('%cType : ' + type, 'color: red');

                if (typeof args === 'string') {
                    console.log('%clength : ' + args.length, 'color: red');
                }

                if (typeof args === 'function') {
                    console.table(args); // Not useful to display function code
                } else {
                    console.log(args);
                }

                if (typeof args === 'object' || type === 'array') { // Explicitly check for array type
                    console.groupCollapsed('Displaying object');
                    console.table(args);
                    console.groupEnd();
                }
            }

            // Displays a status indicator when forms are blocked
            displayStatusOff = () => {
                if (document.getElementById('debugMeJs_status') != null)
                    return;

                const statusDiv = document.createElement('div');
                statusDiv.id = 'debugMeJs_status';
                statusDiv.style.cssText = `position: fixed; top: 0; left: 0; background: red; color:white;border: 1px solid #ccc; padding: 5px; z-index: 99999;`;
                statusDiv.innerHTML = `submit form off`;
                document.body.appendChild(statusDiv);
            }

            // Removes the status indicator
            removeDisplayOffStatus = () => {
                if (document.getElementById('debugMeJs_status') == null)
                    return;
                document.getElementById('debugMeJs_status').remove();
            }

            // Displays detailed information about all forms on the page
            displayForms = () => {
                forms = document.getElementsByTagName('form');

                if (forms == null || forms == undefined || forms.length == 0) {
                    console.error('Aucun formulaire');
                    return;
                }

                console.groupCollapsed('forms');
                this.log(forms);
                console.groupEnd();

                console.groupCollapsed('Forms_details ');
                for (let i = 0; i < forms.length; i++) {
                    console.groupCollapsed('Forms ' + i + ' : ' + forms[i].action);

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

                        if (input.type === 'submit' || input.type === 'button' || input.type === 'reset' || input.name.trim() == '') {
                            continue;
                        }

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

            // Retrieves and displays all cookies
            getCookies = () => {
                this.log(document.cookie);

                let cookies = document.cookie.split(';');
                let data = [];
                for (let i = 0; i < cookies.length; i++) {
                    let cookie = cookies[i].split('=');
                    let item = {
                        name: cookie[0].trim(), // Trim to remove leading/trailing spaces
                        value: cookie[1]
                    };
                    data.push(item);
                }
                console.groupCollapsed('Cookies');
                console.table(data);
                console.groupEnd();
            }

            // Finds and logs duplicate IDs in the DOM
            findDuplicateIds = () => {
                let identifiants = {}; // Object to store unique IDs
                let ArrayRef = []; // Array to store duplicate IDs

                let tousElements = document.all || document.getElementsByTagName("*"); // Get all DOM elements

                for (var i = 0, longueur = tousElements.length; i < longueur; i++) {
                    var id = tousElements[i].id; // Get the ID of the current element
                    if (id) { // Check if the element has an ID
                        if (identifiants[id]) { // Check if the ID is already in the identifiants object
                            if (!ArrayRef.includes(id)) { // If the ID is already in identifiants and not yet in ArrayRef
                                ArrayRef.push(id); // Add the ID to the ArrayRef
                            }
                        } else {
                            identifiants[id] = 1; // Add the ID to the identifiants object
                        }
                    }
                }

                if (ArrayRef.length > 0) {
                    console.groupCollapsed("%cDuplicate ids" + " (" + ArrayRef.length + ")", "color: red; font-weight: bold;");
                    console.table(ArrayRef);
                    console.groupEnd();
                } else {
                    console.log("%cAucun doublon d'identifiant trouvé :) ", "color: green; font-weight: bold;");
                }
            }

            // Toggles visibility of hidden input fields
            showHideInputHidden = () => {
                let inputs = document.getElementsByTagName('input');
                let show = false;
                let nbrInputHidden = 0;

                for (let i = 0; i < inputs.length; i++) {
                    if (inputs[i].type === 'hidden') {
                        inputs[i].classList.add('h_hidden_h');
                        inputs[i].type = "text";
                        show = true;
                        nbrInputHidden++;

                        // Create temp label for hidden input (label = input name), place label in DOM before input
                        let label = document.createElement('label');
                        let name_ = inputs[i].name;
                        let id_ = inputs[i].id;

                        let label_name = '';
                        let label_id = '';

                        if (name_ != '') {
                            label_name = ' name: ' + name_;
                        }
                        if (id_ != '') {
                            label_id = ' id: ' + id_;
                        }

                        label.textContent = ' ' + label_name + label_id;
                        label.classList.add('h_hidden_h_label');
                        inputs[i].parentNode.insertBefore(label, inputs[i]);
                    } else if (inputs[i].type === 'text' && inputs[i].classList.contains('h_hidden_h')) {
                        inputs[i].type = "hidden";
                        inputs[i].classList.remove('h_hidden_h');
                        nbrInputHidden++;

                        let labels = document.getElementsByClassName('h_hidden_h_label');
                        // Remove labels associated with the hidden inputs
                        // Iterate backwards as `remove()` affects live HTMLCollection
                        for (let j = labels.length - 1; j >= 0; j--) {
                            labels[j].remove();
                        }
                    }
                }

                if (nbrInputHidden === 0) {
                    console.log('%cAucun input hidden trouvé', 'color: orange');
                } else {
                    if (show) {
                        console.log('%cles input hidden sont visible', 'color: red');
                    } else {
                        console.log('%cles input hidden sont a nouveau dans l\'ombre', 'color: green');
                    }
                }
            }

            ////////////////////////////////////////
            // Network Monitoring                 //
            ////////////////////////////////////////

            // Bloque toutes les requêtes XHR/Fetch
            networkOff = () => {
                this.blockNetwork = true;
                this.blockedRequests = [];
                this.displayNetworkStatusOff();
                console.log('%cBlocage des requêtes réseau activé', 'color: red; font-weight: bold;');
            }

            // Débloque et relance toutes les requêtes en attente
            networkOn = () => {
                this.blockNetwork = false;
                this.removeNetworkDisplayOffStatus();

                // Relancer toutes les requêtes bloquées
                if (this.blockedRequests.length > 0) {
                    console.log(`%cRelance de ${this.blockedRequests.length} requête(s) en attente...`, 'color: green; font-weight: bold;');

                    this.blockedRequests.forEach(req => {
                        setTimeout(() => {
                            if (req.type === 'xhr') {
                                this.replayXHRRequest(req);
                            } else if (req.type === 'fetch') {
                                this.replayFetchRequest(req);
                            }
                        }, 100); // Petit délai pour éviter la surcharge
                    });

                    this.blockedRequests = [];
                }

                console.log('%cBlocage des requêtes réseau désactivé', 'color: green; font-weight: bold;');
            }

            // Rejoue une requête XHR bloquée
            replayXHRRequest = (req) => {
                const xhr = new XMLHttpRequest();
                xhr.open(req.method, req.url);

                // Restaurer les headers
                if (req.headers) {
                    Object.keys(req.headers).forEach(key => {
                        xhr.setRequestHeader(key, req.headers[key]);
                    });
                }

                console.log(`%cRelance XHR: ${req.method} ${req.url}`, 'color: blue; font-weight: bold;');
                xhr.send(req.data);
            }

            // Rejoue une requête Fetch bloquée
            replayFetchRequest = (req) => {
                console.log(`%cRelance Fetch: ${req.method} ${req.url}`, 'color: purple; font-weight: bold;');
                fetch(req.input, req.init).catch(err => {
                    console.error('Erreur lors de la relance Fetch:', err);
                });
            }

            // Affiche l'indicateur de blocage réseau
            displayNetworkStatusOff = () => {
                if (document.getElementById('debugMeJs_network_status') != null)
                    return;

                const statusDiv = document.createElement('div');
                statusDiv.id = 'debugMeJs_network_status';
                statusDiv.style.cssText = `position: fixed; top: 25px; left: 0; background: #cc0000; color:white;border: 1px solid #ccc; padding: 5px; z-index: 99999;`;
                statusDiv.innerHTML = `network requests blocked`;
                document.body.appendChild(statusDiv);
            }

            // Supprime l'indicateur de blocage réseau
            removeNetworkDisplayOffStatus = () => {
                if (document.getElementById('debugMeJs_network_status') == null)
                    return;
                document.getElementById('debugMeJs_network_status').remove();
            }

            // Intercepts XMLHttpRequest and Fetch API calls for logging and blocking
            monitorNetworkCalls = () => {
                // Intercept XMLHttpRequest
                const originalXHROpen = XMLHttpRequest.prototype.open;
                const originalXHRSend = XMLHttpRequest.prototype.send;

                XMLHttpRequest.prototype.open = function(method, url) {
                    this._requestMethod = method;
                    this._requestUrl = url;
                    this._requestHeaders = {};
                    return originalXHROpen.apply(this, arguments);
                };

                const originalSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;
                XMLHttpRequest.prototype.setRequestHeader = function(name, value) {
                    if (!this._requestHeaders) this._requestHeaders = {};
                    this._requestHeaders[name] = value;
                    return originalSetRequestHeader.apply(this, arguments);
                };

                XMLHttpRequest.prototype.send = function(data) {
                    const xhr = this;

                    // Si le blocage est activé, stocker la requête au lieu de l'envoyer
                    if (bug.blockNetwork) {
                        const blockedRequest = {
                            type: 'xhr',
                            method: xhr._requestMethod,
                            url: xhr._requestUrl,
                            data: data,
                            headers: xhr._requestHeaders,
                            timestamp: new Date().toISOString()
                        };

                        bug.blockedRequests.push(blockedRequest);

                        console.groupCollapsed(`%c[BLOQUÉ] XHR Request: ${xhr._requestMethod} ${xhr._requestUrl}`, 'color: #cc0000; font-weight: bold;');
                        console.log('Status: BLOQUÉ - En attente de déblocage');
                        console.log('Method:', xhr._requestMethod);
                        console.log('URL:', xhr._requestUrl);
                        console.log('Blocked at:', blockedRequest.timestamp);
                        if (data) {
                            console.groupCollapsed('Request Data');
                            try {
                                const jsonData = JSON.parse(data);
                                console.table(jsonData);
                            } catch (e) {
                                console.log(data);
                            }
                            console.groupEnd();
                        }
                        console.groupEnd();

                        return; // Bloque l'envoi
                    }

                    console.groupCollapsed(`%cXHR Request: ${xhr._requestMethod} ${xhr._requestUrl}`, 'color: #0066cc; font-weight: bold;');
                    console.log('Method:', xhr._requestMethod);
                    console.log('URL:', xhr._requestUrl);

                    if (data) {
                        console.groupCollapsed('Request Data');
                        try {
                            const jsonData = JSON.parse(data);
                            console.table(jsonData);
                        } catch (e) {
                            console.log(data);
                        }
                        console.groupEnd();
                    }

                    this.addEventListener('load', function() {
                        console.groupCollapsed('Response');
                        try {
                            const response = JSON.parse(xhr.responseText);
                            console.table(response);
                        } catch (e) {
                            console.log(xhr.responseText);
                        }
                        console.groupEnd();
                        console.groupEnd();
                    });

                    return originalXHRSend.apply(this, arguments);
                };

                // Intercept Fetch
                const originalFetch = window.fetch;
                window.fetch = function(input, init) {
                    const url = (typeof input === 'string') ? input : input.url;
                    const method = (init && init.method) ? init.method : 'GET';

                    // Si le blocage est activé, stocker la requête au lieu de l'envoyer
                    if (bug.blockNetwork) {
                        const blockedRequest = {
                            type: 'fetch',
                            input: input,
                            init: init,
                            method: method,
                            url: url,
                            timestamp: new Date().toISOString()
                        };

                        bug.blockedRequests.push(blockedRequest);

                        console.groupCollapsed(`%c[BLOQUÉ] Fetch Request: ${method} ${url}`, 'color: #cc0000; font-weight: bold;');
                        console.log('Status: BLOQUÉ - En attente de déblocage');
                        console.log('Method:', method);
                        console.log('URL:', url);
                        console.log('Blocked at:', blockedRequest.timestamp);
                        if (init && init.body) {
                            console.groupCollapsed('Request Body');
                            try {
                                const jsonData = JSON.parse(init.body);
                                console.table(jsonData);
                            } catch (e) {
                                console.log(init.body);
                            }
                            console.groupEnd();
                        }
                        console.groupEnd();

                        // Retourner une promesse qui ne se résout jamais (requête bloquée)
                        return new Promise(() => {});
                    }

                    console.groupCollapsed(`%cFetch Request: ${method} ${url}`, 'color: #6600cc; font-weight: bold;');
                    console.log('Method:', method);
                    console.log('URL:', url);

                    if (init && init.body) {
                        console.groupCollapsed('Request Body');
                        try {
                            const jsonData = JSON.parse(init.body);
                            console.table(jsonData);
                        } catch (e) {
                            console.log(init.body);
                        }
                        console.groupEnd();
                    }

                    return originalFetch.apply(this, arguments)
                        .then(response => {
                            const clonedResponse = response.clone();

                            clonedResponse.text().then(text => {
                                console.groupCollapsed('Response');
                                try {
                                    const jsonData = JSON.parse(text);
                                    console.table(jsonData);
                                } catch (e) {
                                    console.log(text);
                                }
                                console.groupEnd();
                                console.groupEnd();
                            });

                            return response;
                        });
                };

                console.log('%cMonitoring des appels réseau activé (XHR et Fetch)', 'color: green; font-weight: bold;');
            }

        } // End of debugMe class        ////////////////////////////////////////
        // Event Info Display (Info Panel) //
        ////////////////////////////////////////

        var elementsWithEvents = document.querySelectorAll('[onclick], [onchange], [onkeyup], [onkeydown], [onkeypress], [ondblclick]');
        var inputsElements = document.querySelectorAll('input, select, textarea, button');

        // Variable globale pour la position de l'info panel
        let infoPanelPosition = 'top-left'; // Position par défaut

        // Fonction pour obtenir les styles de position selon la position choisie
        function getInfoPanelPositionStyles(position) {
            const styles = {
                position: 'fixed',
                zIndex: '99999'
            };

            switch(position) {
                case 'top-left':
                    styles.top = '45px';
                    styles.left = '20px';
                    styles.right = 'auto';
                    styles.bottom = 'auto';
                    break;
                case 'top-right':
                    styles.top = '45px';
                    styles.right = '20px';
                    styles.left = 'auto';
                    styles.bottom = 'auto';
                    break;
                case 'bottom-left':
                    styles.bottom = '100px';
                    styles.left = '20px';
                    styles.top = 'auto';
                    styles.right = 'auto';
                    break;
                case 'bottom-right':
                    styles.bottom = '100px';
                    styles.right = '20px';
                    styles.top = 'auto';
                    styles.left = 'auto';
                    break;
            }
            return styles;
        }

        // Create the displayed element (renamed from topLeftCorner)
        var infoPanel = document.createElement('div');

        // Applique les styles de position par défaut
        const defaultStyles = getInfoPanelPositionStyles(infoPanelPosition);
        Object.assign(infoPanel.style, defaultStyles);
        // Styles additionnels pour l'info panel
        infoPanel.style.background = 'linear-gradient(135deg, rgba(20, 25, 33, 0.98) 0%, rgba(30, 35, 48, 0.95) 100%)';
        infoPanel.style.backdropFilter = 'blur(16px) saturate(180%)';
        infoPanel.style.padding = '16px 20px';
        infoPanel.style.color = '#f8fafc';
        infoPanel.style.display = 'none';
        infoPanel.style.borderRadius = '12px';
        infoPanel.style.border = '1px solid rgba(148, 163, 184, 0.2)';
        infoPanel.style.boxShadow = '0 24px 48px rgba(0, 0, 0, 0.4), 0 12px 24px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.08)';
        infoPanel.style.fontFamily = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        infoPanel.style.fontSize = '14px';
        infoPanel.style.lineHeight = '1.5';
        infoPanel.style.letterSpacing = '0.02em';
        infoPanel.style.minWidth = '200px';
        infoPanel.style.maxWidth = '350px';
        infoPanel.style.opacity = '0';
        infoPanel.style.transform = 'translateY(-8px) scale(0.95)';
        infoPanel.style.transition = 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)';
        infoPanel.id = 'debugInfoPanel';
        document.body.appendChild(infoPanel);

        // Fonction pour changer la position de l'info panel
        function changeInfoPanelPosition(newPosition) {
            infoPanelPosition = newPosition;
            const newStyles = getInfoPanelPositionStyles(newPosition);

            // Applique les nouveaux styles de position
            Object.assign(infoPanel.style, newStyles);

            console.log(`%cPosition de l'info panel changée : ${newPosition}`, 'color: #10b981; font-weight: bold;');
        }        let hideTimeout; // Variable pour stocker le timeout de masquage

        // Fonction pour cacher l'info panel
        function hideInfoPanel() {
            clearTimeout(hideTimeout); // Annule tout timeout en cours
            hideTimeout = setTimeout(() => {
                infoPanel.style.display = 'none';
            }, 4000); // Cache après 4 secondes
        }

        // Variables globales pour Prism.js
        let activeTooltips = [];
        let tooltipHideTimer = null;

        // Fonction pour nettoyer tous les tooltips existants
        function clearAllTooltips() {
            activeTooltips.forEach(tooltip => {
                if (tooltip && tooltip.parentNode) {
                    tooltip.remove();
                }
            });
            activeTooltips = [];
            if (tooltipHideTimer) {
                clearTimeout(tooltipHideTimer);
                tooltipHideTimer = null;
            }
        }

        // Fonction pour créer le CSS de coloration syntaxique JavaScript personnalisé
        function createCustomJSSyntaxCSS() {
            const customSyntaxCSS = document.createElement('style');
            customSyntaxCSS.id = 'custom-js-syntax-highlighting';
            customSyntaxCSS.textContent = `
                /* Style Okaidia personnalisé pour JavaScript */
                .dbg-modern-tooltip pre {
                    background: #272822 !important;
                    color: #f8f8f2;
                    margin: 0;
                    padding: 20px 24px;
                    overflow: auto;
                    border-radius: 12px;
                    font-family: "JetBrains Mono", "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace;
                    font-size: 13px;
                    line-height: 1.6;
                }

                .dbg-modern-tooltip code {
                    background: transparent !important;
                    color: #f8f8f2;
                    font-family: inherit;
                    font-size: inherit;
                    white-space: pre-wrap;
                    word-break: break-word;
                }

                /* Mots-clés JavaScript */
                .js-keyword {
                    color: #66d9ef !important;
                    font-weight: bold;
                }

                /* Chaînes de caractères */
                .js-string {
                    color: #e6db74 !important;
                }

                /* Nombres */
                .js-number {
                    color: #ae81ff !important;
                }

                /* Commentaires */
                .js-comment {
                    color: #75715e !important;
                    font-style: italic;
                }

                /* Fonctions */
                .js-function {
                    color: #a6e22e !important;
                }

                /* Opérateurs */
                .js-operator {
                    color: #f92672 !important;
                }

                /* Ponctuation */
                .js-punctuation {
                    color: #f8f8f2 !important;
                }

                /* Variables et propriétés */
                .js-property {
                    color: #fd971f !important;
                }

                /* Boolean et null */
                .js-boolean {
                    color: #ae81ff !important;
                }

                /* Regex */
                .js-regex {
                    color: #f92672 !important;
                }
            `;
            document.head.appendChild(customSyntaxCSS);
        }

        // Fonction pour coloriser le code JavaScript manuellement (version corrigée)
        function highlightJavaScript(code) {
            // Mots-clés JavaScript
            const keywords = [
                'abstract', 'await', 'boolean', 'break', 'byte', 'case', 'catch', 'char', 'class', 'const',
                'continue', 'debugger', 'default', 'delete', 'do', 'double', 'else', 'enum', 'export',
                'extends', 'false', 'final', 'finally', 'float', 'for', 'function', 'goto', 'if',
                'implements', 'import', 'in', 'instanceof', 'int', 'interface', 'let', 'long', 'native',
                'new', 'null', 'package', 'private', 'protected', 'public', 'return', 'short', 'static',
                'super', 'switch', 'synchronized', 'this', 'throw', 'throws', 'transient', 'true', 'try',
                'typeof', 'var', 'void', 'volatile', 'while', 'with', 'yield', 'async', 'of'
            ];

            let highlightedCode = code;

            // Échapper le HTML d'abord
            highlightedCode = highlightedCode
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');

            // Créer un tableau pour éviter les remplacements en cascade
            const tokens = [];
            let currentIndex = 0;

            // Fonction helper pour ajouter un token
            function addToken(match, offset, className) {
                tokens.push({
                    start: offset,
                    end: offset + match.length,
                    original: match,
                    className: className
                });
            }

            // Trouver les commentaires
            const commentRegex = /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm;
            let match;
            while ((match = commentRegex.exec(highlightedCode)) !== null) {
                addToken(match[0], match.index, 'js-comment');
            }

            // Trouver les chaînes de caractères
            const stringRegex = /(['"`])((?:(?!\1)[^\\]|\\.)*)(\1)/g;
            while ((match = stringRegex.exec(highlightedCode)) !== null) {
                addToken(match[0], match.index, 'js-string');
            }

            // Trouver les nombres
            const numberRegex = /\b(\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\b/g;
            while ((match = numberRegex.exec(highlightedCode)) !== null) {
                addToken(match[0], match.index, 'js-number');
            }

            // Trouver les mots-clés
            keywords.forEach(keyword => {
                const regex = new RegExp(`\\b(${keyword})\\b`, 'g');
                while ((match = regex.exec(highlightedCode)) !== null) {
                    addToken(match[0], match.index, 'js-keyword');
                }
            });

            // Trouver les fonctions (nom suivi de parenthèses)
            const functionRegex = /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?=\()/g;
            while ((match = functionRegex.exec(highlightedCode)) !== null) {
                addToken(match[1], match.index, 'js-function');
            }


            const propertyRegex = /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\.\s*([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
            while ((match = propertyRegex.exec(highlightedCode)) !== null) {
                addToken(match[2], match.index + match[1].length + 1, 'js-function');
            }

            // Trier les tokens par position pour éviter les conflits
            tokens.sort((a, b) => a.start - b.start);

            // Supprimer les tokens qui se chevauchent (garder le premier)
            const cleanTokens = [];
            let lastEnd = 0;
            tokens.forEach(token => {
                if (token.start >= lastEnd) {
                    cleanTokens.push(token);
                    lastEnd = token.end;
                }
            });

            // Appliquer la coloration en commençant par la fin pour ne pas décaler les indices
            cleanTokens.reverse().forEach(token => {
                const before = highlightedCode.substring(0, token.start);
                const content = highlightedCode.substring(token.start, token.end);
                const after = highlightedCode.substring(token.end);

                highlightedCode = before +
                    `<span class="${token.className}">${content}</span>` +
                    after;
            });

            return highlightedCode;
        }

        // Fonction pour afficher les informations de l'élément
        function showEventInfo(eventType, element, haveEvent = false) {
            clearTimeout(hideTimeout); // Annule le masquage si on interagit à nouveau
            let info = '';

            // Si l'élément a un attribut d'événement (onclick, onchange, etc.)
            if (eventType && element.hasAttribute(eventType)) {
                const attrCode = element.getAttribute(eventType);
                info += `<span class="dbg-attr-event" data-code="${attrCode}" style="color:#fb7185;text-decoration:underline;cursor:pointer;font-weight:500;">${eventType} :</span> <span style="color:#e2e8f0;">${attrCode}</span><br>`;
            }

            // Add ID if it exists
            if (element.id) {
                info += `<span style="color:#fb7185;font-weight:500;">id :</span> <span style="color:#94a3b8;">${element.id}</span><br>`;
            }

            // Display addEventListener list
            if (element._debugJsListeners && element._debugJsListeners.size > 0) {
                element._debugJsListeners.forEach((callbacks, type) => {
                    info += `<span class="dbg-listener" data-type="${type}" style="color:#60a5fa;text-decoration:underline;cursor:pointer;font-weight:500;">${type}</span><br>`;
                });
            }
            // Add name if it exists
            if (element.name) {
                info += `<span style="color:#fb7185;font-weight:500;">name :</span> <span style="color:#94a3b8;">${element.name}</span><br>`;
            }            // Update only the content
            infoPanel.innerHTML = '';
            infoPanel.innerHTML += info;

            // Animation d'apparition moderne
            infoPanel.style.display = 'block';
            requestAnimationFrame(() => {
                infoPanel.style.opacity = '1';
                infoPanel.style.transform = 'translateY(0px) scale(1)';
            });

            // Fonction moderne pour créer et afficher un tooltip
            function createModernTooltip(e, content) {                // Nettoyer les tooltips existants
                clearAllTooltips();

                // Empêche l'infoPanel de disparaître
                clearTimeout(hideTimeout);

                // Créer le CSS personnalisé s'il n'existe pas
                if (!document.getElementById('custom-js-syntax-highlighting')) {
                    createCustomJSSyntaxCSS();
                }

                const tooltip = document.createElement('div');
                tooltip.className = 'dbg-modern-tooltip';

                // Vérifier si le contenu est trop long et le tronquer si nécessaire
                let displayContent = content;
                if (displayContent.length > 10000) {
                    displayContent = displayContent.substring(0, 10000) + '\n\n... [Code tronqué - trop long pour l\'affichage]';
                }

                // Coloriser le code avec notre fonction personnalisée corrigée
                const highlightedCode = highlightJavaScript(displayContent);

                // Créer le contenu sans risque de balises non fermées
                const pre = document.createElement('pre');
                const code = document.createElement('code');
                code.className = 'language-js';
                code.innerHTML = highlightedCode;
                pre.appendChild(code);
                tooltip.appendChild(pre);

                // Calcul de position intelligente
                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;
                const tooltipWidth = Math.min(600, viewportWidth * 0.8);
                const tooltipHeight = Math.min(400, viewportHeight * 0.6);

                let left = e.clientX + 15;
                let top = e.clientY + 15;

                // Ajustement si débordement à droite
                if (left + tooltipWidth > viewportWidth - 20) {
                    left = e.clientX - tooltipWidth - 15;
                }

                // Ajustement si débordement en bas
                if (top + tooltipHeight > viewportHeight - 20) {
                    top = e.clientY - tooltipHeight - 15;
                }

                // Styles modernes avec glassmorphism
                Object.assign(tooltip.style, {
                    position: 'fixed',
                    top: `${Math.max(10, top)}px`,
                    left: `${Math.max(10, left)}px`,
                    maxWidth: `${tooltipWidth}px`,
                    maxHeight: `${tooltipHeight}px`,
                    padding: '0',
                    background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(45, 55, 72, 0.98) 100%)',
                    backdropFilter: 'blur(20px) saturate(180%)',
                    border: '1px solid rgba(148, 163, 184, 0.15)',
                    borderRadius: '16px',
                    boxShadow: '0 32px 64px rgba(0, 0, 0, 0.4), 0 16px 32px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                    color: '#f1f5f9',
                    fontSize: '13px',
                    fontFamily: '"JetBrains Mono", "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
                    fontWeight: '400',
                    lineHeight: '1.6',
                    letterSpacing: '0.025em',
                    overflow: 'hidden',
                    zIndex: '100000',
                    opacity: '0',
                    transform: 'translateY(12px) scale(0.92)',
                    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                    cursor: 'text',
                    userSelect: 'text'
                });

                // Styles supplémentaires pour le scrolling
                const style = document.createElement('style');
                style.textContent = `
                    .dbg-modern-tooltip pre {
                        max-height: ${tooltipHeight - 40}px;
                        scrollbar-width: thin;
                        scrollbar-color: rgba(148, 163, 184, 0.3) transparent;
                    }
                    .dbg-modern-tooltip pre::-webkit-scrollbar {
                        width: 8px;
                        height: 8px;
                    }
                    .dbg-modern-tooltip pre::-webkit-scrollbar-track {
                        background: rgba(148, 163, 184, 0.1);
                        border-radius: 4px;
                    }
                    .dbg-modern-tooltip pre::-webkit-scrollbar-thumb {
                        background: rgba(148, 163, 184, 0.3);
                        border-radius: 4px;
                    }
                    .dbg-modern-tooltip pre::-webkit-scrollbar-thumb:hover {
                        background: rgba(148, 163, 184, 0.5);
                    }
                `;
                document.head.appendChild(style);

                document.body.appendChild(tooltip);
                activeTooltips.push(tooltip);

                // Animation d'apparition
                requestAnimationFrame(() => {
                    tooltip.style.opacity = '1';
                    tooltip.style.transform = 'translateY(0px) scale(1)';
                });

                // Gestion des événements pour persistance améliorée
                const handleMouseEnter = () => {
                    // Annuler DÉFINITIVEMENT tous les timers de disparition
                    if (tooltipHideTimer) {
                        clearTimeout(tooltipHideTimer);
                        tooltipHideTimer = null;
                    }
                    clearTimeout(hideTimeout);

                    // Marquer le tooltip comme étant survolé
                    tooltip.setAttribute('data-hovered', 'true');
                };

                const handleMouseLeave = () => {
                    // Retirer le marqueur de survol
                    tooltip.removeAttribute('data-hovered');

                    // Délai généreux quand on quitte le tooltip
                    tooltipHideTimer = setTimeout(() => {
                        clearAllTooltips();
                        hideTopLeftCorner();
                    }, 800);
                };

                tooltip.addEventListener('mouseenter', handleMouseEnter);
                tooltip.addEventListener('mouseleave', handleMouseLeave);

                return tooltip;
            }            // Add event listeners for the 'dbg-listener' spans (addEventListener callbacks)
            const listenerSpans = infoPanel.querySelectorAll('.dbg-listener');
            listenerSpans.forEach(span => {
                span.addEventListener('mouseenter', function(e) {
                    // Annuler immédiatement tout timer de disparition
                    if (tooltipHideTimer) {
                        clearTimeout(tooltipHideTimer);
                        tooltipHideTimer = null;
                    }
                    clearTimeout(hideTimeout);

                    const type = this.dataset.type;
                    const callbacks = element._debugJsListeners.get(type);
                    const content = callbacks.map(fn => fn.toString()).join('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n');
                    createModernTooltip(e, content);
                });
                span.addEventListener('mouseleave', function() {
                    // Vérifier si un tooltip est survolé avant de programmer sa disparition
                    tooltipHideTimer = setTimeout(() => {
                        // Double vérification : ne supprimer que si aucun tooltip n'est survolé
                        const hoveredTooltip = document.querySelector('.dbg-modern-tooltip[data-hovered="true"]');
                        if (!hoveredTooltip && activeTooltips.length > 0) {
                            clearAllTooltips();
                            hideInfoPanel();
                        }
                    }, 800);
                });
            });

            // Add event listeners for the 'dbg-attr-event' spans (inline event attributes)
            const attrEventSpans = infoPanel.querySelectorAll('.dbg-attr-event');
            attrEventSpans.forEach(span => {
                span.addEventListener('mouseenter', function(e) {
                    // Annuler immédiatement tout timer de disparition
                    if (tooltipHideTimer) {
                        clearTimeout(tooltipHideTimer);
                        tooltipHideTimer = null;
                    }
                    clearTimeout(hideTimeout);

                    const content = this.dataset.code;
                    createModernTooltip(e, content);
                });
                span.addEventListener('mouseleave', function() {
                    // Vérifier si un tooltip est survolé avant de programmer sa disparition
                    tooltipHideTimer = setTimeout(() => {
                        // Double vérification : ne supprimer que si aucun tooltip n'est survolé
                        const hoveredTooltip = document.querySelector('.dbg-modern-tooltip[data-hovered="true"]');
                        if (!hoveredTooltip && activeTooltips.length > 0) {
                            clearAllTooltips();
                            hideInfoPanel();
                        }
                    }, 200);
                });
            });

            hideInfoPanel(); // Déclenche le masquage après 4 secondes si pas d'interaction
        }

        // Add mouseover/mouseout listeners to elements
        let timeoutId__;

        inputsElements.forEach(function(element) {
            element.addEventListener('mouseover', function() {
                timeoutId__ = setTimeout(function() {
                    // Passe null pour eventType pour les inputs sans attribut d'événement inline
                    showEventInfo(null, element, false);
                }, 400);
            });

            element.addEventListener('mouseout', function() {
                clearTimeout(timeoutId__);
            });
        });

        elementsWithEvents.forEach(function(element) {
            ['onclick', 'onchange', 'onkeyup', 'onkeydown', 'onkeypress', 'ondblclick'].forEach(function(eventType) {
                if (element.hasAttribute(eventType)) {
                    element.addEventListener('mouseover', function() {
                        timeoutId__ = setTimeout(function() {
                            showEventInfo(eventType, element);
                        }, 400);
                    });

                    element.addEventListener('mouseout', function() {
                        clearTimeout(timeoutId__);
                    });
                }
            });
        });        // Gérer le masquage de l'infoPanel si la souris quitte la zone elle-même
        infoPanel.addEventListener('mouseenter', () => {
            clearTimeout(hideTimeout); // Annule le masquage si la souris entre dans l'infoPanel
            if (tooltipHideTimer) {
                clearTimeout(tooltipHideTimer);
                tooltipHideTimer = null;
            }
        });
        infoPanel.addEventListener('mouseleave', () => {
            hideInfoPanel(); // Réactive le masquage si la souris quitte l'infoPanel
            if (activeTooltips.length > 0) {
                tooltipHideTimer = setTimeout(() => {
                    clearAllTooltips();
                }, 500);
            }
        });

        // Nettoyer les tooltips lors du scroll ou resize
        window.addEventListener('scroll', clearAllTooltips);
        window.addEventListener('resize', clearAllTooltips);


        ////////////////////////////////////////
        // Initialization and Global Access   //
        ////////////////////////////////////////

        function debugMeStart() {
            if (bug != undefined) {
                return;
            }

            bug = new debugMe();

            // Get all forms on the page
            forms = document.getElementsByTagName('form');

            // Expose functions globally for console access
            globalThis.fof = submitFormOff = bug.submitFormOff;
            globalThis.fon = submitFormOn = bug.submitFormOn;
            globalThis.log = log = bug.log;
            globalThis.df = displayForms = bug.displayForms;
            globalThis.cc = getCookies = bug.getCookies;
            globalThis.ids = findDuplicateIds = bug.findDuplicateIds;
            globalThis.sh = bug.showHideInputHidden;
            globalThis.net = bug.monitorNetworkCalls;
            globalThis.netoff = bug.networkOff;  // Nouvelle fonction de blocage
            globalThis.neton = bug.networkOn;    // Nouvelle fonction de déblocage

            globalThis.bug = bug;
            globalThis.forms_ = forms;

            ////////////////////////////////////////
            // Traditional Floating Menu          //
            ////////////////////////////////////////

            // Bouton flottant principal
            const floatingBtn = document.createElement('div');
            floatingBtn.id = 'debug-floating-btn';
            floatingBtn.innerHTML = '⚙️';
            floatingBtn.style.cssText = `
                position: fixed;
                bottom: 30px;
                right: 30px;
                width: 50px;
                height: 50px;
                background: #2d3748;
                border: 1px solid #4a5568;
                border-radius: 8px;
                color: #e2e8f0;
                font-size: 16px;
                cursor: pointer;
                z-index: 99999;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                transition: all 0.2s ease;
                user-select: none;
            `;

            // Menu principal
            const mainMenu = document.createElement('div');
            mainMenu.id = 'debug-main-menu';
            mainMenu.style.cssText = `
                position: fixed;
                bottom: 90px;
                right: 30px;
                background: #2d3748;
                border: 1px solid #4a5568;
                border-radius: 8px;
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
                z-index: 99998;
                min-width: 200px;
                opacity: 0;
                transform: translateY(10px);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                pointer-events: none;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                overflow: hidden;
            `;            // Définition des catégories et options
            const menuStructure = [
                {
                    title: 'Formulaires',
                    icon: '📋',
                    items: [
                        { icon: '🔒', text: 'Intercepter', action: () => bug.submitFormOff() },
                        { icon: '✅', text: 'Autoriser', action: () => bug.submitFormOn() },
                        { icon: '👁️', text: 'Afficher', action: () => displayForms() }
                    ]
                },
                {
                    title: 'Réseau',
                    icon: '📡',
                    items: [
                        { icon: '🚫', text: 'Bloquer', action: () => bug.networkOff() },
                        { icon: '✅', text: 'Autoriser', action: () => bug.networkOn() },
                        { icon: '📊', text: 'Monitorer', action: () => bug.monitorNetworkCalls() }
                    ]
                },
                {
                    title: 'Position Info Panel',
                    icon: '📍',
                    items: [
                        { icon: '↖️', text: 'Haut Gauche', action: () => changeInfoPanelPosition('top-left') },
                        { icon: '↗️', text: 'Haut Droite', action: () => changeInfoPanelPosition('top-right') },
                        { icon: '↙️', text: 'Bas Gauche', action: () => changeInfoPanelPosition('bottom-left') },
                        { icon: '↘️', text: 'Bas Droite', action: () => changeInfoPanelPosition('bottom-right') }
                    ]
                },
                {
                    title: 'Outils',
                    icon: '🔧',
                    items: [
                        { icon: '🔍', text: 'Doublons ID', action: () => findDuplicateIds() },
                        { icon: '👁️', text: 'Input cachés', action: () => bug.showHideInputHidden() },
                        { icon: '🍪', text: 'Cookies', action: () => bug.getCookies() }
                    ]
                }
            ];

            let isMenuOpen = false;

            // Construire le menu
            menuStructure.forEach((category, categoryIndex) => {
                // Titre de catégorie
                const categoryHeader = document.createElement('div');
                categoryHeader.style.cssText = `
                    padding: 12px 16px 8px 16px;
                    font-size: 13px;
                    font-weight: 600;
                    color: #a0aec0;
                    border-bottom: 1px solid #4a5568;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: #1a202c;
                `;
                categoryHeader.innerHTML = `<span>${category.icon}</span>${category.title}`;
                mainMenu.appendChild(categoryHeader);

                // Items de la catégorie
                category.items.forEach((item, itemIndex) => {
                    const menuItem = document.createElement('div');
                    menuItem.style.cssText = `
                        padding: 10px 16px;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        font-size: 14px;
                        color: #e2e8f0;
                        transition: all 0.15s ease;
                        border-bottom: ${itemIndex < category.items.length - 1 ? '1px solid #4a5568' : 'none'};
                    `;
                    menuItem.innerHTML = `<span style="font-size: 16px;">${item.icon}</span>${item.text}`;

                    menuItem.addEventListener('mouseenter', () => {
                        menuItem.style.backgroundColor = '#4a5568';
                        menuItem.style.color = '#ffffff';
                    });

                    menuItem.addEventListener('mouseleave', () => {
                        menuItem.style.backgroundColor = 'transparent';
                        menuItem.style.color = '#e2e8f0';
                    });

                    menuItem.addEventListener('click', () => {
                        item.action();
                        closeMenu();
                    });

                    mainMenu.appendChild(menuItem);
                });

                // Séparateur entre catégories (sauf pour la dernière)
                if (categoryIndex < menuStructure.length - 1) {
                    const separator = document.createElement('div');
                    separator.style.cssText = `
                        height: 1px;
                        background: #4a5568;
                        margin: 4px 0;
                    `;
                    mainMenu.appendChild(separator);
                }
            });

            function openMenu() {
                isMenuOpen = true;
                mainMenu.style.opacity = '1';
                mainMenu.style.transform = 'translateY(0px)';
                mainMenu.style.pointerEvents = 'auto';

                floatingBtn.style.backgroundColor = '#4a5568';
                floatingBtn.style.borderColor = '#718096';
                floatingBtn.style.transform = 'rotate(90deg)';
            }

            function closeMenu() {
                isMenuOpen = false;
                mainMenu.style.opacity = '0';
                mainMenu.style.transform = 'translateY(10px)';
                mainMenu.style.pointerEvents = 'none';

                floatingBtn.style.backgroundColor = '#2d3748';
                floatingBtn.style.borderColor = '#4a5568';
                floatingBtn.style.transform = 'rotate(0deg)';
            }

            // Event listeners
            floatingBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (isMenuOpen) {
                    closeMenu();
                } else {
                    openMenu();
                }
            });

            // Fermer le menu en cliquant ailleurs
            document.addEventListener('click', (e) => {
                if (!mainMenu.contains(e.target) && !floatingBtn.contains(e.target)) {
                    closeMenu();
                }
            });

            // Hover effects pour le bouton principal
            floatingBtn.addEventListener('mouseenter', () => {
                if (!isMenuOpen) {
                    floatingBtn.style.backgroundColor = '#4a5568';
                    floatingBtn.style.borderColor = '#718096';
                }
                floatingBtn.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.4)';
            });

            floatingBtn.addEventListener('mouseleave', () => {
                if (!isMenuOpen) {
                    floatingBtn.style.backgroundColor = '#2d3748';
                    floatingBtn.style.borderColor = '#4a5568';
                }
                floatingBtn.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
            });

            // Ajouter les éléments au DOM
            document.body.appendChild(floatingBtn);
            document.body.appendChild(mainMenu);


            ////////////////////////////////////////
            // Custom Context Menu                //
            ////////////////////////////////////////

            const customMenu = document.createElement('div');
            customMenu.id = 'debug-context-menu';
            customMenu.style.cssText = `
                display: none;
                position: fixed;
                background: white;
                border: 1px solid rgb(239 167 167);
                box-shadow: 2px 2px 5px rgba(0,0,0,0.1);
                z-index: 99999; /* Mis à jour pour être 99999 */
            `;            // Menu options
            const options = [{
                text: 'Intercepter les Formulaires',
                action: () => bug.submitFormOff()
            }, {
                text: 'Autoriser les Formulaires',
                action: () => bug.submitFormOn()
            }, {
                text: 'Afficher les Formulaires',
                action: () => displayForms()
            }, {
                text: '---------------',
                action: () => {}
            }, {
                text: 'Bloquer Requêtes Réseau',
                action: () => bug.networkOff()
            }, {
                text: 'Autoriser Requêtes Réseau',
                action: () => bug.networkOn()
            }, {
                text: 'Monitorer Appels Réseau',
                action: () => bug.monitorNetworkCalls()
            }, {
                text: '---------------',
                action: () => {}
            }, {
                text: 'Position Info Panel - Haut Gauche',
                action: () => changeInfoPanelPosition('top-left')
            }, {
                text: 'Position Info Panel - Haut Droite',
                action: () => changeInfoPanelPosition('top-right')
            }, {
                text: 'Position Info Panel - Bas Gauche',
                action: () => changeInfoPanelPosition('bottom-left')
            }, {
                text: 'Position Info Panel - Bas Droite',
                action: () => changeInfoPanelPosition('bottom-right')
            }, {
                text: '---------------',
                action: () => {}
            }, {
                text: 'Trouver les doublons d\'id',
                action: () => findDuplicateIds()
            }, {
                text: 'Afficher/Cacher les input hidden',
                action: () => bug.showHideInputHidden()
            }, {
                text: '---------------',
                action: () => {}
            }, {
                text: 'Console.log',
                action: () => log('Hello World !')
            }, {
                text: '---------------',
                action: () => {}
            }, {
                text: 'Aide',
                action: () => help()
            }, {
                text: '---------------',
                action: () => {}
            }, {
                text: 'Afficher le cookie',
                action: () => bug.getCookies()
            }, ];

            options.forEach(option => {
                const item = document.createElement('div');
                item.textContent = option.text;
                item.style.cssText = ` padding: 8px 12px; cursor: pointer;color:red `;
                item.addEventListener('mouseenter', () => item.style.backgroundColor = '#F0F0F0');
                item.addEventListener('mouseleave', () => item.style.backgroundColor = 'white');
                item.addEventListener('click', option.action);
                customMenu.appendChild(item);
            });

            // Add the menu to the document body
            document.body.appendChild(customMenu);

            // Handle menu display on Shift + Right-click
            document.addEventListener('contextmenu', (e) => {
                if (e.shiftKey) {
                    e.preventDefault();
                    customMenu.style.display = 'block';
                    customMenu.style.left = `${e.pageX}px`;
                    customMenu.style.top = `${e.pageY}px`;
                }
            });

            // Close the custom menu when clicking elsewhere
            document.addEventListener('click', () => {
                customMenu.style.display = 'none';
            });

            ////////////////////////////////////////
            // Help Function                      //
            ////////////////////////////////////////

             function help() {
                console.groupCollapsed('%cexample help debugMe click me !', 'color: #810015; font-size: 12px; ;background-color: #F0F0F0; padding: 1px 3px; border-radius: 5px;');

                console.log(
                    "%c🔧 DebugJs - Outil de debugging web professionnel ..ou pas...\n" +
                    "%c═══════════════════════════════════════════════════════════════\n\n" +
                    "%c📋 FORMULAIRES\n" +
                    "%c  fof()     → Intercepter tous les formulaires (bloque la soumission)\n" +
                    "%c  fon()     → Autoriser les formulaires (débloque la soumission)\n" +
                    "%c  df()      → Afficher tous les formulaires de la page avec détails\n\n" +
                    "%c📡 RÉSEAU\n" +
                    "%c  netoff()  → Bloquer toutes les requêtes réseau (XHR/Fetch)\n" +
                    "%c  neton()   → Autoriser et relancer les requêtes bloquées\n" +
                    "%c  net()     → Monitorer les appels réseau (logs détaillés)\n\n" +
                    "%c🔧 OUTILS\n" +
                    "%c  ids()     → Détecter les doublons d'ID dans le DOM\n" +
                    "%c  sh()      → Afficher/Masquer les input hidden\n" +
                    "%c  cc()      → Afficher tous les cookies de la page\n" +
                    "%c  log(x)    → Console.log amélioré avec type et détails\n\n" +
                    "%c🔍 FONCTIONNALITÉS AUTOMATIQUES\n" +
                    "%c  • Révélation des mots de passe au survol\n" +
                    "%c  • Affichage des event listeners au survol des éléments\n" +
                    "%c  • Inspection des attributs onclick, onchange, etc.\n" +
                    "%c  • Tooltips avec le code des fonctions\n\n" +
                    "%c⚙️ CONFIGURATION\n" +
                    "%c  bug.confirmSend = true/false  → Activer/désactiver la confirmation\n" +
                    "%c  bug.blockForms               → État du blocage formulaires\n" +
                    "%c  bug.blockNetwork             → État du blocage réseau\n" +
                    "%c  bug.blockedRequests          → Queue des requêtes bloquées\n\n" +
                    "%c🎯 ACCÈS RAPIDE\n" +
                    "%c  • Bouton flottant en bas à droite (menu moderne)\n" +
                    "%c  • SHIFT + Clic droit → Menu contextuel classique\n" +
                    "%c  • h() → Afficher cette aide\n\n" +
                    "%c💡 ASTUCES\n" +
                    "%c  • Survolez les champs password pour les révéler\n" +
                    "%c  • Survolez les éléments pour voir leurs événements\n" +
                    "%c  • Les requêtes bloquées sont stockées et rejouées au déblocage\n" +
                    "%c  • Les indicateurs visuels apparaissent en haut à gauche\n\n" +
                    "%c═══════════════════════════════════════════════════════════════\n" +
                    "%cDéveloppé avec 🚬 🌿 🌈 ☕ pour simplifier le debugging web 🚀",

                   "color: #b1b1b1; font-weight: bold; font-size: 16px;", // Titre principal
                    "color: #c1c1c1;", // Séparateur
                    "color: #3b82f6; font-weight: bold; font-size: 14px;", // 📋 FORMULAIRES
                    "color: #c1c1c1;", // fof()
                    "color: #c1c1c1;", // fon()
                    "color: #c1c1c1;", // df()
                    "color: #8b5cf6; font-weight: bold; font-size: 14px;", // 📡 RÉSEAU
                    "color: #c1c1c1;", // netoff()
                    "color: #c1c1c1;", // neton()
                    "color: #c1c1c1;", // net()
                    "color: #f59e0b; font-weight: bold; font-size: 14px;", // 🔧 OUTILS
                    "color: #c1c1c1;", // ids()
                    "color: #c1c1c1;", // sh()
                    "color: #c1c1c1;", // cc()
                    "color: #c1c1c1;", // log()
                    "color: #10b981; font-weight: bold; font-size: 14px;", // 🔍 FONCTIONNALITÉS
                    "color: #c1c1c1;", // révélation
                    "color: #c1c1c1;", // affichage
                    "color: #c1c1c1;", // inspection
                    "color: #c1c1c1;", // tooltips
                    "color: #6366f1; font-weight: bold; font-size: 14px;", // ⚙️ CONFIGURATION
                    "color: #c1c1c1;", // confirmSend
                    "color: #c1c1c1;", // blockForms
                    "color: #c1c1c1;", // blockNetwork
                    "color: #c1c1c1;", // blockedRequests
                    "color: #ef4444; font-weight: bold; font-size: 14px;", // 🎯 ACCÈS
                    "color: #c1c1c1;", // bouton flottant
                    "color: #c1c1c1;", // shift clic
                    "color: #c1c1c1;", // h()
                    "color: #f97316; font-weight: bold; font-size: 14px;", // 💡 ASTUCES
                    "color: #c1c1c1;", // password
                    "color: #c1c1c1;", // survol
                    "color: #c1c1c1;", // requêtes
                    "color: #c1c1c1;", // indicateurs
                    "color: #c1c1c1;", // séparateur final
                    "color: #6b7280; font-style: italic;" // signature

                );

                console.groupEnd();
                console.log("%c🎮 Interface graphique disponible via le bouton flottant", "color: #10b981; font-weight: bold;");
                console.log("%c⌨️  Menu rapide : SHIFT + clic droit ( Ancienne UI )", "color: #f59e0b; font-weight: bold;");
            }

            ////////////////////////////////////////
            // Styles for Hidden Inputs           //
            ////////////////////////////////////////

          const style_h_hidden_h = document.createElement('style');
            style_h_hidden_h.textContent = `.h_hidden_h { position: relative; border: 4px solid red !important; z-index: 99999; } .h_hidden_h:not(label) { color: black; max-height: 35px; min-width: 250px; display: inline-block; } label.h_hidden_h_label { position: relative; z-index: 99999; color: #8f2222; font-style: oblique; font-size: x-large; margin: 10px; min-width: 200px; margin-right: 8px; border: 2px solid #ca2121; overflow: auto; padding: 5px; }`;
            document.head.appendChild(style_h_hidden_h);



            ids();
            globalThis.h = help;
            help();   //retier cette ligne pour ne pas afficher l'aide au démarrage
        }

        ////////////////////////////////////////
        // Password Reveal Feature            //
        ////////////////////////////////////////

        function initPasswordReveal() {
            document.querySelectorAll('input[type="password"]').forEach(input => {
                input.addEventListener('mouseenter', () => {
                // Sauvegarde l’état d’origine
                input.dataset._origType   = input.type;
                input.dataset._origColor  = input.style.color;
                input.dataset._origWeight = input.style.fontWeight;
                // Passe en clair avec style d’alerte
                input.type       = 'text';
                input.style.color       = 'orange';
                input.style.fontWeight  = 'bold';
                });

                input.addEventListener('mouseleave', () => {
                // Restaure l’état d’origine
                input.type       = input.dataset._origType   || 'password';
                input.style.color       = input.dataset._origColor  || '';
                input.style.fontWeight  = input.dataset._origWeight || '';
                });
            });
        }

        ////////////////////////////////////////
        // Global Initialization Calls        //
        ////////////////////////////////////////

        debugMeStart();
        initPasswordReveal();

    }); // End of onReady function

})();
