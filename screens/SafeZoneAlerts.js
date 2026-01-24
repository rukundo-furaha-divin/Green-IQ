import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

// Enhanced Rwanda-specific climate alerts with recycling and waste management context
const climateAlerts = [
  {
    id: 1,
    type: 'Flood Warning',
    severity: 'High',
    icon: 'water-outline',
    color: '#2196F3',
    text: 'Heavy rainfall expected in Gasabo district. Safe zones with waste management facilities are open for shelter.',
    affectedAreas: ['Nyarugenge', 'Kicukiro', 'Gasabo'],
    duration: '24 hours',
    recommendations: [
      'Visit safe zones with proper waste disposal facilities',
      'Avoid areas near waste collection points during flooding',
      'Use designated recycling centers for emergency shelter',
      'Report any waste-related environmental hazards'
    ],
    safeZones: ['Gasabo Green Refuge', 'Remera Sustainable Hub'],
    wasteImpact: 'Flooding may affect waste collection routes and recycling facilities',
    timestamp: '2024-01-22T10:30:00Z'
  },
  {
    id: 2,
    type: 'Heatwave Alert',
    severity: 'Moderate',
    icon: 'thermometer-outline',
    color: '#FF5722',
    text: 'Extreme heat expected across all districts. Cooling centers with sustainable energy systems available.',
    affectedAreas: ['All districts'],
    duration: '48 hours',
    recommendations: [
      'Visit cooling centers with solar-powered systems',
      'Stay hydrated and avoid outdoor waste disposal activities',
      'Use air-conditioned recycling centers',
      'Reduce waste generation during heatwave'
    ],
    safeZones: ['Nyarugenge Eco-Safe Zone', 'Kimironko Eco-Sanctuary'],
    wasteImpact: 'Heat may accelerate waste decomposition - use proper disposal methods',
    timestamp: '2024-01-22T08:15:00Z'
  },
  {
    id: 3,
    type: 'Air Quality Alert',
    severity: 'Low',
    icon: 'cloud-outline',
    color: '#FF9800',
    text: 'Moderate air pollution in central areas. Use air-purified safe zones and avoid outdoor waste burning.',
    affectedAreas: ['Central districts'],
    duration: '12 hours',
    recommendations: [
      'Use safe zones with air purification systems',
      'Avoid outdoor waste burning activities',
      'Use indoor recycling facilities',
      'Report illegal waste disposal activities'
    ],
    safeZones: ['Gasabo Green Refuge', 'Remera Sustainable Hub'],
    wasteImpact: 'Poor air quality may affect waste collection and processing operations',
    timestamp: '2024-01-22T09:45:00Z'
  },
  {
    id: 4,
    type: 'Waste Management Alert',
    severity: 'Moderate',
    icon: 'trash-outline',
    color: '#795548',
    text: 'Temporary disruption in waste collection services. Alternative recycling centers available.',
    affectedAreas: ['Nyarugenge', 'Kicukiro'],
    duration: '6 hours',
    recommendations: [
      'Use alternative recycling centers',
      'Store waste properly until collection resumes',
      'Visit safe zones with waste processing facilities',
      'Report overflowing waste bins'
    ],
    safeZones: ['Kicukiro Climate Haven', 'Kimironko Eco-Sanctuary'],
    wasteImpact: 'Collection delays may lead to waste accumulation - use designated storage areas',
    timestamp: '2024-01-22T11:20:00Z'
  }
];

// Rwanda-specific emergency contacts for waste management and environmental issues
const emergencyContacts = [
  {
    name: 'Environmental Emergency Hotline',
    number: '+250 123 456 789',
    description: 'Report environmental hazards and waste-related emergencies',
    icon: 'call-outline',
    color: '#F44336'
  },
  {
    name: 'Waste Management Department',
    number: '+250 987 654 321',
    description: 'Report waste collection issues and recycling facility problems',
    icon: 'trash-outline',
    color: '#795548'
  },
  {
    name: 'Climate Action Response Team',
    number: '+250 555 123 456',
    description: 'Emergency response for climate-related incidents',
    icon: 'shield-outline',
    color: '#2196F3'
  }
];

