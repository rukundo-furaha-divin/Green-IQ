import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../utils/apiConfig';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Animated as RNAnimated,
  useWindowDimensions,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Toast from "react-native-toast-message";
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

// Dummy recent waste scans data
const recentWasteScans = [
  {
    id: 1,
    user: "John Doe",
    wasteType: "Plastic Bottles",
    quantity: "5 kg",
    timestamp: "2 hours ago",
    status: "collected"
  },
  {
    id: 2,
    user: "Sarah Wilson",
    wasteType: "Paper Waste",
    quantity: "3 kg",
    timestamp: "4 hours ago",
    status: "pending"
  },
  {
    id: 3,
    user: "Mike Johnson",
    wasteType: "Glass Bottles",
    quantity: "2 kg",
    timestamp: "6 hours ago",
    status: "collected"
  },
  {
    id: 4,
    user: "Emma Davis",
    wasteType: "Electronic Waste",
    quantity: "1 kg",
    timestamp: "8 hours ago",
    status: "collected"
  },
  {
    id: 5,
    user: "Alex Brown",
    wasteType: "Organic Waste",
    quantity: "4 kg",
    timestamp: "1 day ago",
    status: "pending"
  }
];

const CompanyPortal = ({ navigation }) => {
  const [company, setCompany] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  const fadeAnim = useRef(new RNAnimated.Value(0)).current;
  const slideAnim = useRef(new RNAnimated.Value(50)).current;

  useEffect(() => {
    const getCompanyInfo = async () => {
      console.log('CompanyPortal - Starting to fetch company info...');
      setIsLoading(false);

      const actualCompanyData = {
        companyName: "Gravityz ",
        contactPersonalName: "Rukundo Furaha Divin",
        email: "rukundof993@gmail.com",
        phoneNumber: "+25079205051",
        companyAddress: {
          district: "Seocho-gu",
          sector: "Seoul",
          location: {
            type: "Point",
            coordinates: [127.0324, 37.4837]
          }
        }
      };

      setCompany(actualCompanyData);
      return;

      try {
        const response = await axios.get(
          `${API_BASE_URL}/companyInfo`,
          { timeout: 5000 }
        );
        setCompany(response.data);
        setIsOffline(false);
        console.log('Company info loaded:', response.data);
        console.log('CompanyPortal - Company data set successfully');
      } catch (error) {
        console.log('CompanyPortal - Error fetching company info:', error);
        if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
          setIsOffline(true);
          Toast.show({
            type: 'info',
            text1: 'Offline Mode',
            text2: 'Showing cached data',
          });
        } else {
          Toast.show({
            type: "error",
            text1: "You must login first",
            text2: "Please login or create account first",
          });
          navigation.navigate("Login");
        }
      } finally {
        setIsLoading(false);
        console.log('CompanyPortal - Loading state set to false');
      }
    };

    getCompanyInfo();
  }, []);

  useEffect(() => {
    // Animate content fade in
    RNAnimated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Animate slide up
    RNAnimated.timing(slideAnim, {
      toValue: 0,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/companyInfo`
      );
      setCompany(response.data);
    } catch (error) {
      console.log('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'collected':
        return '#4CAF50';
      case 'pending':
        return '#FF9800';
      default:
        return '#666';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'collected':
        return 'Collected';
      case 'pending':
        return 'Pending';
      default:
        return 'Unknown';
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <RNAnimated.View
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.headerTop}>
              <View style={styles.welcomeSection}>
                <Text style={styles.welcomeText}>Welcome back,</Text>
                <Text style={styles.companyName}>
                  {company?.companyName || "Company"}
                </Text>
                <Text style={styles.contactName}>
                  {company?.contactPersonalName || "Contact Person"}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.contactButton}
                onPress={() => {
                  // Handle contact action
                  Toast.show({
                    type: 'info',
                    text1: 'Contact Info',
                    text2: `Phone: ${company?.phoneNumber || 'N/A'}\nEmail: ${company?.email || 'N/A'}`,
                  });
                }}
              >
                <LinearGradient
                  colors={["#11998e", "#43e97b"]}
                  style={styles.contactGradient}
                >
                  <Ionicons name="call" size={20} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </RNAnimated.View>

          {/* Recent Waste Scans */}
          <RNAnimated.View
            style={[
              styles.scansContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.sectionTitle}>Recent Waste Scans</Text>

            {recentWasteScans.map((scan, index) => (
              <View key={scan.id} style={styles.scanCard}>
                <View style={styles.scanHeader}>
                  <View style={styles.userInfo}>
                    <Ionicons name="person-circle" size={24} color="#11998e" />
                    <Text style={styles.userName}>{scan.user}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(scan.status) }]}>
                    <Text style={styles.statusText}>{getStatusText(scan.status)}</Text>
                  </View>
                </View>

                <View style={styles.scanDetails}>
                  <View style={styles.detailRow}>
                    <Ionicons name="recycle" size={16} color="#666" />
                    <Text style={styles.detailText}>{scan.wasteType}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="scale" size={16} color="#666" />
                    <Text style={styles.detailText}>{scan.quantity}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="time" size={16} color="#666" />
                    <Text style={styles.detailText}>{scan.timestamp}</Text>
                  </View>
                </View>
              </View>
            ))}
          </RNAnimated.View>

          {/* Contact Information */}
          <RNAnimated.View
            style={[
              styles.contactContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.sectionTitle}>Contact Information</Text>
            <View style={styles.contactCard}>
              <View style={styles.contactRow}>
                <Ionicons name="call" size={20} color="#11998e" />
                <Text style={styles.contactText}>{company?.phoneNumber || '+25079205051'}</Text>
              </View>
              <View style={styles.contactRow}>
                <Ionicons name="mail" size={20} color="#11998e" />
                <Text style={styles.contactText}>{company?.email || 'rukundof993@gmail.com'}</Text>
              </View>
              <View style={styles.contactRow}>
                <Ionicons name="location" size={20} color="#11998e" />
                <Text style={styles.contactText}>
                  {company?.companyAddress?.district || 'Seocho-gu'}, {company?.companyAddress?.sector || 'Seoul'}
                </Text>
              </View>
            </View>
          </RNAnimated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  debugText: {
    marginTop: 8,
    fontSize: 12,
    color: '#fff',
    fontStyle: 'italic',
  },
  debugBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 255, 0, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 15,
    alignItems: 'center',
    zIndex: 10,
  },
  debugBannerText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: '#ffffff',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: '#333',
    opacity: 0.9,
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#11998e',
    marginTop: 4,
  },
  contactName: {
    fontSize: 16,
    color: '#666',
    marginTop: 2,
  },
  contactButton: {
    padding: 8,
  },
  contactGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  offlineText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 6,
    fontWeight: '600',
  },
  scansContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  scanCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  scanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  scanDetails: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  contactContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  contactCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
});

export default CompanyPortal; 