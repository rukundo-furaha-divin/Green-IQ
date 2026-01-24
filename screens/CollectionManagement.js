import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StatusBar,
  SafeAreaView,
  ScrollView,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  useWindowDimensions,
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Toast from "react-native-toast-message";

const { width, height } = Dimensions.get("window");

// Mock data for waste scan notifications
const mockWasteScanNotifications = [
  {
    id: 1,
    personName: "Jean Pierre Uwimana",
    phoneNumber: "+250 788 123 456",
    wasteTypes: ["Plastic", "Paper", "Glass"],
    scanTime: "2024-01-22T14:30:00Z",
    location: "Kigali City, Gasabo District",
    status: "pending",
    quantity: "2.5 kg",
    notes: "Mixed recyclables from office waste"
  },
  {
    id: 2,
    personName: "Marie Claire Niyonsaba",
    phoneNumber: "+250 789 234 567",
    wasteTypes: ["Organic", "Biodegradable"],
    scanTime: "2024-01-22T13:45:00Z",
    location: "Kigali City, Kicukiro District",
    status: "confirmed",
    quantity: "1.8 kg",
    notes: "Kitchen waste from restaurant"
  },
  {
    id: 3,
    personName: "Emmanuel Ndayisaba",
    phoneNumber: "+250 787 345 678",
    wasteTypes: ["Electronic", "Hazardous"],
    scanTime: "2024-01-22T12:15:00Z",
    location: "Kigali City, Nyarugenge District",
    status: "collected",
    quantity: "0.5 kg",
    notes: "Old batteries and small electronics"
  },
  {
    id: 4,
    personName: "Grace Uwamahoro",
    phoneNumber: "+250 786 456 789",
    wasteTypes: ["Metal", "Plastic"],
    scanTime: "2024-01-22T11:20:00Z",
    location: "Kigali City, Gasabo District",
    status: "pending",
    quantity: "3.2 kg",
    notes: "Construction site waste materials"
  },
  {
    id: 5,
    personName: "David Nkurunziza",
    phoneNumber: "+250 785 567 890",
    wasteTypes: ["Paper", "Cardboard"],
    scanTime: "2024-01-22T10:30:00Z",
    location: "Kigali City, Kicukiro District",
    status: "confirmed",
    quantity: "4.1 kg",
    notes: "Office paper waste and packaging"
  }
];

