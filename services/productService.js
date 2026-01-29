import axios from 'axios';
import { API_BASE_URL } from '../utils/apiConfig';

/**
 * Fetches product data from OpenFoodFacts using the V2 API.
 * @param {string} barcode 
 * @returns {Promise<Object|null>} Normalized product data or null if not found.
 */
export const fetchProductFromOFF = async (barcode) => {
    try {
        const response = await axios.get(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);

        if (response.data && response.data.status === 1) {
            const p = response.data.product;

            // Normalize data for backend
            return {
                barcode: barcode,
                product: {
                    ...p, // Include ALL raw data from OpenFoodFacts
                    // Specific normalized fields we rely on (these will override if key exists, or add if not)
                    name: p.product_name || p.product_name_en || "Unknown Product",
                    brand: p.brands || p.brands_tags?.[0] || "Unknown Brand",
                    categories: p.categories || p.categories_tags?.join(', ') || "",
                    ingredients: p.ingredients_text || p.ingredients_text_en || "",
                    packaging: p.packaging || p.packaging_tags?.join(', ') || "",
                    materials: p.packaging_materials_tags?.join(', ') || "",
                    recycling: p.packaging_recycling_tags?.join(', ') || "",
                    image_url: p.image_url || p.image_front_url || null
                }
            };
        }
        return null;
    } catch (error) {
        console.warn("OpenFoodFacts fetch error:", error.message);
        return null;
    }
};

/**
 * Sends product data to the backend for DeepSeek analysis.
 * @param {Object} payload Normalized product data
 * @returns {Promise<string>} The analysis text.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

export const getEcoAnalysis = async (payload) => {
    try {
        const token = await AsyncStorage.getItem('userToken');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const res = await axios.post(`${API_BASE_URL}/deepseek-analysis`, payload, { headers });
        return res.data.analysis;
    } catch (error) {
        console.error("Backend analysis error:", error.message);
        return "Environmental analysis is temporarily unavailable. Please follow local recycling guidelines.";
    }
};

/**
 * Sends an image to the backend for prediction (fallback).
 * @param {FormData} formData 
 * @returns {Promise<Object>} Prediction result
 */
export const predictImage = async (formData) => {
    try {
        const res = await axios.post(`${API_BASE_URL}/predict`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return res.data;
    } catch (error) {
        console.error("Prediction error:", error.message);
        throw error;
    }
};