export default function SafeZoneAlerts({ navigation }) {
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showAlertDetails, setShowAlertDetails] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

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

  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case 'high': return '#F44336';
      case 'moderate': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return '#666';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity.toLowerCase()) {
      case 'high': return 'warning';
      case 'moderate': return 'alert-circle';
      case 'low': return 'information-circle';
      default: return 'help-circle';
    }
  };

  const filteredAlerts = climateAlerts.filter(alert => {
    const matchesSearch = searchQuery.trim().length === 0 || 
      alert.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.affectedAreas.some(area => area.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesSeverity = filterSeverity === 'all' || alert.severity.toLowerCase() === filterSeverity;
    
    return matchesSearch && matchesSeverity;
  });

  const handleAlertPress = (alert) => {
    setSelectedAlert(alert);
    setShowAlertDetails(true);
  };

  const handleEmergencyCall = (contact) => {
    Alert.alert(
      'Emergency Call',
      `Call ${contact.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Call', 
          onPress: () => {
            // In a real app, you would use Linking to make the call
            Alert.alert('Calling...', `Dialing ${contact.number}`);
          }
        }
      ]
    );
  };

  const handleReportIssue = () => {
    Alert.alert(
      'Report Environmental Issue',
      'Would you like to report an environmental or waste management issue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Report', 
          onPress: () => {
            // Navigate to issue reporting form
            Alert.alert('Thank you', 'Your report has been submitted. Emergency response team will be notified.');
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('SafeZonesMap')} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
          <Text style={styles.headerButtonText}>Back to Map</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rwanda Climate Alerts</Text>
        <TouchableOpacity onPress={handleReportIssue} style={styles.headerButton}>
          <Ionicons name="flag" size={22} color="#FFD700" />
          <Text style={styles.headerButtonText}>Report</Text>
        </TouchableOpacity>
      </View>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search alerts..."
          style={styles.searchInput}
          placeholderTextColor="#888"
        />
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setFilterSeverity(filterSeverity === 'all' ? 'high' : filterSeverity === 'high' ? 'moderate' : filterSeverity === 'moderate' ? 'low' : 'all')}
        >
          <Ionicons name="filter" size={20} color="#1B5E20" />
          <Text style={styles.filterText}>{filterSeverity === 'all' ? 'All' : filterSeverity.charAt(0).toUpperCase() + filterSeverity.slice(1)}</Text>
        </TouchableOpacity>
      </View>

      {/* Emergency Contacts */}
      <View style={styles.emergencySection}>
        <Text style={styles.sectionTitle}>Emergency Contacts</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.contactsScroll}>
          {emergencyContacts.map((contact, index) => (
            <TouchableOpacity 
              key={index}
              style={styles.contactCard}
              onPress={() => handleEmergencyCall(contact)}
            >
              <View style={[styles.contactIcon, { backgroundColor: contact.color }]}>
                <Ionicons name={contact.icon} size={24} color="#fff" />
              </View>
              <Text style={styles.contactName}>{contact.name}</Text>
              <Text style={styles.contactNumber}>{contact.number}</Text>
              <Text style={styles.contactDescription}>{contact.description}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Alerts List */}
      <View style={styles.alertsSection}>
        <Text style={styles.sectionTitle}>Active Rwanda Climate Alerts ({filteredAlerts.length})</Text>
        <ScrollView style={styles.alertsList} showsVerticalScrollIndicator={false}>
          {filteredAlerts.map((alert) => (
            <TouchableOpacity 
              key={alert.id}
              style={[styles.alertCard, { borderLeftColor: alert.color }]}
              onPress={() => handleAlertPress(alert)}
            >
              <View style={styles.alertHeader}>
                <View style={styles.alertTypeContainer}>
                  <Ionicons name={alert.icon} size={20} color={alert.color} />
                  <Text style={[styles.alertType, { color: alert.color }]}>{alert.type}</Text>
                </View>
                <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(alert.severity) }]}>
                  <Ionicons name={getSeverityIcon(alert.severity)} size={14} color="#fff" />
                  <Text style={styles.severityText}>{alert.severity}</Text>
                </View>
              </View>
              
              <Text style={styles.alertText}>{alert.text}</Text>
              
              <View style={styles.alertDetails}>
                <View style={styles.detailRow}>
                  <Ionicons name="location" size={14} color="#666" />
                  <Text style={styles.detailText}>Affected: {alert.affectedAreas.join(', ')}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="time" size={14} color="#666" />
                  <Text style={styles.detailText}>Duration: {alert.duration}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="shield" size={14} color="#666" />
                  <Text style={styles.detailText}>Safe Zones: {alert.safeZones.join(', ')}</Text>
                </View>
              </View>

              <View style={styles.wasteImpact}>
                <Ionicons name="trash" size={16} color="#795548" />
                <Text style={styles.wasteImpactText}>{alert.wasteImpact}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Alert Details Modal */}
      <Modal
        visible={showAlertDetails}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAlertDetails(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedAlert && (
                <>
                  <View style={styles.modalHeader}>
                    <View style={styles.modalTitleContainer}>
                      <Ionicons name={selectedAlert.icon} size={28} color={selectedAlert.color} />
                      <Text style={styles.modalTitle}>{selectedAlert.type}</Text>
                    </View>
                    <TouchableOpacity onPress={() => setShowAlertDetails(false)}>
                      <Ionicons name="close" size={24} color="#888" />
                    </TouchableOpacity>
                  </View>

                  <View style={[styles.severitySection, { backgroundColor: getSeverityColor(selectedAlert.severity) + '20' }]}>
                    <View style={[styles.severityCircle, { backgroundColor: getSeverityColor(selectedAlert.severity) }]}>
                      <Ionicons name={getSeverityIcon(selectedAlert.severity)} size={24} color="#fff" />
                    </View>
                    <View style={styles.severityInfo}>
                      <Text style={styles.severityTitle}>{selectedAlert.severity} Severity</Text>
                      <Text style={styles.severityDescription}>
                        This alert requires {selectedAlert.severity.toLowerCase()} level attention and response.
                      </Text>
                    </View>
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Alert Description</Text>
                    <Text style={styles.alertDescription}>{selectedAlert.text}</Text>
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Affected Areas</Text>
                    <View style={styles.areasList}>
                      {selectedAlert.affectedAreas.map((area, index) => (
                        <View key={index} style={styles.areaItem}>
                          <Ionicons name="location" size={16} color="#1B5E20" />
                          <Text style={styles.areaText}>{area}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Recommendations</Text>
                    {selectedAlert.recommendations.map((rec, index) => (
                      <View key={index} style={styles.recommendationItem}>
                        <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                        <Text style={styles.recommendationText}>{rec}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Available Safe Zones</Text>
                    {selectedAlert.safeZones.map((zone, index) => (
                      <TouchableOpacity 
                        key={index} 
                        style={styles.safeZoneItem}
                        onPress={() => {
                          setShowAlertDetails(false);
                          navigation.navigate('SafeZonesMap');
                        }}
                      >
                        <Ionicons name="shield" size={16} color="#00C896" />
                        <Text style={styles.safeZoneText}>{zone}</Text>
                        <Ionicons name="arrow-forward" size={16} color="#666" />
                      </TouchableOpacity>
                    ))}
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Waste Management Impact</Text>
                    <View style={styles.wasteImpactSection}>
                      <Ionicons name="trash" size={20} color="#795548" />
                      <Text style={styles.wasteImpactDescription}>{selectedAlert.wasteImpact}</Text>
                    </View>
                  </View>

                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: '#1B5E20' }]}
                      onPress={() => {
                        setShowAlertDetails(false);
                        navigation.navigate('SafeZonesMap');
                      }}
                    >
                      <Ionicons name="map" size={20} color="#fff" />
                      <Text style={styles.actionButtonText}>View Safe Zones</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: '#FF5722' }]}
                      onPress={() => {
                        setShowAlertDetails(false);
                        handleReportIssue();
                      }}
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
    paddingBottom: 10,
    backgroundColor: '#1B5E20',
    paddingHorizontal: 10,
  },
  headerButton: {
    padding: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 18,
    marginBottom: 16,
    marginTop: 6,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginRight: 10,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterText: {
    color: '#1B5E20',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  emergencySection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 10,
    paddingHorizontal: 18,
  },
  contactsScroll: {
    paddingHorizontal: 18,
  },
  contactCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 200,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  contactIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  contactName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  contactNumber: {
    fontSize: 14,
    color: '#1B5E20',
    fontWeight: '600',
    marginBottom: 5,
  },
  contactDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  alertsSection: {
    flex: 1,
  },
  alertsList: {
    paddingHorizontal: 18,
  },
  alertCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  alertTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertType: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  severityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  alertText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 12,
  },
  alertDetails: {
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 6,
  },
  wasteImpact: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 8,
  },
  wasteImpactText: {
    fontSize: 13,
    color: '#795548',
    marginLeft: 6,
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginLeft: 10,
  },
  severitySection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  severityCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  severityInfo: {
    flex: 1,
  },
  severityTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  severityDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  section: {
    marginBottom: 20,
  },
  alertDescription: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  areasList: {
    backgroundColor: '#f8fffe',
    borderRadius: 12,
    padding: 16,
  },
  areaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  areaText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  recommendationText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  safeZoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fffe',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  safeZoneText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  wasteImpactSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
  },
  wasteImpactDescription: {
    fontSize: 14,
    color: '#795548',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
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
    paddingVertical: 12,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 6,
    fontSize: 14,
  },
}); 