const CollectionManagement = ({ navigation }) => {
  const [notifications, setNotifications] = useState(mockWasteScanNotifications);
  const [filteredNotifications, setFilteredNotifications] = useState(mockWasteScanNotifications);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showNotificationDetails, setShowNotificationDetails] = useState(false);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const listAnim = useRef(new Animated.Value(0)).current;

  const window = useWindowDimensions();
  const isTablet = window.width >= 700;
  const isSmallDevice = window.width < 350;

  useEffect(() => {
    // Animate content fade in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(listAnim, {
        toValue: 1,
        duration: 1000,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();

    loadNotifications();
  }, []);

  useEffect(() => {
    filterNotifications();
  }, [searchQuery, statusFilter, notifications]);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      // In a real app, this would be an API call
      // const response = await axios.get('https://trash2treasure-backend.onrender.com/company/notifications');
      // setNotifications(response.data);
      
      // For now, using mock data
      setTimeout(() => {
        setNotifications(mockWasteScanNotifications);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Failed to load notifications",
        text2: "Please check your connection and try again",
      });
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const filterNotifications = () => {
    let filtered = notifications;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(notification =>
        notification.personName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notification.phoneNumber.includes(searchQuery) ||
        notification.wasteTypes.some(type => type.toLowerCase().includes(searchQuery.toLowerCase())) ||
        notification.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(notification => notification.status === statusFilter);
    }

    setFilteredNotifications(filtered);
  };

  const handleNotificationPress = (notification) => {
    setSelectedNotification(notification);
    setShowNotificationDetails(true);
  };

  const handleStatusUpdate = async (notificationId, newStatus) => {
    try {
      // In a real app, this would be an API call
      // await axios.put(`https://trash2treasure-backend.onrender.com/company/notifications/${notificationId}`, { status: newStatus });
      
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, status: newStatus }
            : notification
        )
      );

      Toast.show({
        type: "success",
        text1: "Status Updated",
        text2: `Notification status changed to ${newStatus}`,
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Update Failed",
        text2: "Failed to update notification status",
      });
    }
  };

  const handleCallPerson = (phoneNumber) => {
    Alert.alert(
      "Call Person",
      `Call ${phoneNumber}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Call", 
          onPress: () => {
            // In a real app, you would use Linking to make the call
            Alert.alert("Calling...", `Dialing ${phoneNumber}`);
          }
        }
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "#FF9800";
      case "confirmed": return "#2196F3";
      case "collected": return "#4CAF50";
      case "cancelled": return "#F44336";
      default: return "#666";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending": return "time-outline";
      case "confirmed": return "checkmark-circle-outline";
      case "collected": return "checkmark-done-circle";
      case "cancelled": return "close-circle-outline";
      default: return "help-circle-outline";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderNotificationItem = ({ item, index }) => (
    <Animated.View
      style={[
        styles.notificationCard,
        {
          opacity: listAnim,
          transform: [{ translateY: listAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [50, 0]
          })}]
        }
      ]}
    >
      <TouchableOpacity
        style={styles.notificationContent}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.notificationHeader}>
          <View style={styles.personInfo}>
            <Ionicons name="person-circle" size={24} color="#11998e" />
            <View style={styles.personDetails}>
              <Text style={styles.personName}>{item.personName}</Text>
              <Text style={styles.phoneNumber}>{item.phoneNumber}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Ionicons name={getStatusIcon(item.status)} size={16} color="#fff" />
            <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.wasteInfo}>
          <Text style={styles.wasteTypesLabel}>Waste Types:</Text>
          <View style={styles.wasteTypesContainer}>
            {item.wasteTypes.map((type, idx) => (
              <View key={idx} style={styles.wasteTypeTag}>
                <Text style={styles.wasteTypeText}>{type}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.notificationFooter}>
          <View style={styles.footerInfo}>
            <Ionicons name="location" size={16} color="#666" />
            <Text style={styles.locationText}>{item.location}</Text>
          </View>
          <View style={styles.footerInfo}>
            <Ionicons name="scale" size={16} color="#666" />
            <Text style={styles.quantityText}>{item.quantity}</Text>
          </View>
          <View style={styles.footerInfo}>
            <Ionicons name="time" size={16} color="#666" />
            <Text style={styles.timeText}>{formatDate(item.scanTime)}</Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleCallPerson(item.phoneNumber)}
          >
            <Ionicons name="call" size={16} color="#11998e" />
            <Text style={styles.actionButtonText}>Call</Text>
          </TouchableOpacity>
          
          {item.status === "pending" && (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.confirmButton]}
                onPress={() => handleStatusUpdate(item.id, "confirmed")}
              >
                <Ionicons name="checkmark" size={16} color="#fff" />
                <Text style={[styles.actionButtonText, { color: "#fff" }]}>Confirm</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={() => handleStatusUpdate(item.id, "cancelled")}
              >
                <Ionicons name="close" size={16} color="#fff" />
                <Text style={[styles.actionButtonText, { color: "#fff" }]}>Cancel</Text>
              </TouchableOpacity>
            </>
          )}
          
          {item.status === "confirmed" && (
            <TouchableOpacity
              style={[styles.actionButton, styles.collectButton]}
              onPress={() => handleStatusUpdate(item.id, "collected")}
            >
              <Ionicons name="checkmark-done" size={16} color="#fff" />
              <Text style={[styles.actionButtonText, { color: "#fff" }]}>Mark Collected</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#11998e" />
        <Text style={styles.loadingText}>Loading notifications...</Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={["#43e97b", "#11998e"]}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#43e97b" />
      <SafeAreaView style={styles.safeArea}>
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerTitle}>
              <Text style={styles.title}>Waste Scan Notifications</Text>
              <Text style={styles.subtitle}>Manage incoming waste collection requests</Text>
            </View>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={onRefresh}
            >
              <Ionicons name="refresh" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Search and Filter Bar */}
          <View style={styles.searchFilterContainer}>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by name, phone, or waste type..."
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            
            <View style={styles.filterContainer}>
              <TouchableOpacity
                style={[styles.filterButton, statusFilter === "all" && styles.filterButtonActive]}
                onPress={() => setStatusFilter("all")}
              >
                <Text style={[styles.filterText, statusFilter === "all" && styles.filterTextActive]}>All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterButton, statusFilter === "pending" && styles.filterButtonActive]}
                onPress={() => setStatusFilter("pending")}
              >
                <Text style={[styles.filterText, statusFilter === "pending" && styles.filterTextActive]}>Pending</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterButton, statusFilter === "confirmed" && styles.filterButtonActive]}
                onPress={() => setStatusFilter("confirmed")}
              >
                <Text style={[styles.filterText, statusFilter === "confirmed" && styles.filterTextActive]}>Confirmed</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterButton, statusFilter === "collected" && styles.filterButtonActive]}
                onPress={() => setStatusFilter("collected")}
              >
                <Text style={[styles.filterText, statusFilter === "collected" && styles.filterTextActive]}>Collected</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Statistics */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{notifications.filter(n => n.status === "pending").length}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{notifications.filter(n => n.status === "confirmed").length}</Text>
              <Text style={styles.statLabel}>Confirmed</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{notifications.filter(n => n.status === "collected").length}</Text>
              <Text style={styles.statLabel}>Collected</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{notifications.length}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
          </View>

          {/* Notifications List */}
          <FlatList
            data={filteredNotifications}
            renderItem={renderNotificationItem}
            keyExtractor={(item) => item.id.toString()}
            style={styles.notificationsList}
            contentContainerStyle={styles.notificationsContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="notifications-off" size={64} color="#ccc" />
                <Text style={styles.emptyTitle}>No notifications found</Text>
                <Text style={styles.emptySubtitle}>
                  {searchQuery || statusFilter !== "all" 
                    ? "Try adjusting your search or filters"
                    : "New waste scan notifications will appear here"
                  }
                </Text>
              </View>
            }
          />
        </Animated.View>

        {/* Notification Details Modal */}
        {showNotificationDetails && selectedNotification && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Notification Details</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowNotificationDetails(false)}
                >
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.modalContent}>
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Person Information</Text>
                  <View style={styles.detailRow}>
                    <Ionicons name="person" size={20} color="#11998e" />
                    <Text style={styles.detailText}>{selectedNotification.personName}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="call" size={20} color="#11998e" />
                    <Text style={styles.detailText}>{selectedNotification.phoneNumber}</Text>
                  </View>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Waste Information</Text>
                  <View style={styles.detailRow}>
                    <Ionicons name="trash" size={20} color="#11998e" />
                    <Text style={styles.detailText}>Types: {selectedNotification.wasteTypes.join(", ")}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="scale" size={20} color="#11998e" />
                    <Text style={styles.detailText}>Quantity: {selectedNotification.quantity}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="location" size={20} color="#11998e" />
                    <Text style={styles.detailText}>{selectedNotification.location}</Text>
                  </View>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Additional Information</Text>
                  <View style={styles.detailRow}>
                    <Ionicons name="time" size={20} color="#11998e" />
                    <Text style={styles.detailText}>Scan Time: {formatDate(selectedNotification.scanTime)}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="document-text" size={20} color="#11998e" />
                    <Text style={styles.detailText}>Notes: {selectedNotification.notes}</Text>
                  </View>
                </View>
              </ScrollView>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalActionButton}
                  onPress={() => handleCallPerson(selectedNotification.phoneNumber)}
                >
                  <Ionicons name="call" size={20} color="#fff" />
                  <Text style={styles.modalActionText}>Call Person</Text>
                </TouchableOpacity>
                
                {selectedNotification.status === "pending" && (
                  <TouchableOpacity
                    style={[styles.modalActionButton, { backgroundColor: "#4CAF50" }]}
                    onPress={() => {
                      handleStatusUpdate(selectedNotification.id, "confirmed");
                      setShowNotificationDetails(false);
                    }}
                  >
                    <Ionicons name="checkmark" size={20} color="#fff" />
                    <Text style={styles.modalActionText}>Confirm Collection</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#e0f2f1",
    textAlign: "center",
    marginTop: 4,
  },
  refreshButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingTop: 20,
  },
  searchFilterContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: "#333",
  },
  filterContainer: {
    flexDirection: "row",
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#fff",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterButtonActive: {
    backgroundColor: "#11998e",
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  filterTextActive: {
    color: "#fff",
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#11998e",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
  },
  notificationsList: {
    flex: 1,
  },
  notificationsContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  notificationCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  notificationContent: {
    padding: 20,
  },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  personInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  personDetails: {
    marginLeft: 12,
    flex: 1,
  },
  personName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  phoneNumber: {
    fontSize: 14,
    color: "#666",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#fff",
  },
  wasteInfo: {
    marginBottom: 16,
  },
  wasteTypesLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  wasteTypesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  wasteTypeTag: {
    backgroundColor: "#e8f5e8",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  wasteTypeText: {
    fontSize: 12,
    color: "#11998e",
    fontWeight: "600",
  },
  notificationFooter: {
    marginBottom: 16,
  },
  footerInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
  },
  quantityText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
  },
  timeText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  confirmButton: {
    backgroundColor: "#4CAF50",
  },
  cancelButton: {
    backgroundColor: "#F44336",
  },
  collectButton: {
    backgroundColor: "#2196F3",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    paddingHorizontal: 40,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    width: "90%",
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    padding: 20,
  },
  detailSection: {
    marginBottom: 24,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 12,
    flex: 1,
  },
  modalActions: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  modalActionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#11998e",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  modalActionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
});

export default CollectionManagement;