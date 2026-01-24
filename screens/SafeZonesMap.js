import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Modal, Linking, TextInput, ScrollView, Alert, Image } from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE, Circle } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

// Enhanced Rwanda-specific safe zones with comprehensive data
const rwandaSafeZones = [
  { 
    id: 1, 
    name: 'Kigali Convention Center Safe Zone', 
    coords: { latitude: -1.9501, longitude: 30.0588 }, 
    address: 'KG 2 Roundabout, Kigali', 
    description: 'Major convention center with solar power and emergency facilities.',
    safetyScore: 95,
    climateRisks: ['Low flood risk', 'Low heat risk'],
    greenInfrastructure: ['Solar panels', 'Green roof', 'Rainwater harvesting', 'Waste-to-energy'],
    recyclingCenters: 8,
    airQuality: 'Excellent',
    emergencyCapacity: 500,
    lastUpdated: '2024-01-15',
    communityRating: 4.8,
    features: ['Emergency shelter', 'Medical aid', 'Food storage', 'Communication hub', 'Conference facilities'],
    district: 'Kigali City',
    sector: 'Nyarugenge',
    manager: 'Jean Pierre Nkurunziza',
    contact: '+250 788 123 456',
    operatingHours: '24/7',
    capacity: '500 people',
    facilities: ['Medical station', 'Food distribution', 'Water purification', 'Solar charging', 'WiFi', 'Conference rooms']
  },
  { 
    id: 2, 
    name: 'Amahoro Stadium Climate Refuge', 
    coords: { latitude: -1.9439, longitude: 30.0594 }, 
    address: 'Remera, Kigali', 
    description: 'Large stadium with extensive emergency facilities and green infrastructure.',
    safetyScore: 92,
    climateRisks: ['Low flood risk', 'Low heat risk'],
    greenInfrastructure: ['Solar panels', 'Rainwater harvesting', 'Biodiversity garden', 'Waste processing'],
    recyclingCenters: 6,
    airQuality: 'Excellent',
    emergencyCapacity: 1000,
    lastUpdated: '2024-01-20',
    communityRating: 4.6,
    features: ['Mass shelter', 'Medical center', 'Food distribution', 'Sports facilities', 'Parking'],
    district: 'Kigali City',
    sector: 'Gasabo',
    manager: 'Marie Claire Uwimana',
    contact: '+250 789 234 567',
    operatingHours: '24/7',
    capacity: '1000 people',
    facilities: ['Large medical center', 'Mass food distribution', 'Water storage', 'Solar power', 'Parking for 500 vehicles']
  },
  { 
    id: 3, 
    name: 'Kigali Genocide Memorial Safe Zone', 
    coords: { latitude: -1.9486, longitude: 30.0556 }, 
    address: 'KG 14 Ave, Kigali', 
    description: 'Memorial site with climate-resilient facilities and community support.',
    safetyScore: 88,
    climateRisks: ['Low flood risk', 'Moderate heat risk'],
    greenInfrastructure: ['Solar panels', 'Memorial gardens', 'Water conservation', 'Green spaces'],
    recyclingCenters: 4,
    airQuality: 'Good',
    emergencyCapacity: 200,
    lastUpdated: '2024-01-18',
    communityRating: 4.7,
    features: ['Emergency shelter', 'Counseling services', 'Medical aid', 'Community support', 'Educational facilities'],
    district: 'Kigali City',
    sector: 'Gasabo',
    manager: 'Paul Kagame',
    contact: '+250 790 345 678',
    operatingHours: '24/7',
    capacity: '200 people',
    facilities: ['Medical station', 'Counseling center', 'Food distribution', 'Water purification', 'Educational materials']
  },
  { 
    id: 4, 
    name: 'Kigali Heights Mall Safe Zone', 
    coords: { latitude: -1.9447, longitude: 30.0619 }, 
    address: 'KG 7 Ave, Kigali', 
    description: 'Modern mall with sustainable infrastructure and emergency facilities.',
    safetyScore: 85,
    climateRisks: ['Low flood risk', 'Low heat risk'],
    greenInfrastructure: ['Solar panels', 'Green building design', 'Waste management', 'Energy efficiency'],
    recyclingCenters: 5,
    airQuality: 'Good',
    emergencyCapacity: 300,
    lastUpdated: '2024-01-22',
    communityRating: 4.3,
    features: ['Shopping facilities', 'Medical aid', 'Food courts', 'Parking', 'Security'],
    district: 'Kigali City',
    sector: 'Nyarugenge',
    manager: 'Chantal Uwera',
    contact: '+250 791 456 789',
    operatingHours: '24/7',
    capacity: '300 people',
    facilities: ['Medical station', 'Food courts', 'Water supply', 'Security', 'Parking', 'WiFi']
  },
  { 
    id: 5, 
    name: 'Kigali Innovation City Hub', 
    coords: { latitude: -1.9367, longitude: 30.0600 }, 
    address: 'KG 9 Ave, Kigali', 
    description: 'Innovation hub with cutting-edge green technology and emergency response.',
    safetyScore: 90,
    climateRisks: ['Low flood risk', 'Low heat risk'],
    greenInfrastructure: ['Smart solar systems', 'IoT monitoring', 'Waste-to-energy', 'Green building'],
    recyclingCenters: 7,
    airQuality: 'Excellent',
    emergencyCapacity: 250,
    lastUpdated: '2024-01-19',
    communityRating: 4.5,
    features: ['Tech facilities', 'Emergency shelter', 'Medical aid', 'Innovation labs', 'Conference rooms'],
    district: 'Kigali City',
    sector: 'Gasabo',
    manager: 'Eric Ndayisaba',
    contact: '+250 792 567 890',
    operatingHours: '24/7',
    capacity: '250 people',
    facilities: ['Medical station', 'Tech labs', 'Conference facilities', 'Water purification', 'Smart monitoring']
  },
  { 
    id: 6, 
    name: 'Kigali Public Library Safe Zone', 
    coords: { latitude: -1.9497, longitude: 30.0575 }, 
    address: 'KG 6 Ave, Kigali', 
    description: 'Public library with educational facilities and climate resilience.',
    safetyScore: 82,
    climateRisks: ['Low flood risk', 'Moderate heat risk'],
    greenInfrastructure: ['Solar panels', 'Green spaces', 'Water conservation', 'Natural ventilation'],
    recyclingCenters: 3,
    airQuality: 'Good',
    emergencyCapacity: 150,
    lastUpdated: '2024-01-21',
    communityRating: 4.2,
    features: ['Educational facilities', 'Emergency shelter', 'Medical aid', 'Study spaces', 'Internet access'],
    district: 'Kigali City',
    sector: 'Nyarugenge',
    manager: 'Grace Mukamana',
    contact: '+250 793 678 901',
    operatingHours: '24/7',
    capacity: '150 people',
    facilities: ['Medical station', 'Library facilities', 'Study rooms', 'Water supply', 'Internet access']
  },
  { 
    id: 7, 
    name: 'Kigali Business Center', 
    coords: { latitude: -1.9425, longitude: 30.0583 }, 
    address: 'KG 5 Ave, Kigali', 
    description: 'Business center with modern facilities and emergency response capabilities.',
    safetyScore: 87,
    climateRisks: ['Low flood risk', 'Low heat risk'],
    greenInfrastructure: ['Solar panels', 'Energy efficiency', 'Waste management', 'Green building'],
    recyclingCenters: 4,
    airQuality: 'Good',
    emergencyCapacity: 180,
    lastUpdated: '2024-01-23',
    communityRating: 4.4,
    features: ['Business facilities', 'Emergency shelter', 'Medical aid', 'Meeting rooms', 'Security'],
    district: 'Kigali City',
    sector: 'Gasabo',
    manager: 'David Nshimiyimana',
    contact: '+250 794 789 012',
    operatingHours: '24/7',
    capacity: '180 people',
    facilities: ['Medical station', 'Business facilities', 'Meeting rooms', 'Water supply', 'Security', 'WiFi']
  },
  { 
    id: 8, 
    name: 'Kigali Community Center', 
    coords: { latitude: -1.9472, longitude: 30.0625 }, 
    address: 'KG 8 Ave, Kigali', 
    description: 'Community center focused on local support and climate resilience.',
    safetyScore: 80,
    climateRisks: ['Low flood risk', 'Moderate heat risk'],
    greenInfrastructure: ['Community gardens', 'Solar panels', 'Water harvesting', 'Green spaces'],
    recyclingCenters: 2,
    airQuality: 'Good',
    emergencyCapacity: 120,
    lastUpdated: '2024-01-24',
    communityRating: 4.6,
    features: ['Community facilities', 'Emergency shelter', 'Medical aid', 'Local support', 'Educational programs'],
    district: 'Kigali City',
    sector: 'Kicukiro',
    manager: 'Ange Uwimana',
    contact: '+250 795 890 123',
    operatingHours: '24/7',
    capacity: '120 people',
    facilities: ['Medical station', 'Community rooms', 'Educational facilities', 'Water supply', 'Local support']
  }
];

