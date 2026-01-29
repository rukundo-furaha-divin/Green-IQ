import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '../utils/apiConfig';
import { calculateZoneScore, getScoreBreakdown, getSafetyLevel } from '../utils/SafeZoneScoring';

class SafeZoneService {
  constructor() {
    this.cache = new Map();
    this.lastUpdate = null;
    this.updateInterval = 30 * 60 * 1000; // 30 minutes
  }

  // Get all safe zones with real-time data
  async getSafeZones() {
    try {
      // Check cache first
      const cached = await this.getCachedData('safeZones');
      if (cached && this.isCacheValid()) {
        return cached;
      }

      // Fetch from API (mock data for MVP)
      const safeZones = await this.fetchSafeZonesFromAPI();

      // Calculate scores for each zone
      const enhancedZones = safeZones.map(zone => {
        const score = calculateZoneScore ? calculateZoneScore(zone) : (zone.safetyScore || 80);
        return {
          ...zone,
          safetyScore: score,
          scoreBreakdown: getScoreBreakdown ? getScoreBreakdown(zone) : {},
          safetyLevel: getSafetyLevel ? getSafetyLevel(score) : 'Good'
        };
      });

      // Cache the data
      await this.cacheData('safeZones', enhancedZones);

      return enhancedZones;
    } catch (error) {
      console.error('Error fetching safe zones:', error);
      // Return cached data if available, otherwise fallback data
      const cached = await this.getCachedData('safeZones');
      return cached || this.getFallbackSafeZones();
    }
  }

