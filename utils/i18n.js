import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';

// English Translations
const en = {
    welcome: {
        title: "Eco-Friendly Living",
        subtitle: "Small actions today, a greener tomorrow.",
        login: "Login",
        signup: "Sign Up"
    },
    navbar: {
        home: "Home",
        safeZones: "Safe Zones",
        scan: "Scan",
        rewards: "Rewards",
        nearbyCompanies: "Nearby",
        profile: "Profile"
    },
    home: {
        greeting: "Welcome back,",
        ecoPoints: "Eco Points",
        recyclingGrowth: "Recycling Growth",
        leaderboard: "Leaderboard Top 3",
        recentActivities: "Recent Activities",
        ecoTips: "Eco Tips",
        quickActions: {
            scan: "Scan",
            map: "Map",
            purchase: "Rewards",
            settings: "Settings"
        }
    },
    safeZones: {
        title: "Safe Zones",
        searchPlaceholder: "Search by name, district...",
        filterAll: "All Zones",
        filterHighSafety: "High Safety",
        filterLowRisk: "Low Risk",
        filterKigali: "Kigali Only",
        alerts: "Alerts",
        details: "Details"
    },
    scan: {
        title: "Scan Waste",
        instructions: "Take a photo of the item to classify it.",
        capture: "Capture",
        confirm: "Confirm",
        upload: "Upload",
        analyzing: "Analyzing...",
        biodegradable: "Biodegradable",
        nonBiodegradable: "Non-Biodegradable",
        fallbackTitle: "Scan Complete!",
        scanAgain: "Scan Again",
        claimPoints: "Claim EcoPoints"
    },
    referral: {
        title: "Invite Friends",
        yourCode: "Your Referral Code",
        shareMessage: "Join me on Green IQ! Use my referral code: {{code}} to get bonus points!",
        copyCode: "Copy Code",
        shareCode: "Share Code",
        copied: "Copied!",
        copiedMessage: "Referral code copied to clipboard.",
        shareError: "Could not share referral code.",
        howItWorks: "How It Works",
        step1: "Share your code",
        step2: "Friends sign up",
        step3: "Both earn points"
    },
    rewards: {
        title: "Rewards",
        yourPoints: "Your Points",
        availableRewards: "Available Rewards",
        redeem: "Redeem",
        pointsRequired: "{{points}} points",
        insufficientPoints: "Insufficient Points",
        insufficientMessage: "You need {{required}} more points to redeem this reward.",
        redeemSuccess: "Reward Redeemed!",
        redeemError: "Failed to redeem reward"
    },
    leaderboard: {
        title: "Leaderboard",
        top3: "Top 3",
        rank: "Rank",
        name: "Name",
        points: "Points"
    },
    settings: {
        title: "Settings",
        language: "Language",
        selectLanguage: "Select Language",
        accessibility: "Accessibility",
        highContrast: "High Contrast",
        fontScale: "Large Text",
        voiceFeedback: "Voice Feedback",
        offlineMode: "Offline Mode"
    },
    profile: {
        title: "Profile",
        ecoPoints: "Eco Points",
        editProfile: "Edit Profile",
        helpCenter: "Help Center",
        inviteFriends: "Invite Friends",
        logout: "Logout"
    },
    common: {
        loading: "Loading...",
        error: "Error",
        retry: "Retry",
        savedForLater: "Saved for later sync",
        noInternet: "No Internet Connection",
        cancel: "Cancel",
        confirm: "Confirm",
        save: "Save",
        back: "Back"
    }
};

// Swahili Translations
const sw = {
    welcome: {
        title: "Maisha ya Kirafiki kwa Mazingira",
        subtitle: "Matendo madogo leo, kesho yenye kijani kibichi.",
        login: "Ingia",
        signup: "Jisajili"
    },
    navbar: {
        home: "Nyumbani",
        safeZones: "Maeneo Salama",
        scan: "Changanua",
        rewards: "Zawadi",
        nearbyCompanies: "Karibu",
        profile: "Wasifu"
    },
    home: {
        greeting: "Karibu tena,",
        ecoPoints: "Alama za Eco",
        recyclingGrowth: "Ukuaji wa Urejeleaji",
        leaderboard: "Viongozi 3 Bora",
        recentActivities: "Shughuli za Hivi Karibuni",
        ecoTips: "Vidokezo vya Eco",
        quickActions: {
            scan: "Changanua",
            map: "Ramani",
            purchase: "Zawadi",
            settings: "Mipangilio"
        }
    },
    scan: {
        title: "Changanua Taka",
        instructions: "Piga picha ya kifaa ili kukiainisha.",
        capture: "Piga Picha",
        confirm: "Thibitisha",
        upload: "Pakia",
        analyzing: "Inachambua...",
        biodegradable: "Inaoza",
        nonBiodegradable: "Haiozi",
        fallbackTitle: "Uchanganuzi Umekamilika!",
        scanAgain: "Changanua Tena",
        claimPoints: "Dai EcoPoints"
    },
    referral: {
        title: "Alika Marafiki",
        yourCode: "Nambari Yako ya Rufaa",
        shareMessage: "Jiunge nami kwenye Green IQ! Tumia nambari yangu ya rufaa: {{code}} kupata alama za ziada!",
        copyCode: "Nakili Nambari",
        shareCode: "Shiriki Nambari",
        copied: "Imenakiliwa!",
        copiedMessage: "Nambari ya rufaa imenakiliwa kwenye ubao wa kunakili.",
        shareError: "Haikuweza kushiriki nambari ya rufaa.",
        howItWorks: "Jinsi Inavyofanya Kazi",
        step1: "Shiriki nambari yako",
        step2: "Marafiki wajisajili",
        step3: "Wote wanapata alama"
    },
    rewards: {
        title: "Zawadi",
        yourPoints: "Alama Zako",
        availableRewards: "Zawadi Zinazopatikana",
        redeem: "Komboa",
        pointsRequired: "alama {{points}}",
        insufficientPoints: "Alama Hazitoshi",
        insufficientMessage: "Unahitaji alama {{required}} zaidi kukomboa zawadi hii.",
        redeemSuccess: "Zawadi Imekombolewa!",
        redeemError: "Imeshindwa kukomboa zawadi"
    },
    leaderboard: {
        title: "Ubao wa Viongozi",
        top3: "Bora 3",
        rank: "Nafasi",
        name: "Jina",
        points: "Alama"
    },
    settings: {
        title: "Mipangilio",
        language: "Lugha",
        selectLanguage: "Chagua Lugha",
        accessibility: "Ufikivu",
        highContrast: "Tofauti ya Juu",
        fontScale: "Maandishi Makubwa",
        voiceFeedback: "Maoni ya Sauti",
        offlineMode: "Hali ya Nje ya Mtandao"
    },
    profile: {
        title: "Wasifu",
        ecoPoints: "Alama za Eco",
        editProfile: "Hariri Wasifu",
        helpCenter: "Kituo cha Msaada",
        inviteFriends: "Alika Marafiki",
        logout: "Toka"
    },
    common: {
        loading: "Inapakia...",
        error: "Hitilafu",
        retry: "Jaribu Tena",
        savedForLater: "Imetunzwa kwa usawazishaji baadaye",
        noInternet: "Hakuna Mtandao",
        cancel: "Ghairi",
        confirm: "Thibitisha",
        save: "Hifadhi",
        back: "Rudi"
    }
};

