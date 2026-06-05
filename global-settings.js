// global-settings.js - À inclure dans toutes les pages
(function() {
    // Configuration globale pour toutes les pages
    let globalSettings = {
        theme: 'clair',
        langue: 'fr',
        couleurPrimaire: '#4ca896',
        couleurSecondaire: '#ff9466',
        itemsParPage: 20,
        afficherDashboard: true,
        afficherCalendrier: true,
        notificationsToast: true
    };

    // Dictionnaire des traductions globales - FR et EN seulement
    const translations = {
        fr: {
            // Navigation générale
            loading: "Chargement...",
            error: "Erreur",
            success: "Succès",
            save: "Enregistrer",
            cancel: "Annuler",
            delete: "Supprimer",
            edit: "Modifier",
            add: "Ajouter",
            search: "Rechercher",
            filter: "Filtrer",
            refresh: "Actualiser",
            export: "Exporter",
            import: "Importer",
            close: "Fermer",
            confirm: "Confirmer",
            
            // Messages communs
            noData: "Aucune donnée disponible",
            noResults: "Aucun résultat trouvé",
            confirmDelete: "Voulez-vous vraiment supprimer ?",
            
            // Jours et mois
            days: ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"],
            daysShort: ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"],
            months: ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"],
            monthsShort: ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"],
            
            // Classes
            classes: "Classes",
            students: "Élèves",
            teachers: "Enseignants",
            parents: "Parents",
            administration: "Administration"
        },
        en: {
            // Navigation générale
            loading: "Loading...",
            error: "Error",
            success: "Success",
            save: "Save",
            cancel: "Cancel",
            delete: "Delete",
            edit: "Edit",
            add: "Add",
            search: "Search",
            filter: "Filter",
            refresh: "Refresh",
            export: "Export",
            import: "Import",
            close: "Close",
            confirm: "Confirm",
            
            // Messages communs
            noData: "No data available",
            noResults: "No results found",
            confirmDelete: "Are you sure you want to delete?",
            
            // Jours et mois
            days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            daysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
            monthsShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            
            // Classes
            classes: "Classes",
            students: "Students",
            teachers: "Teachers",
            parents: "Parents",
            administration: "Administration"
        }
    };

    let languageChangeCallbacks = [];

    function applyTheme() {
        let effectiveTheme = globalSettings.theme;
        
        document.body.classList.toggle('dark-mode', effectiveTheme === 'sombre');
        
        document.documentElement.style.setProperty('--primary-green', globalSettings.couleurPrimaire);
        document.documentElement.style.setProperty('--primary-dark', globalSettings.couleurPrimaire);
        document.documentElement.style.setProperty('--accent-orange', globalSettings.couleurSecondaire);
        
        localStorage.setItem('saghiry_primary_color', globalSettings.couleurPrimaire);
        localStorage.setItem('saghiry_secondary_color', globalSettings.couleurSecondaire);
    }

    function applyLanguage() {
        const lang = globalSettings.langue || 'fr';
        const t = translations[lang] || translations.fr;
        
        if (lang === 'ar') {
            document.body.style.direction = 'rtl';
            document.body.style.textAlign = 'right';
        } else {
            document.body.style.direction = 'ltr';
            document.body.style.textAlign = 'left';
        }
        
        document.documentElement.lang = lang;
        
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (t[key]) {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    if (el.placeholder !== undefined) {
                        el.placeholder = t[key];
                    }
                } else {
                    el.innerHTML = t[key];
                }
            }
        });
        
        document.querySelectorAll('[data-i18n-html]').forEach(el => {
            const key = el.getAttribute('data-i18n-html');
            if (t[key]) {
                el.innerHTML = t[key];
            }
        });
        
        document.dispatchEvent(new CustomEvent('languageChanged', { 
            detail: { lang: lang, translations: t } 
        }));
    }

    function loadSettings() {
        const saved = localStorage.getItem('saghiry_global_settings');
        if (saved) {
            try {
                const settings = JSON.parse(saved);
                globalSettings = { ...globalSettings, ...settings };
            } catch(e) {}
        }
        
        applyTheme();
        applyLanguage();
        
        if (window.parent && window.parent !== window) {
            window.parent.postMessage({ type: 'saghiry-get-settings' }, '*');
        }
    }

    window.addEventListener('message', function(event) {
        if (event.data && event.data.type === 'saghiry-settings-update') {
            const oldLang = globalSettings.langue;
            globalSettings = { ...globalSettings, ...event.data.settings };
            localStorage.setItem('saghiry_global_settings', JSON.stringify(globalSettings));
            applyTheme();
            
            if (oldLang !== globalSettings.langue) {
                applyLanguage();
            }
            
            document.dispatchEvent(new CustomEvent('settingsUpdated', { detail: globalSettings }));
        }
        
        if (event.data && event.data.type === 'saghiry-settings-response') {
            const oldLang = globalSettings.langue;
            globalSettings = { ...globalSettings, ...event.data.settings };
            localStorage.setItem('saghiry_global_settings', JSON.stringify(globalSettings));
            applyTheme();
            
            if (oldLang !== globalSettings.langue) {
                applyLanguage();
            }
        }
    });

    window.addEventListener('storage', function(e) {
        if (e.key === 'saghiry_global_settings' && e.newValue) {
            try {
                const settings = JSON.parse(e.newValue);
                const oldLang = globalSettings.langue;
                globalSettings = { ...globalSettings, ...settings };
                applyTheme();
                
                if (oldLang !== globalSettings.langue) {
                    applyLanguage();
                }
            } catch(e) {}
        }
    });

    window.SaghirySettings = {
        get: () => ({ ...globalSettings }),
        getTheme: () => globalSettings.theme,
        getLangue: () => globalSettings.langue,
        getItemsPerPage: () => globalSettings.itemsParPage,
        getPrimaryColor: () => globalSettings.couleurPrimaire,
        getSecondaryColor: () => globalSettings.couleurSecondaire,
        getTranslations: () => translations[globalSettings.langue] || translations.fr,
        translate: (key) => {
            const t = translations[globalSettings.langue] || translations.fr;
            return t[key] || key;
        },
        set: (newSettings) => {
            const oldLang = globalSettings.langue;
            globalSettings = { ...globalSettings, ...newSettings };
            localStorage.setItem('saghiry_global_settings', JSON.stringify(globalSettings));
            applyTheme();
            
            if (oldLang !== globalSettings.langue) {
                applyLanguage();
            }
            
            if (window.parent && window.parent !== window) {
                window.parent.postMessage({
                    type: 'saghiry-settings-update',
                    settings: globalSettings
                }, '*');
            }
        },
        applyTheme: applyTheme,
        applyLanguage: applyLanguage,
        onLanguageChange: (callback) => {
            languageChangeCallbacks.push(callback);
        }
    };
    
    loadSettings();
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            applyTheme();
            applyLanguage();
        });
    } else {
        applyTheme();
        applyLanguage();
    }
})();