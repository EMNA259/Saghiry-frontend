// parent-settings.js - Gestionnaire global des paramètres pour toutes les pages parent

(function() {
    // État local des paramètres
    let currentSettings = {
        theme: 'clair',
        langue: 'fr',
        itemsPerPage: 20,
        primaryColor: '#4ca896',
        secondaryColor: '#ff9466'
    };
    
    let isInitialized = false;
    let pendingSettings = null;
    
    // Fonction pour appliquer le thème
    function applyTheme(theme) {
        let effectiveTheme = theme;
        if (theme === 'systeme') {
            effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'sombre' : 'clair';
        }
        
        if (effectiveTheme === 'sombre') {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }
    
    // Fonction pour appliquer les couleurs
    function applyColors(primaryColor, secondaryColor) {
        document.documentElement.style.setProperty('--primary-green', primaryColor);
        document.documentElement.style.setProperty('--accent-orange', secondaryColor);
    }
    
    // Fonction pour appliquer la langue
    function applyLanguage(langue) {
        // Stocker la langue pour les composants qui en ont besoin
        localStorage.setItem('saghiry_langue', langue);
        
        // Déclencher un événement pour que les composants réagissent
        const event = new CustomEvent('languageChanged', { detail: { langue: langue } });
        document.dispatchEvent(event);
    }
    
    // Fonction pour appliquer tous les paramètres
    function applyAllSettings(settings) {
        if (settings.theme) applyTheme(settings.theme);
        if (settings.primaryColor && settings.secondaryColor) {
            applyColors(settings.primaryColor, settings.secondaryColor);
        }
        if (settings.langue) applyLanguage(settings.langue);
        if (settings.itemsPerPage) {
            localStorage.setItem('saghiry_items_per_page', settings.itemsPerPage);
        }
    }
    
    // Fonction pour charger les paramètres depuis localStorage
    function loadSettingsFromStorage() {
        try {
            const saved = localStorage.getItem('saghiry_global_settings');
            if (saved) {
                const settings = JSON.parse(saved);
                currentSettings = { ...currentSettings, ...settings };
            }
            
            // Vérifier les valeurs individuelles
            const theme = localStorage.getItem('saghiry_theme');
            if (theme) currentSettings.theme = theme;
            
            const langue = localStorage.getItem('saghiry_langue');
            if (langue) currentSettings.langue = langue;
            
            const itemsPerPage = localStorage.getItem('saghiry_items_per_page');
            if (itemsPerPage) currentSettings.itemsPerPage = parseInt(itemsPerPage);
            
            const primaryColor = localStorage.getItem('saghiry_primary_color');
            if (primaryColor) currentSettings.primaryColor = primaryColor;
            
            const secondaryColor = localStorage.getItem('saghiry_secondary_color');
            if (secondaryColor) currentSettings.secondaryColor = secondaryColor;
            
            console.log('🎨 Paramètres chargés depuis localStorage:', currentSettings);
            return currentSettings;
        } catch(e) {
            console.warn('Erreur chargement paramètres:', e);
            return currentSettings;
        }
    }
    
    // Fonction pour demander les paramètres au parent
    function requestSettingsFromParent() {
        if (window.parent && window.parent !== window) {
            try {
                window.parent.postMessage({ type: 'saghiry-get-settings' }, '*');
                console.log('📤 Demande de paramètres envoyée au parent');
            } catch(e) {
                console.warn('Impossible de demander les paramètres au parent:', e);
                // Fallback: charger depuis localStorage
                const settings = loadSettingsFromStorage();
                applyAllSettings(settings);
                isInitialized = true;
                if (pendingSettings) {
                    applyAllSettings(pendingSettings);
                    pendingSettings = null;
                }
            }
        } else {
            // Pas dans un iframe, charger depuis localStorage
            const settings = loadSettingsFromStorage();
            applyAllSettings(settings);
            isInitialized = true;
            if (pendingSettings) {
                applyAllSettings(pendingSettings);
                pendingSettings = null;
            }
        }
    }
    
    // Fonction pour sauvegarder les paramètres
    function saveSettings(settings) {
        currentSettings = { ...currentSettings, ...settings };
        localStorage.setItem('saghiry_global_settings', JSON.stringify(currentSettings));
        
        if (settings.theme) localStorage.setItem('saghiry_theme', settings.theme);
        if (settings.langue) localStorage.setItem('saghiry_langue', settings.langue);
        if (settings.itemsPerPage) localStorage.setItem('saghiry_items_per_page', settings.itemsPerPage);
        if (settings.primaryColor) localStorage.setItem('saghiry_primary_color', settings.primaryColor);
        if (settings.secondaryColor) localStorage.setItem('saghiry_secondary_color', settings.secondaryColor);
        
        // Notifier le parent
        if (window.parent && window.parent !== window) {
            try {
                window.parent.postMessage({
                    type: 'saghiry-settings-update',
                    settings: settings
                }, '*');
            } catch(e) {}
        }
        
        // Appliquer immédiatement
        applyAllSettings(settings);
        
        console.log('💾 Paramètres sauvegardés:', settings);
    }
    
    // Écouter les messages du parent
    window.addEventListener('message', function(event) {
        if (event.data && event.data.type === 'saghiry-settings-response') {
            const settings = event.data.settings;
            console.log('📥 Paramètres reçus du parent:', settings);
            
            if (settings) {
                currentSettings = { ...currentSettings, ...settings };
                if (!isInitialized) {
                    pendingSettings = settings;
                } else {
                    applyAllSettings(settings);
                }
            }
            isInitialized = true;
        }
        
        if (event.data && event.data.type === 'saghiry-global-settings') {
            const settings = event.data.settings;
            console.log('🌐 Paramètres globaux reçus:', settings);
            
            if (settings) {
                currentSettings = { ...currentSettings, ...settings };
                applyAllSettings(settings);
            }
        }
        
        if (event.data && event.data.type === 'SET_TOKEN') {
            // Token reçu, on peut maintenant demander les paramètres
            requestSettingsFromParent();
        }
    });
    
    // Initialisation
    function init() {
        // Charger d'abord depuis localStorage
        const settings = loadSettingsFromStorage();
        applyAllSettings(settings);
        
        // Puis demander au parent (si dans un iframe)
        setTimeout(() => {
            requestSettingsFromParent();
        }, 100);
        
        // Écouter les changements de thème système
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
            if (currentSettings.theme === 'systeme') {
                applyTheme('systeme');
            }
        });
        
        console.log('✅ Gestionnaire de paramètres parent initialisé');
    }
    
    // Exposer l'API publique
    window.ParentSettings = {
        get: () => ({ ...currentSettings }),
        set: (settings) => saveSettings(settings),
        apply: () => applyAllSettings(currentSettings),
        reload: () => {
            loadSettingsFromStorage();
            requestSettingsFromParent();
        }
    };
    
    // Démarrer
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();