// French Translations
const fr = {
    welcome: {
        title: "Vie Écologique",
        subtitle: "Petites actions aujourd'hui, un demain plus vert.",
        login: "Connexion",
        signup: "S'inscrire"
    },
    navbar: {
        home: "Accueil",
        safeZones: "Zones Sûres",
        scan: "Scanner",
        rewards: "Récompenses",
        nearbyCompanies: "À proximité",
        profile: "Profil"
    },
    home: {
        greeting: "Bon retour,",
        ecoPoints: "Points Éco",
        recyclingGrowth: "Croissance du Recyclage",
        leaderboard: "Top 3 Classement",
        recentActivities: "Activités Récentes",
        ecoTips: "Conseils Éco",
        quickActions: {
            scan: "Scanner",
            map: "Carte",
            purchase: "Récompenses",
            settings: "Paramètres"
        }
    },
    scan: {
        title: "Scanner Déchets",
        instructions: "Prenez une photo de l'objet pour le classer.",
        capture: "Capturer",
        confirm: "Confirmer",
        upload: "Télécharger",
        analyzing: "Analyse en cours...",
        biodegradable: "Biodégradable",
        nonBiodegradable: "Non Biodégradable",
        fallbackTitle: "Scan Terminé!",
        scanAgain: "Scanner à nouveau",
        claimPoints: "Réclamer EcoPoints"
    },
    referral: {
        title: "Inviter des Amis",
        yourCode: "Votre Code de Parrainage",
        shareMessage: "Rejoignez-moi sur Green IQ ! Utilisez mon code de parrainage : {{code}} pour obtenir des points bonus !",
        copyCode: "Copier le Code",
        shareCode: "Partager le Code",
        copied: "Copié !",
        copiedMessage: "Code de parrainage copié dans le presse-papiers.",
        shareError: "Impossible de partager le code de parrainage.",
        howItWorks: "Comment ça marche",
        step1: "Partagez votre code",
        step2: "Vos amis s'inscrivent",
        step3: "Gagnez des points tous les deux"
    },
    rewards: {
        title: "Récompenses",
        yourPoints: "Vos Points",
        availableRewards: "Récompenses Disponibles",
        redeem: "Échanger",
        pointsRequired: "{{points}} points",
        insufficientPoints: "Points Insuffisants",
        insufficientMessage: "Vous avez besoin de {{required}} points supplémentaires pour échanger cette récompense.",
        redeemSuccess: "Récompense Échangée !",
        redeemError: "Échec de l'échange de la récompense"
    },
    leaderboard: {
        title: "Classement",
        top3: "Top 3",
        rank: "Rang",
        name: "Nom",
        points: "Points"
    },
    settings: {
        title: "Paramètres",
        language: "Langue",
        selectLanguage: "Sélectionner la Langue",
        accessibility: "Accessibilité",
        highContrast: "Contraste Élevé",
        fontScale: "Grand Texte",
        voiceFeedback: "Retour Vocal",
        offlineMode: "Mode Hors Ligne"
    },
    profile: {
        title: "Profil",
        ecoPoints: "Points Éco",
        editProfile: "Modifier le Profil",
        helpCenter: "Centre d'Aide",
        inviteFriends: "Inviter des Amis",
        logout: "Déconnexion"
    },
    common: {
        loading: "Chargement...",
        error: "Erreur",
        retry: "Réessayer",
        savedForLater: "Enregistré pour plus tard",
        noInternet: "Pas de connexion Internet",
        cancel: "Annuler",
        confirm: "Confirmer",
        save: "Enregistrer",
        back: "Retour"
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            sw: { translation: sw },
            fr: { translation: fr },
        },
        lng: 'en', // Default language
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false,
        },
        react: {
            useSuspense: false, // Recommended for React Native
        },
    });

export default i18n;
