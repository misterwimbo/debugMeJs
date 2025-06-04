// ==UserScript==
// @name         DebugJs-console
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

        } // End of debugMe class

        ////////////////////////////////////////
        // Event Info Display (Top-Left Corner) //
        ////////////////////////////////////////

        var elementsWithEvents = document.querySelectorAll('[onclick], [onchange], [onkeyup], [onkeydown], [onkeypress], [ondblclick]');
        var inputsElements = document.querySelectorAll('input, select, textarea, button');

        // Create the displayed element in the top-left corner
        var topLeftCorner = document.createElement('div');
        topLeftCorner.style.position = 'fixed';
        topLeftCorner.style.top = '45px';
        topLeftCorner.style.left = '20px';
        topLeftCorner.style.background = 'black';
        topLeftCorner.style.padding = '10px';
        topLeftCorner.style.zIndex = '99999'; // Mis à jour pour être 99999
        topLeftCorner.style.color = 'white';
        topLeftCorner.style.display = 'none';
        topLeftCorner.style.borderRadius = '5px';
        topLeftCorner.style.boxShadow = '2px 2px 5px rgba(0,0,0,0.1)';
        topLeftCorner.id = 'topLeftCornerInfos';
        document.body.appendChild(topLeftCorner);

        let hideTimeout; // Variable pour stocker le timeout de masquage

        // Fonction pour cacher le topLeftCorner
        function hideTopLeftCorner() {
            clearTimeout(hideTimeout); // Annule tout timeout en cours
            hideTimeout = setTimeout(() => {
                topLeftCorner.style.display = 'none';
            }, 5000); // Cache après 5 secondes
        }

        // Fonction pour afficher les informations de l'élément
        function showEventInfo(eventType, element, haveEvent = false) {
            clearTimeout(hideTimeout); // Annule le masquage si on interagit à nouveau
            let info = '';

            // Si l'élément a un attribut d'événement (onclick, onchange, etc.)
            if (eventType && element.hasAttribute(eventType)) {
                const attrCode = element.getAttribute(eventType);
                info += `<span class="dbg-attr-event" data-code="${attrCode}" style="color:red;text-decoration:underline;cursor:pointer;">${eventType} :</span> ${attrCode}<br>`;
            }

            // Add ID if it exists
            if (element.id) {
                info += `<span style="color:red;">id :</span>  ${element.id}<br>`;
            }

            // Display addEventListener list
            if (element._debugJsListeners && element._debugJsListeners.size > 0) {
                element._debugJsListeners.forEach((callbacks, type) => {
                    info += `<span class="dbg-listener" data-type="${type}" style="text-decoration:underline;cursor:pointer;">${type}</span><br>`;
                });
            }
            // Add name if it exists
            if (element.name) {
                info += `<span style="color:red;">name :</span>  ${element.name}<br>`;
            }

            // Update only the content
            topLeftCorner.innerHTML = '';
            topLeftCorner.innerHTML += info;
            topLeftCorner.style.display = 'block';

            // Fonction pour créer et afficher un tooltip
            function createAndShowTooltip(e, content) {
                clearTimeout(hideTimeout); // Empêche le topLeftCorner de disparaître pendant l'affichage du tooltip

                let tip = document.createElement('pre');
                tip.className = 'dbg-tooltip';
                tip.textContent = content;
                Object.assign(tip.style, {
                    position: 'fixed',
                    top: `${e.clientY + 10}px`,
                    left: `${e.clientX + 10}px`,
                    maxWidth: '800px',
                    maxHeight: '600px',
                    overflow: 'auto',
                    background: 'rgba(0,0,0,0.85)',
                    color: '#fff',
                    padding: '8px',
                    borderRadius: '4px',
                    zIndex: '99999', // Mis à jour pour être 99999
                    fontSize: '12px',
                    whiteSpace: 'pre-wrap'
                });
                document.body.appendChild(tip);

                let tipHideTimer;
                const scheduleTipHide = () => {
                    tipHideTimer = setTimeout(() => {
                        tip.remove();
                        hideTopLeftCorner(); // Réactive le timer de masquage du topLeftCorner
                    }, 300); // 300 ms grace period
                };

                tip.addEventListener('mouseenter', () => {
                    clearTimeout(tipHideTimer);
                    clearTimeout(hideTimeout);
                });
                tip.addEventListener('mouseleave', scheduleTipHide);

                return tip;
            }


            // Add event listeners for the 'dbg-listener' spans (addEventListener callbacks)
            const listenerSpans = topLeftCorner.querySelectorAll('.dbg-listener');
            listenerSpans.forEach(span => {
                span.addEventListener('mouseenter', function(e) {
                    const type = this.dataset.type;
                    const callbacks = element._debugJsListeners.get(type);
                    const content = callbacks.map(fn => fn.toString()).join('\n\n');
                    this._dbgTip = createAndShowTooltip(e, content); // Stocke le tooltip pour le gérer
                });
                span.addEventListener('mouseleave', function() {
                    // Le hideTimer est déjà géré par la fonction createAndShowTooltip
                });
            });

            // Add event listeners for the 'dbg-attr-event' spans (inline event attributes)
            const attrEventSpans = topLeftCorner.querySelectorAll('.dbg-attr-event');
            attrEventSpans.forEach(span => {
                span.addEventListener('mouseenter', function(e) {
                    const content = this.dataset.code;
                    this._dbgTip = createAndShowTooltip(e, content); // Stocke le tooltip pour le gérer
                });
                span.addEventListener('mouseleave', function() {
                    // Le hideTimer est déjà géré par la fonction createAndShowTooltip
                });
            });

            hideTopLeftCorner(); // Déclenche le masquage après 5 secondes si pas d'interaction
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
        });

        // Gérer le masquage du topLeftCorner si la souris quitte la zone elle-même
        topLeftCorner.addEventListener('mouseenter', () => {
            clearTimeout(hideTimeout); // Annule le masquage si la souris entre dans le topLeftCorner
        });
        topLeftCorner.addEventListener('mouseleave', () => {
            hideTopLeftCorner(); // Réactive le masquage si la souris quitte le topLeftCorner
        });


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
            `;

            // Définition des catégories et options
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
            `;

            // Menu options
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
            // Z-index des labels ajusté pour être au-dessus
            style_h_hidden_h.textContent = `.h_hidden_h { position:relative; border: 4px solid red !important;z-index:99999;  } label.h_hidden_h_label { position:relative;z-index:99999;color: #8f2222;font-style: oblique;font-size: x-large;margin: 10px;}`;
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