// Rwanda-specific climate alerts
const rwandaClimateAlerts = [
  { 
    id: 1, 
    type: 'Rainy Season Alert', 
    severity: 'Moderate',
    text: 'Heavy rainfall expected in Kigali. Safe zones with proper drainage are open.',
    affectedAreas: ['Kigali City', 'Eastern Province'],
    duration: '48 hours',
    icon: 'water-outline',
    color: '#2196F3'
  },
  { 
    id: 2, 
    type: 'Heatwave Alert', 
    severity: 'Low',
    text: 'High temperatures expected. Visit cooling centers and stay hydrated.',
    affectedAreas: ['All provinces'],
    duration: '24 hours',
    icon: 'thermometer-outline',
    color: '#FF5722'
  },
  { 
    id: 3, 
    type: 'Waste Management Alert', 
    severity: 'Low',
    text: 'Recycling centers operating normally. Continue proper waste disposal.',
    affectedAreas: ['Kigali City'],
    duration: '12 hours',
    icon: 'trash-outline',
    color: '#795548'
  }
];

export default function SafeZonesMap({ navigation }) {
  const mapRef = useRef(null);
  const [notifVisible, setNotifVisible] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedZone, setSelectedZone] = useState(null);
  const [showZoneDetails, setShowZoneDetails] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [mapType, setMapType] = useState('standard');

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    })();
  }, []);

  // Rwanda-specific map region
  const rwandaRegion = {
    latitude: -1.9403,
    longitude: 29.8739,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  };

  // Filter safe zones
  const filteredZones = rwandaSafeZones.filter(zone => {
    const matchesSearch = search.trim().length === 0 || 
      zone.name.toLowerCase().includes(search.toLowerCase()) || 
      zone.address.toLowerCase().includes(search.toLowerCase()) ||
      zone.district.toLowerCase().includes(search.toLowerCase());
    
    let matchesFilter = true;
    if (filterType === 'high-score') {
      matchesFilter = zone.safetyScore >= 85;
    } else if (filterType === 'low-risk') {
      matchesFilter = zone.climateRisks.some(risk => risk.includes('Low'));
    } else if (filterType === 'kigali') {
      matchesFilter = zone.district === 'Kigali City';
    }
    
    return matchesSearch && matchesFilter;
  });

  const getSafetyScoreColor = (score) => {
    if (score >= 90) return '#4CAF50';
    if (score >= 80) return '#8BC34A';
    if (score >= 70) return '#FF9800';
    return '#F44336';
  };

  const getSafetyScoreText = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    return 'Moderate';
  };

  const handleZonePress = (zone) => {
    setSelectedZone(zone);
    setShowZoneDetails(true);
  };

  const handleReportIssue = () => {
    Alert.alert(
      'Report Issue',
      'Would you like to report an issue with this safe zone?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Report', 
          onPress: () => {
            Alert.alert('Thank you', 'Your report has been submitted. We will investigate the issue.');
          }
        }
      ]
    );
  };

  const handleAddToFavorites = () => {
    Alert.alert('Success', 'Safe zone added to your favorites!');
  };

  const toggleMapType = () => {
    setMapType(mapType === 'standard' ? 'satellite' : 'standard');
  };

  return (
    <View style={styles.container}>
      {/* Enhanced Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
          <Text style={styles.headerButtonText}>Home</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Rwanda Safe Zones</Text>
          <Text style={styles.headerSubtitle}>Climate Resilience Map</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('SafeZoneAlerts')} style={styles.headerButton}>
          <Ionicons name="notifications" size={22} color="#FFD700" />
          <Text style={styles.headerButtonText}>Alerts</Text>
        </TouchableOpacity>
      </View>

      {/* Enhanced Search and Filter Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search safe zones in Rwanda..."
            style={styles.searchInput}
            placeholderTextColor="#888"
          />
        </View>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons name="filter" size={20} color="#1B5E20" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.mapTypeButton}
          onPress={toggleMapType}
        >
          <Ionicons name={mapType === 'standard' ? 'map' : 'map-outline'} size={20} color="#1B5E20" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.mapTypeButton}
          onPress={toggleMapType}
        >
          <Ionicons name={mapType === 'standard' ? 'map' : 'map-outline'} size={20} color="#1B5E20" />
        </TouchableOpacity>
      </View>

      {/* Enhanced Filter Options */}
      {showFilters && (
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity 
              style={[styles.filterOption, filterType === 'all' && styles.filterOptionActive]}
              onPress={() => setFilterType('all')}
            >
              <Text style={[styles.filterText, filterType === 'all' && styles.filterTextActive]}>All Zones</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.filterOption, filterType === 'high-score' && styles.filterOptionActive]}
              onPress={() => setFilterType('high-score')}
            >
              <Text style={[styles.filterText, filterType === 'high-score' && styles.filterTextActive]}>High Score (85+)</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.filterOption, filterType === 'low-risk' && styles.filterOptionActive]}
              onPress={() => setFilterType('low-risk')}
            >
              <Text style={[styles.filterText, filterType === 'low-risk' && styles.filterTextActive]}>Low Risk</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.filterOption, filterType === 'kigali' && styles.filterOptionActive]}
              onPress={() => setFilterType('kigali')}
            >
              <Text style={[styles.filterText, filterType === 'kigali' && styles.filterTextActive]}>Kigali City</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.filterOption, filterType === 'kigali' && styles.filterOptionActive]}
              onPress={() => setFilterType('kigali')}
            >
              <Text style={[styles.filterText, filterType === 'kigali' && styles.filterTextActive]}>Kigali City</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {/* Enhanced Climate Alerts Panel */}
      <TouchableOpacity 
        style={styles.alertsButton}
        onPress={() => setNotifVisible(!notifVisible)}
      >
        <Ionicons name="warning" size={20} color="#FF5722" />
        <Text style={styles.alertsButtonText}>Rwanda Alerts ({rwandaClimateAlerts.length})</Text>
      </TouchableOpacity>

      {/* Enhanced Floating Alerts Panel */}
      {notifVisible && (
        <View style={styles.alertsPanel}>
          <View style={styles.alertsHeader}>
            <Ionicons name="flag" size={20} color="#FF5722" />
            <Text style={styles.alertsTitle}>Rwanda Climate Alerts</Text>
            <TouchableOpacity onPress={() => setNotifVisible(false)}>
              <Ionicons name="close" size={18} color="#888" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.alertsList}>
            {rwandaClimateAlerts.map(alert => (
              <View key={alert.id} style={[styles.alertItem, { borderLeftColor: alert.color }]}>
                <View style={styles.alertHeader}>
                  <Ionicons name={alert.icon} size={16} color={alert.color} />
                  <Text style={[styles.alertType, { color: alert.color }]}>{alert.type}</Text>
                  <Text style={[styles.alertSeverity, { color: alert.color }]}>{alert.severity}</Text>
                </View>
                <Text style={styles.alertText}>{alert.text}</Text>
                <Text style={styles.alertDetails}>Affected: {alert.affectedAreas.join(', ')} • Duration: {alert.duration}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Enhanced Map */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={rwandaRegion}
        mapType={mapType}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
        showsScale={true}
        showsTraffic={false}
        showsBuildings={true}
        showsIndoors={true}
      >
        {filteredZones.map((zone) => (
          <Marker
            key={zone.id}
            coordinate={zone.coords}
            title={zone.name}
            description={`Safety Score: ${zone.safetyScore}/100`}
            onPress={() => handleZonePress(zone)}
          >
            <View style={styles.markerContainer}>
              <View style={[styles.marker, { backgroundColor: getSafetyScoreColor(zone.safetyScore) }]}>
                <Ionicons name="shield" size={20} color="#fff" />
              </View>
              <Text style={styles.markerScore}>{zone.safetyScore}</Text>
            </View>
            <Callout tooltip>
              <View style={styles.calloutContainer}>
                <View style={styles.calloutHeader}>
                  <Text style={styles.calloutTitle}>{zone.name}</Text>
                  <View style={[styles.scoreBadge, { backgroundColor: getSafetyScoreColor(zone.safetyScore) }]}>
                    <Text style={styles.scoreText}>{zone.safetyScore}</Text>
                  </View>
                </View>
                <Text style={styles.calloutDescription}>{zone.description}</Text>
                <Text style={styles.calloutText}>📍 {zone.address}</Text>
                <Text style={styles.calloutText}>🏛️ {zone.district}, {zone.sector}</Text>
                <Text style={styles.calloutText}>🛡️ Safety: {getSafetyScoreText(zone.safetyScore)}</Text>
                <Text style={styles.calloutText}>♻️ Recycling Centers: {zone.recyclingCenters} nearby</Text>
                <View style={styles.calloutActions}>
                  <TouchableOpacity
                    style={[styles.calloutButton, { backgroundColor: '#1B5E20' }]}
                    onPress={() => {
                      const url = `https://www.google.com/maps/dir/?api=1&destination=${zone.coords.latitude},${zone.coords.longitude}`;
                      Linking.openURL(url);
                    }}
                  >
                    <Ionicons name="navigate" size={16} color="#fff" />
                    <Text style={styles.calloutButtonText}>Directions</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.calloutButton, { backgroundColor: '#00C896' }]}
                    onPress={() => handleZonePress(zone)}
                  >
                    <Ionicons name="information-circle" size={16} color="#fff" />
                    <Text style={styles.calloutButtonText}>Details</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Enhanced Zone Details Modal */}
      <Modal
        visible={showZoneDetails}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowZoneDetails(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedZone && (
                <>
                  <View style={styles.modalHeader}>
                    <View style={styles.modalTitleContainer}>
                      <Text style={styles.modalTitle}>{selectedZone.name}</Text>
                      <Text style={styles.modalSubtitle}>{selectedZone.district}, {selectedZone.sector}</Text>
                    </View>
                    <TouchableOpacity onPress={() => setShowZoneDetails(false)}>
                      <Ionicons name="close" size={24} color="#888" />
                    </TouchableOpacity>
                  </View>

                  {/* Enhanced Safety Score */}
                  <View style={styles.scoreSection}>
                    <View style={styles.scoreHeader}>
                      <Text style={styles.scoreTitle}>Safety Score</Text>
                      <View style={[styles.scoreCircle, { backgroundColor: getSafetyScoreColor(selectedZone.safetyScore) }]}>
                        <Text style={styles.scoreNumber}>{selectedZone.safetyScore}</Text>
                        <Text style={styles.scoreMax}>/100</Text>
                      </View>
                    </View>
                    <Text style={styles.scoreDescription}>
                      {getSafetyScoreText(selectedZone.safetyScore)} safety rating based on climate resilience, green infrastructure, and community preparedness in Rwanda.
                    </Text>
                  </View>

                  {/* Contact Information */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Contact Information</Text>
                    <View style={styles.contactInfo}>
                      <View style={styles.contactRow}>
                        <Ionicons name="person" size={16} color="#1B5E20" />
                        <Text style={styles.contactText}>Manager: {selectedZone.manager}</Text>
                      </View>
                      <View style={styles.contactRow}>
                        <Ionicons name="call" size={16} color="#1B5E20" />
                        <Text style={styles.contactText}>{selectedZone.contact}</Text>
                      </View>
                      <View style={styles.contactRow}>
                        <Ionicons name="time" size={16} color="#1B5E20" />
                        <Text style={styles.contactText}>Hours: {selectedZone.operatingHours}</Text>
                      </View>
                      <View style={styles.contactRow}>
                        <Ionicons name="people" size={16} color="#1B5E20" />
                        <Text style={styles.contactText}>Capacity: {selectedZone.capacity}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Climate Risks */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Climate Risks in Rwanda</Text>
                    {selectedZone.climateRisks.map((risk, index) => (
                      <View key={index} style={styles.riskItem}>
                        <Ionicons name="warning-outline" size={16} color="#FF9800" />
                        <Text style={styles.riskText}>{risk}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Green Infrastructure */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Green Infrastructure</Text>
                    {selectedZone.greenInfrastructure.map((infra, index) => (
                      <View key={index} style={styles.infraItem}>
                        <Ionicons name="leaf-outline" size={16} color="#4CAF50" />
                        <Text style={styles.infraText}>{infra}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Features */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Available Features</Text>
                    <View style={styles.featuresGrid}>
                      {selectedZone.features.map((feature, index) => (
                        <View key={index} style={styles.featureItem}>
                          <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                          <Text style={styles.featureText}>{feature}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* Community Info */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Community Information</Text>
                    <View style={styles.communityInfo}>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Community Rating:</Text>
                        <View style={styles.ratingContainer}>
                          <Ionicons name="star" size={16} color="#FFD700" />
                          <Text style={styles.ratingText}>{selectedZone.communityRating}/5</Text>
                        </View>
                      </View>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Emergency Capacity:</Text>
                        <Text style={styles.infoValue}>{selectedZone.emergencyCapacity} people</Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Recycling Centers:</Text>
                        <Text style={styles.infoValue}>{selectedZone.recyclingCenters} nearby</Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Air Quality:</Text>
                        <Text style={styles.infoValue}>{selectedZone.airQuality}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Action Buttons */}
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: '#1B5E20' }]}
                      onPress={() => {
                        const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedZone.coords.latitude},${selectedZone.coords.longitude}`;
                        Linking.openURL(url);
                      }}
                    >
                      <Ionicons name="navigate" size={20} color="#fff" />
                      <Text style={styles.actionButtonText}>Get Directions</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: '#00C896' }]}
                      onPress={handleAddToFavorites}
                    >
                      <Ionicons name="heart" size={20} color="#fff" />
                      <Text style={styles.actionButtonText}>Add to Favorites</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: '#FF9800' }]}
                      onPress={handleReportIssue}
                    >
                      <Ionicons name="flag" size={20} color="#fff" />
                      <Text style={styles.actionButtonText}>Report Issue</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fffe',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 44,
    paddingBottom: 15,
    backgroundColor: '#1B5E20',
    paddingHorizontal: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerButton: {
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  headerButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  headerSubtitle: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    marginBottom: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginRight: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: '#333',
  },
  filterButton: {
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginRight: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  mapTypeButton: {
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  filterContainer: {
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  filterOptionActive: {
    backgroundColor: '#1B5E20',
    borderColor: '#1B5E20',
  },
  filterText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#fff',
  },
  alertsButton: {
    position: 'absolute',
    top: 140,
    right: 15,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    zIndex: 10,
  },
  alertsButtonText: {
    color: '#FF5722',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  alertsPanel: {
    position: 'absolute',
    top: 190,
    right: 15,
    backgroundColor: '#fff',
    borderRadius: 16,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    width: 320,
    maxHeight: 400,
    zIndex: 20,
  },
  alertsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  alertsTitle: {
    fontWeight: 'bold',
    color: '#1B5E20',
    fontSize: 16,
    marginLeft: 8,
    flex: 1,
  },
  alertsList: {
    maxHeight: 300,
  },
  alertItem: {
    padding: 15,
    borderLeftWidth: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  alertType: {
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 6,
    flex: 1,
  },
  alertSeverity: {
    fontSize: 12,
    fontWeight: '500',
  },
  alertText: {
    color: '#333',
    fontSize: 13,
    marginBottom: 4,
    lineHeight: 18,
  },
  alertDetails: {
    color: '#666',
    fontSize: 11,
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    alignItems: 'center',
  },
  marker: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  markerScore: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 2,
  },
  calloutContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    minWidth: 280,
    elevation: 4,
    shadowColor: '#1B5E20',
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  calloutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B5E20',
    flex: 1,
  },
  scoreBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  scoreText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  calloutDescription: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    lineHeight: 20,
  },
  calloutText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 3,
  },
  calloutActions: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  calloutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    flex: 1,
  },
  calloutButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 4,
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  modalTitleContainer: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  scoreSection: {
    backgroundColor: '#f8fffe',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  scoreTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B5E20',
  },
  scoreCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  scoreNumber: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  scoreMax: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scoreDescription: {
    color: '#666',
    fontSize: 14,
    lineHeight: 22,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 12,
  },
  contactInfo: {
    backgroundColor: '#f8fffe',
    borderRadius: 12,
    padding: 16,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    fontWeight: '500',
  },
  riskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  riskText: {
    color: '#333',
    fontSize: 14,
    marginLeft: 8,
  },
  infraItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infraText: {
    color: '#333',
    fontSize: 14,
    marginLeft: 8,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 10,
  },
  featureText: {
    color: '#333',
    fontSize: 14,
    marginLeft: 6,
  },
  communityInfo: {
    backgroundColor: '#f8fffe',
    borderRadius: 12,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoLabel: {
    color: '#666',
    fontSize: 14,
  },
  infoValue: {
    color: '#333',
    fontSize: 14,
    fontWeight: '500',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 14,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 6,
    fontSize: 14,
  },
}); 