  // Fetch safe zones from API
  async fetchSafeZonesFromAPI() {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/safe-zones`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        timeout: 10000
      });
      return response.data.safeZones || response.data || [];
    } catch (error) {
      console.error('Error fetching safe zones from backend:', error);
      // Return fallback data if API fails
      return this.getFallbackSafeZones();
    }
  }

  // Get climate alerts
  async getClimateAlerts() {
    try {
      const cached = await this.getCachedData('climateAlerts');
      if (cached && this.isCacheValid()) {
        return cached;
      }

      const alerts = await this.fetchClimateAlertsFromAPI();
      await this.cacheData('climateAlerts', alerts);
      return alerts;
    } catch (error) {
      console.error('Error fetching climate alerts:', error);
      const cached = await this.getCachedData('climateAlerts');
      return cached || this.getFallbackClimateAlerts();
    }
  }

  // Fetch climate alerts from API
  async fetchClimateAlertsFromAPI() {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/climate-alerts`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        timeout: 10000
      });
      return response.data.alerts || response.data || [];
    } catch (error) {
      console.error('Error fetching climate alerts from backend:', error);
      // Return fallback data if API fails
      return this.getFallbackClimateAlerts();
    }
  }

  // Get nearby recycling centers
  async getNearbyRecyclingCenters(latitude, longitude, radius = 5) {
    try {
      const centers = await this.fetchRecyclingCentersFromAPI();

      // Filter by distance (simplified calculation)
      return centers.filter(center => {
        const distance = this.calculateDistance(
          latitude, longitude,
          center.coords.latitude, center.coords.longitude
        );
        return distance <= radius;
      });
    } catch (error) {
      console.error('Error fetching recycling centers:', error);
      return [];
    }
  }

  // Fetch recycling centers from API
  async fetchRecyclingCentersFromAPI() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 1,
            name: 'Nyarugenge Recycling Center',
            coords: { latitude: -1.9477, longitude: 30.0567 },
            types: ['Plastic', 'Paper', 'Metal', 'Glass'],
            hours: 'Mon-Sat: 7:00 AM - 6:00 PM',
            contact: '+250 123 456 789',
            capacity: 'High',
            status: 'Operational'
          },
          {
            id: 2,
            name: 'Gasabo Waste Management Hub',
            coords: { latitude: -1.9333, longitude: 30.0800 },
            types: ['Organic', 'Electronic', 'Hazardous'],
            hours: 'Mon-Fri: 8:00 AM - 5:00 PM',
            contact: '+250 987 654 321',
            capacity: 'Medium',
            status: 'Operational'
          }
        ]);
      }, 500);
    });
  }

  // Get air quality data
  async getAirQualityData(latitude, longitude) {
    try {
      const data = await this.fetchAirQualityFromAPI(latitude, longitude);
      return data;
    } catch (error) {
      console.error('Error fetching air quality data:', error);
      return { quality: 'Unknown', aqi: 0, description: 'Data unavailable' };
    }
  }

  // Fetch air quality from API
  async fetchAirQualityFromAPI(latitude, longitude) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          quality: 'Good',
          aqi: 45,
          description: 'Air quality is satisfactory, and air pollution poses little or no risk.',
          timestamp: new Date().toISOString()
        });
      }, 300);
    });
  }

  // Report an issue with a safe zone
  async reportIssue(zoneId, issueType, description, userLocation) {
    try {
      const report = {
        id: Date.now(),
        zoneId,
        issueType,
        description,
        userLocation,
        timestamp: new Date().toISOString(),
        status: 'pending'
      };

      // Send to API
      await this.sendReportToAPI(report);

      // Store locally
      await this.storeUserReport(report);

      return { success: true, reportId: report.id };
    } catch (error) {
      console.error('Error reporting issue:', error);
      return { success: false, error: error.message };
    }
  }

  // Send report to API
  async sendReportToAPI(report) {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Report sent to API:', report);
        resolve({ success: true });
      }, 1000);
    });
  }

  // Store user report locally
  async storeUserReport(report) {
    try {
      const reports = await this.getCachedData('userReports') || [];
      reports.push(report);
      await this.cacheData('userReports', reports);
    } catch (error) {
      console.error('Error storing user report:', error);
    }
  }

  // Get user's favorite safe zones
  async getFavoriteSafeZones() {
    try {
      const favorites = await AsyncStorage.getItem('favoriteSafeZones');
      return favorites ? JSON.parse(favorites) : [];
    } catch (error) {
      console.error('Error getting favorite safe zones:', error);
      return [];
    }
  }

  // Add safe zone to favorites
  async addToFavorites(zoneId) {
    try {
      const favorites = await this.getFavoriteSafeZones();
      if (!favorites.includes(zoneId)) {
        favorites.push(zoneId);
        await AsyncStorage.setItem('favoriteSafeZones', JSON.stringify(favorites));
      }
      return { success: true };
    } catch (error) {
      console.error('Error adding to favorites:', error);
      return { success: false, error: error.message };
    }
  }

  // Remove safe zone from favorites
  async removeFromFavorites(zoneId) {
    try {
      const favorites = await this.getFavoriteSafeZones();
      const updatedFavorites = favorites.filter(id => id !== zoneId);
      await AsyncStorage.setItem('favoriteSafeZones', JSON.stringify(updatedFavorites));
      return { success: true };
    } catch (error) {
      console.error('Error removing from favorites:', error);
      return { success: false, error: error.message };
    }
  }

  // Cache management
  async cacheData(key, data) {
    try {
      const cacheItem = {
        data,
        timestamp: Date.now()
      };
      await AsyncStorage.setItem(`cache_${key}`, JSON.stringify(cacheItem));
      this.cache.set(key, cacheItem);
    } catch (error) {
      console.error('Error caching data:', error);
    }
  }

  async getCachedData(key) {
    try {
      // Check memory cache first
      if (this.cache.has(key)) {
        const cacheItem = this.cache.get(key);
        if (this.isCacheValid(cacheItem.timestamp)) {
          return cacheItem.data;
        }
      }

      // Check AsyncStorage
      const cached = await AsyncStorage.getItem(`cache_${key}`);
      if (cached) {
        const cacheItem = JSON.parse(cached);
        if (this.isCacheValid(cacheItem.timestamp)) {
          this.cache.set(key, cacheItem);
          return cacheItem.data;
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting cached data:', error);
      return null;
    }
  }

  isCacheValid(timestamp = this.lastUpdate) {
    if (!timestamp) return false;
    return Date.now() - timestamp < this.updateInterval;
  }

  // Utility functions
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  // Fallback data
  getFallbackSafeZones() {
    return [
      {
        id: 1,
        name: 'Emergency Safe Zone',
        coords: { latitude: -1.9403, longitude: 29.8739 },
        address: 'Kigali, Rwanda',
        description: 'Emergency safe zone with basic facilities.',
        safetyScore: 60,
        status: 'active',
        district: 'Kigali',
        sector: 'City'
      }
    ];
  }

  getFallbackClimateAlerts() {
    return [
      {
        id: 1,
        type: 'General Alert',
        severity: 'Low',
        text: 'General climate information available.',
        timestamp: new Date().toISOString(),
        affectedAreas: [],
        safeZones: []
      }
    ];
  }

  // Clear cache
  async clearCache() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache_'));
      await AsyncStorage.multiRemove(cacheKeys);
      this.cache.clear();
      this.lastUpdate = null;
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }
}

// Export singleton instance
export const safeZoneService = new SafeZoneService();

// Export individual functions for convenience
export const getSafeZones = () => safeZoneService.getSafeZones();
export const getClimateAlerts = () => safeZoneService.getClimateAlerts();
export const getNearbyRecyclingCenters = (lat, lon, radius) =>
  safeZoneService.getNearbyRecyclingCenters(lat, lon, radius);
export const getAirQualityData = (lat, lon) => safeZoneService.getAirQualityData(lat, lon);
export const reportIssue = (zoneId, issueType, description, userLocation) =>
  safeZoneService.reportIssue(zoneId, issueType, description, userLocation);
export const addToFavorites = (zoneId) => safeZoneService.addToFavorites(zoneId);
export const removeFromFavorites = (zoneId) => safeZoneService.removeFromFavorites(zoneId);
export const getFavoriteSafeZones = () => safeZoneService.getFavoriteSafeZones();
export const clearCache = () => safeZoneService.clearCache();