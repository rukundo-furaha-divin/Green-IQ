import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Platform,
  Dimensions,
  Alert,
  ActivityIndicator,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { API_BASE_URL } from '../utils/apiConfig';
import Toast from 'react-native-toast-message';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';

const { width } = Dimensions.get('window');

const LocationSelectionScreen = ({ navigation, route }) => {
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPoints, setFilteredPoints] = useState([]);
  const [allPoints, setAllPoints] = useState([]);
  const [isLoadingPoints, setIsLoadingPoints] = useState(true);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [region, setRegion] = useState({
    latitude: -1.9441,
    longitude: 30.0619,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });

  // Get the current form state from route params
  const currentFormState = route?.params || {};
  const mapRef = useRef(null);

  useEffect(() => {
    const fetchPoints = async () => {
      try {
        setIsLoadingPoints(true);
        const response = await axios.get(`${API_BASE_URL}/companyInfo`);
        const companies = response.data.companies || [];

        // Transform backend companies to the format expected by the marker
        const points = companies.map(c => ({
          id: c._id,
          name: c.companyName,
          district: c.companyAddress?.district || 'Unknown',
          sector: c.companyAddress?.sector || 'Unknown',
          coords: {
            latitude: c.companyAddress?.location?.coordinates[1] || 0,
            longitude: c.companyAddress?.location?.coordinates[0] || 0
          },
          types: c.companyWasteHandled || [],
          status: 'Operational',
          description: `Waste collection point for ${c.companyWasteHandled?.join(', ')}`,
        })).filter(p => p.coords.latitude !== 0);

        setAllPoints(points);
        setFilteredPoints(points);
      } catch (error) {
        console.error('Error fetching points:', error);
        Toast.show({
          type: 'error',
          text1: 'Fetch Error',
          text2: 'Unable to load collection points'
        });
      } finally {
        setIsLoadingPoints(false);
      }
    };

    fetchPoints();
  }, []);

  const getCurrentLocation = async () => {
    try {
      setIsLoadingLocation(true);

      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Toast.show({
          type: 'error',
          text1: 'Permission Denied',
          text2: 'Please enable location permissions to use this feature.'
        });
        setIsLoadingLocation(false);
        return;
      }

      // Get current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 10000,
      });

      const { latitude, longitude } = location.coords;

      // Update region to center on current location
      const newRegion = {
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

      setRegion(newRegion);
      setCurrentLocation({ latitude, longitude });

      // Animate map to current location
      if (mapRef.current) {
        mapRef.current.animateToRegion(newRegion, 1000);
      }

      // Find nearest waste point
      const nearestPoint = findNearestWastePoint(latitude, longitude);
      // Only auto-select if within 50km to avoid confusion with distant Korean points
      if (nearestPoint && calculateDistance(latitude, longitude, nearestPoint.coords.latitude, nearestPoint.coords.longitude) < 50) {
        setSelectedPoint(nearestPoint);
      }

    } catch (error) {
      console.error('Error getting location:', error);
      Toast.show({
        type: 'error',
        text1: 'Location Error',
        text2: 'Unable to get your current location.'
      });
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const findNearestWastePoint = (lat, lng) => {
    let nearestPoint = null;
    let shortestDistance = Infinity;

    allPoints.forEach(point => {
      const distance = calculateDistance(
        lat, lng,
        point.coords.latitude, point.coords.longitude
      );

      if (distance < shortestDistance) {
        shortestDistance = distance;
        nearestPoint = point;
      }
    });

    return nearestPoint;
  };

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const clearSelection = () => {
    setSelectedPoint(null);
    setCurrentLocation(null);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredPoints(allPoints);
      setShowSearchResults(false);
    } else {
      const filtered = allPoints.filter(point =>
        point.name.toLowerCase().includes(query.toLowerCase()) ||
        point.district.toLowerCase().includes(query.toLowerCase()) ||
        point.sector.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredPoints(filtered);
      setShowSearchResults(true);
    }
  };

  const selectPointFromSearch = (point) => {
    setSelectedPoint(point);
    setSearchQuery(point.name);
    setShowSearchResults(false);

    // Animate map to selected point
    const newRegion = {
      latitude: point.coords.latitude,
      longitude: point.coords.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
    setRegion(newRegion);
    if (mapRef.current) {
      mapRef.current.animateToRegion(newRegion, 1000);
    }
  };

  const handleMapPress = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setCurrentLocation({ latitude, longitude });
    setSelectedPoint(null);
  };

  const confirmSelection = () => {
    if (!selectedPoint && !currentLocation) return;

    // Determine if this is for company registration
    const isCompanyRegistration = currentFormState.userType === 'company';

    // Create location data based on user type
    let locationData;

    if (currentLocation && !selectedPoint) {
      // User wants to use their current location
      if (isCompanyRegistration) {
        locationData = {
          name: 'Current Location',
          district: 'Current Location',
          sector: 'Current Location',
          coordinates: {
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude
          },
          types: ['Custom Location'],
          hours: '24/7',
          contact: 'N/A',
          capacity: 'Custom',
          status: 'Active',
          description: 'Your current location',
          manager: 'Self'
        };
      } else {
        locationData = 'Current Location';
      }
    } else if (selectedPoint) {
      // User selected a waste point
      if (isCompanyRegistration) {
        locationData = {
          name: selectedPoint.name,
          district: selectedPoint.district,
          sector: selectedPoint.sector,
          coordinates: {
            latitude: selectedPoint.coords.latitude,
            longitude: selectedPoint.coords.longitude
          },
          types: selectedPoint.types,
          hours: selectedPoint.hours,
          contact: selectedPoint.contact,
          capacity: selectedPoint.capacity,
          status: selectedPoint.status,
          description: selectedPoint.description,
          manager: selectedPoint.manager
        };
      } else {
        locationData = selectedPoint.name;
      }
    }

    // Return to RegisterScreen with the selected location and all previous form data
    const updatedFormState = {
      ...currentFormState,
      selectedLocation: locationData
    };

    navigation.navigate({
      name: 'Register',
      params: updatedFormState,
      merge: true,
    });
  };

  const goBack = () => {
    // Go back with the current form state preserved
    navigation.navigate({
      name: 'Register',
      params: currentFormState,
      merge: true,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {currentFormState.userType === 'company' ? 'Select Collection Point' : 'Select Your Location'}
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for collection points..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={handleSearch}
            onFocus={() => setShowSearchResults(true)}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')} style={styles.clearSearchButton}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>

        {/* Search Results */}
        {showSearchResults && filteredPoints.length > 0 && (
          <ScrollView style={styles.searchResults} showsVerticalScrollIndicator={false}>
            {filteredPoints.map((point) => (
              <TouchableOpacity
                key={point.id}
                style={styles.searchResultItem}
                onPress={() => selectPointFromSearch(point)}
              >
                <Ionicons name="location" size={16} color="#11998e" />
                <View style={styles.searchResultText}>
                  <Text style={styles.searchResultName}>{point.name}</Text>
                  <Text style={styles.searchResultDetails}>{point.district}, {point.sector}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={region}
          region={region}
          onPress={handleMapPress}
        >
          {filteredPoints.map((point) => (
            <Marker
              key={point.id}
              coordinate={point.coords}
              onPress={() => setSelectedPoint(point)}
            >
              <View style={[
                styles.markerContainer,
                selectedPoint?.id === point.id && styles.selectedMarker
              ]}>
                <Ionicons
                  name="business"
                  size={20}
                  color={selectedPoint?.id === point.id ? '#fff' : '#1b4332'}
                />
              </View>
            </Marker>
          ))}

          {/* Current Location Marker */}
          {currentLocation && (
            <Marker
              coordinate={currentLocation}
              title="Your Location"
              description="You are here"
            >
              <View style={styles.currentLocationMarker}>
                <Ionicons name="location" size={24} color="#2d6a4f" />
              </View>
            </Marker>
          )}
        </MapView>

        {/* Map Controls */}
        <View style={styles.mapControls}>
          <TouchableOpacity
            style={styles.currentLocationButton}
            onPress={getCurrentLocation}
            disabled={isLoadingLocation}
          >
            {isLoadingLocation ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="locate" size={24} color="#fff" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.mapInfoButton}
            onPress={() => Alert.alert(
              'Map Instructions',
              '• Tap anywhere on the map to set your current location\n• Tap on collection point markers to select them\n• Use the search bar to find specific locations\n• Use the GPS button to get your exact location'
            )}
          >
            <Ionicons name="information-circle" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
      {(selectedPoint || currentLocation) && (
        <View style={styles.selectionContainer}>
          {selectedPoint ? (
            <>
              <Text style={styles.selectedLocationName}>{selectedPoint.name}</Text>
              <Text style={styles.selectedLocationDetails}>
                {selectedPoint.district}, {selectedPoint.sector}
              </Text>
              {currentFormState.userType === 'company' && (
                <View style={styles.coordinatesContainer}>
                  <Text style={styles.coordinatesText}>
                    📍 Coordinates: {selectedPoint.coords.latitude.toFixed(6)}, {selectedPoint.coords.longitude.toFixed(6)}
                  </Text>
                  <Text style={styles.capacityText}>
                    📊 Capacity: {selectedPoint.capacity} | Status: {selectedPoint.status}
                  </Text>
                  <Text style={styles.typesText}>
                    🗂️ Types: {selectedPoint.types.join(', ')}
                  </Text>
                </View>
              )}
            </>
          ) : (
            <>
              <Text style={styles.selectedLocationName}>Current Location</Text>
              <Text style={styles.selectedLocationDetails}>
                Your current GPS location
              </Text>
              {currentFormState.userType === 'company' && currentLocation && (
                <View style={styles.coordinatesContainer}>
                  <Text style={styles.coordinatesText}>
                    📍 Coordinates: {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                  </Text>
                  <Text style={styles.capacityText}>
                    📊 Type: Custom Location | Status: Active
                  </Text>
                  <Text style={styles.typesText}>
                    🗂️ Description: Your current location
                  </Text>
                </View>
              )}
            </>
          )}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearSelection}
            >
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={confirmSelection}
            >
              <Text style={styles.confirmButtonText}>
                {currentFormState.userType === 'company'
                  ? (selectedPoint ? 'Select This Collection Point' : 'Use Current Location')
                  : (selectedPoint ? 'Select This Location' : 'Use Current Location')
                }
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#2d6a4f',
    backgroundColor: '#2d6a4f',
    paddingTop: Platform.OS === 'android' ? 25 : 15,
    zIndex: 1,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  markerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#1b4332',
    borderWidth: 2,
  },
  selectedMarker: {
    backgroundColor: '#2d6a4f',
    borderColor: '#fff',
  },
  selectionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#2d6a4f',
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  selectedLocationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  selectedLocationDetails: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  clearButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  confirmButton: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    flex: 2,
  },
  confirmButtonText: {
    color: '#2d6a4f',
    fontSize: 16,
    fontWeight: 'bold',
  },
  coordinatesContainer: {
    marginBottom: 15,
  },
  coordinatesText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  capacityText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginTop: 5,
  },
  typesText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginTop: 5,
  },
  searchContainer: {
    position: 'absolute',
    top: 80,
    left: 20,
    right: 20,
    zIndex: 10,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  clearSearchButton: {
    marginLeft: 8,
  },
  searchResults: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 8,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchResultText: {
    marginLeft: 12,
    flex: 1,
  },
  searchResultName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  searchResultDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  mapControls: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'column',
    gap: 12,
  },
  currentLocationButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2d6a4f',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  mapInfoButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#11998e',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  currentLocationMarker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#2d6a4f',
    borderWidth: 3,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default LocationSelectionScreen; 