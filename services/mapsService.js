import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../utils/apiConfig';

const getAuthHeaders = async () => {
    try {
        const token = await AsyncStorage.getItem('userToken');
        return token ? { Authorization: `Bearer ${token}` } : {};
    } catch (error) {
        console.error("Error retrieving token for maps service:", error);
        return {};
    }
};

/**
 * Search for places/autocomplete functionality.
 * Endpoint: GET /api/maps/places/autocomplete
 * @param {string} query - The search text (e.g., "Recycling center")
 * @param {string} [location] - Optional bias "lat,lng"
 * @returns {Promise<Array>} List of place suggestions
 */
export const searchLocation = async (query, location = null) => {
    try {
        const headers = await getAuthHeaders();
        const params = { input: query };
        if (location) params.location = location;

        const res = await axios.get(`${API_BASE_URL}/api/maps/places/autocomplete`, {
            params,
            headers
        });
        return res.data;
    } catch (error) {
        console.warn("Maps Search Error:", error.message);
        return []; // Graceful fallback
    }
};

/**
 * Get directions between two points.
 * Endpoint: GET /api/maps/directions
 * @param {Object} origin - { latitude, longitude } or address string
 * @param {Object} destination - { latitude, longitude } or address string
 * @param {string} [mode='driving'] - 'driving', 'walking', 'bicycling'
 * @returns {Promise<Object|null>} Route details (polyline, distance, duration)
 */
export const getRoute = async (origin, destination, mode = 'driving') => {
    try {
        const headers = await getAuthHeaders();

        // Format coordinates if objects are passed
        const formatCoord = (loc) => {
            if (typeof loc === 'object' && loc.latitude && loc.longitude) {
                return `${loc.latitude},${loc.longitude}`;
            }
            return loc;
        };

        const res = await axios.get(`${API_BASE_URL}/api/maps/directions`, {
            params: {
                origin: formatCoord(origin),
                destination: formatCoord(destination),
                mode
            },
            headers
        });

        return res.data;
    } catch (error) {
        console.warn("Maps Directions Error:", error.message);
        return null; // Graceful fallback
    }
};

/**
 * Convert address to coordinates or vice-versa.
 * Endpoint: GET /api/maps/geocode
 * @param {Object} params - { address } or { latlng: "lat,lng" }
 * @returns {Promise<Object|null>} Geocoding result
 */
export const geocodeLocation = async (params) => {
    try {
        const headers = await getAuthHeaders();
        const res = await axios.get(`${API_BASE_URL}/api/maps/geocode`, {
            params,
            headers
        });
        return res.data;
    } catch (error) {
        console.warn("Geocoding Error:", error.message);
        return null;
    }
};
