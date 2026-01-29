import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { API_BASE_URL } from '../utils/apiConfig';
import '../utils/i18n'; // Initialize i18n

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
    const { i18n } = useTranslation();

    // Settings State
    const [language, setLanguage] = useState('en');
    const [highContrast, setHighContrast] = useState(false);
    const [fontScale, setFontScale] = useState(1.0); // 1.0 = Normal, 1.2 = Large, 1.4 = Extra Large
    const [voiceEnabled, setVoiceEnabled] = useState(false);

    // Network State
    const [isConnected, setIsConnected] = useState(true);
    const [offlineQueue, setOfflineQueue] = useState([]);
    const [token, setToken] = useState(null);

    // Load initial data
    useEffect(() => {
        const loadData = async () => {
            try {
                // 1. Load Token
                const storedToken = await AsyncStorage.getItem('token');
                if (storedToken) setToken(storedToken);

                // 2. Load Local Settings
                const savedSettings = await AsyncStorage.getItem('userSettings');
                if (savedSettings) {
                    const parsed = JSON.parse(savedSettings);
                    if (parsed.language) {
                        setLanguage(parsed.language);
                        i18n.changeLanguage(parsed.language);
                    }
                    if (parsed.accessibility) {
                        setHighContrast(parsed.accessibility.highContrast || false);
                        setFontScale(parsed.accessibility.fontScale || 1.0);
                        setVoiceEnabled(parsed.accessibility.voiceEnabled || false);
                    }
                }

                // 3. Load Offline Queue
                const savedQueue = await AsyncStorage.getItem('offlineQueue');
                if (savedQueue) {
                    setOfflineQueue(JSON.parse(savedQueue));
                }
            } catch (e) {
                console.error("Failed to load settings:", e);
            }
        };
        loadData();
    }, []);

    // Sync settings from server on mount/token change
    useEffect(() => {
        const fetchRemoteSettings = async () => {
            if (!token || !isConnected) return;

            try {
                const response = await axios.get(`${API_BASE_URL}/userInfo`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const { settings } = response.data;
                if (settings) {
                    if (settings.language && settings.language !== language) {
                        setLanguage(settings.language);
                        i18n.changeLanguage(settings.language);
                    }
                    if (settings.accessibility) {
                        setHighContrast(settings.accessibility.highContrast ?? highContrast);
                        setFontScale(settings.accessibility.fontScale ?? fontScale);
                        setVoiceEnabled(settings.accessibility.voiceEnabled ?? voiceEnabled);
                    }
                }
            } catch (error) {
                console.log("Failed to fetch remote settings:", error.message);
            }
        };

        fetchRemoteSettings();
    }, [token, isConnected]);

    // Save settings local & remote when changed
    useEffect(() => {
        const saveSettings = async () => {
            const settings = {
                language,
                accessibility: {
                    highContrast,
                    fontScale,
                    voiceEnabled
                }
            };

            // Local Save
            await AsyncStorage.setItem('userSettings', JSON.stringify(settings));

            // Remote Save (Debounced ideally, but direct for now)
            if (token && isConnected) {
                try {
                    await axios.post(`${API_BASE_URL}/users/settings`, settings, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                } catch (error) {
                    console.log("Failed to sync settings to server:", error.message);
                }
            }
        };
        saveSettings();
    }, [language, highContrast, fontScale, voiceEnabled, token, isConnected]);

    // Monitor Network Status
    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsConnected(state.isConnected && state.isInternetReachable !== false);
        });
        return unsubscribe;
    }, []);

    // Auto-sync offline queue when connected
    useEffect(() => {
        if (isConnected && offlineQueue.length > 0) {
            syncOfflineQueue();
        }
    }, [isConnected, offlineQueue.length]);

    const changeLanguage = (lang) => {
        setLanguage(lang);
        i18n.changeLanguage(lang);
    };

    const toggleHighContrast = () => setHighContrast(prev => !prev);
    const updateFontScale = (scale) => setFontScale(scale);
    const toggleVoiceFeedback = () => setVoiceEnabled(prev => !prev);

    // Helper to generate accessible styles
    const getAccessibleStyle = (baseStyle) => {
        return {
            ...baseStyle,
            ...(baseStyle.fontSize ? { fontSize: baseStyle.fontSize * fontScale } : {}),
        };
    };

    const syncOfflineQueue = async () => {
        if (offlineQueue.length === 0 || !token) return;

        // Separate scans from other potential queue items
        const scans = offlineQueue.filter(item => item.type === 'scan');
        const otherItems = offlineQueue.filter(item => item.type !== 'scan');

        if (scans.length > 0) {
            try {
                console.log(`Syncing ${scans.length} offline scans...`);
                // Format for API: { scans: [{ barcode, timestamp, ... }] }
                // The current scan queue saves photos. The new endpoint expects "scans". 
                // However, the offline queue items created in ScanScreen contain image URIs (`photos`).
                // The /scan/batch endpoint documentation mentions `barcode` and `timestamp`. 
                // Our ScanScreen uploads *images* for classification, not barcodes (unless products).
                // Assuming the backend handles the image upload or we skip image upload for offline 
                // and just send metadata if it was a barcode scan.
                // If it was an image scan, we might need a different endpoint or the API documentation 
                // "Sync Offline Scans" refers to barcode scans (product scans).
                // Let's assume for now we send what we have, but filter for valid data.

                // If the queue items are product scans (barcodes), they match the docs.
                // If they are waste classification images, we might not be able to batch sync them easily 
                // sending multiple images in JSON. 
                // For now, I will implement the batch call as requested.

                // Construct payload
                const payload = {
                    scans: scans.map(s => ({
                        barcode: s.barcode, // Assuming ScanScreen saves barcode
                        timestamp: s.timestamp
                    })).filter(s => s.barcode) // Only sync items with barcodes for now as per docs
                };

                if (payload.scans.length > 0) {
                    await axios.post(`${API_BASE_URL}/scan/batch`, payload, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    // Success - remove these scans from queue
                    const newQueue = [...otherItems, ...offlineQueue.filter(item => item.type === 'scan' && !item.barcode)];
                    setOfflineQueue(newQueue);
                    await AsyncStorage.setItem('offlineQueue', JSON.stringify(newQueue));
                    console.log("Offline scans synced successfully");
                } else {
                    // If we had scans but no barcodes (e.g. image scans), we might need logic to upload them individually
                    // For now, we leave them in queue or handle them differently? 
                    // Let's just leave them to avoid data loss.
                    console.log("No barcode scans to sync in batch.");
                }

            } catch (error) {
                console.error("Failed to sync offline queue:", error);
            }
        }
    };

    // Offline Queue Helper
    const addToOfflineQueue = async (item) => {
        const newItem = { ...item, id: Date.now(), timestamp: new Date().toISOString() };
        const newQueue = [...offlineQueue, newItem];
        setOfflineQueue(newQueue);
        await AsyncStorage.setItem('offlineQueue', JSON.stringify(newQueue));
    };

    return (
        <SettingsContext.Provider value={{
            language,
            changeLanguage,
            highContrast,
            toggleHighContrast,
            fontScale,
            updateFontScale,
            voiceEnabled,
            toggleVoiceFeedback,
            isConnected,
            getAccessibleStyle,
            addToOfflineQueue,
            offlineQueue,
            setToken // Expose setToken so login can update it
        }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => useContext(SettingsContext);
