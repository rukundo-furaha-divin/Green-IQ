import axios from 'axios';
import { API_BASE_URL } from '../utils/apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Get current language from settings (helper)
const getLanguage = async () => {
    try {
        const savedSettings = await AsyncStorage.getItem('userSettings');
        if (savedSettings) {
            const parsed = JSON.parse(savedSettings);
            return parsed.language || 'en';
        }
        return 'en';
    } catch (error) {
        return 'en';
    }
};

export const contentService = {
    // Get tips with language support
    getTips: async (lang) => {
        try {
            const language = lang || await getLanguage();
            const response = await axios.get(`${API_BASE_URL}/tips`, {
                params: { lang: language },
                timeout: 5000
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching tips:', error);
            throw error;
        }
    },

    // Get facts and waste control tips
    getFacts: async (lang) => {
        try {
            const language = lang || await getLanguage();
            const response = await axios.get(`${API_BASE_URL}/content/facts`, {
                params: { lang: language },
                timeout: 5000
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching facts:', error);
            throw error;
        }
    }
};
