import React, { useContext, useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
  Dimensions,
  StatusBar,
  Animated,
} from 'react-native';
import { UserContext } from '../context/UserContext';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { useWindowDimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const { width: screenWidth } = Dimensions.get('window');

const mockStats = {
  collectionPointsCount: 0,
  itemsRecycled: 0,
  activeUsers: 0,
  monthlyGrowth: 0,
  co2Saved: 0, 
  pointsDistributed: 0,
  topRecyclers: [
    { id: 1, name: 'EcoWarrior John', points: 0, items: 0 },
    { id: 2, name: 'Green Sarah', points: 0, items: 0 },
    { id: 3, name: 'RecyclePro Mike', points: 0, items: 0 },
  ],
  recentActivities: [
    { id: 1, action: 'New collection point added', location: 'Gasabo District', time: '2 hours ago', type: 'success' },
    { id: 2, action: 'Maintenance scheduled', location: 'Kigali Central', time: '4 hours ago', type: 'warning' },
    { id: 3, action: 'Point capacity reached', location: 'Nyamirambo', time: '6 hours ago', type: 'error' },
    { id: 4, action: 'Weekly report generated', location: 'System', time: '1 day ago', type: 'info' },
  ],
  collectionPointsList: [
    { id: 1, name: 'Kigali Central Hub', status: 'Operational', capacity: 85, location: 'Central Kigali', dailyCollection: 245, coordinates: { lat: -1.9441, lng: 30.0619 } },
    { id: 2, name: 'Nyamirambo Station', status: 'Full', capacity: 100, location: 'Nyamirambo', dailyCollection: 189, coordinates: { lat: -1.9706, lng: 30.0588 } },
    { id: 3, name: 'Kimironko Center', status: 'Operational', capacity: 67, location: 'Kimironko', dailyCollection: 156, coordinates: { lat: -1.9355, lng: 30.1123 } },
    { id: 4, name: 'Remera Point', status: 'Maintenance', capacity: 45, location: 'Remera', dailyCollection: 98, coordinates: { lat: -1.9578, lng: 30.1066 } },
    { id: 5, name: 'Gikondo Industrial', status: 'Operational', capacity: 78, location: 'Gikondo', dailyCollection: 287, coordinates: { lat: -1.9884, lng: 30.0644 } },
    { id: 6, name: 'Nyabugogo Terminal', status: 'Operational', capacity: 92, location: 'Nyabugogo', dailyCollection: 134, coordinates: { lat: -1.9355, lng: 30.0588 } },
  ],
  weeklyData: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      data: [235, 287, 356, 298, 445, 398, 234],
      color: (opacity = 1) => `rgba(45, 106, 79, ${opacity})`,
      strokeWidth: 3,
    }],
  },
  materialTypes: [
    { name: 'Plastic', population: 35, color: '#FF6B6B', legendFontColor: '#333', legendFontSize: 12 },
    { name: 'Glass', population: 25, color: '#4ECDC4', legendFontColor: '#333', legendFontSize: 12 },
    { name: 'Paper', population: 20, color: '#45B7D1', legendFontColor: '#333', legendFontSize: 12 },
    { name: 'Metal', population: 15, color: '#96CEB4', legendFontColor: '#333', legendFontSize: 12 },
    { name: 'Other', population: 5, color: '#FFEAA7', legendFontColor: '#333', legendFontSize: 12 },
  ],
};

const ecoTips = [
  'Rinse containers before recycling to avoid contamination.',
  'Bring your own bag to reduce plastic waste.',
  'Flatten cardboard boxes to save space in recycling bins.',
  'Electronics should be recycled at special drop-off points.',
  'Compost food scraps to reduce landfill waste.'
];

const Dashboard = () => {
  const { user } = useContext(UserContext);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const filteredPoints = useMemo(() => {
    return mockStats.collectionPointsList.filter(point =>
      point.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      point.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const window = useWindowDimensions();
  const isTablet = window.width >= 900;
  const isLandscape = window.width > window.height;

  const email = user?.email || '';

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  // Animation for main dashboard card
  const mainAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(mainAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const [ecoTipIndex, setEcoTipIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setEcoTipIndex((prev) => (prev + 1) % ecoTips.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  if (!email.endsWith('@rca.com')) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#d9534f" />
        <View style={styles.deniedContainer}>
          <Ionicons name="shield-checkmark-outline" size={80} color="#d9534f" />
          <Text style={styles.deniedText}>Access Restricted</Text>
          <Text style={styles.deniedSub}>
            This government dashboard requires authorized RCA credentials.
          </Text>
          <TouchableOpacity style={styles.contactButton} onPress={() => Alert.alert('Contact', 'Please contact your system administrator for access.')}>
            <Text style={styles.contactButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handlePointPress = (point) => {
    setSelectedPoint(point);
    setModalVisible(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Operational': return '#2d6a4f';
      case 'Full': return '#e67e22';
      case 'Maintenance': return '#f39c12';
      default: return '#d9534f';
    }
  };

  const getCapacityColor = (capacity) => {
    if (capacity >= 90) return '#e74c3c';
    if (capacity >= 70) return '#f39c12';
    return '#27ae60';
  };

  // Responsive grid for metrics
  const renderMetricsGrid = () => {
    const metrics = [
      {
        icon: 'location',
        value: mockStats.collectionPointsCount,
        label: 'Collection Points',
        cardStyle: styles.primaryCard,
      },
      {
        icon: 'leaf',
        value: mockStats.itemsRecycled.toLocaleString(),
        label: 'Items Recycled',
        cardStyle: styles.successCard,
      },
      {
        icon: 'people',
        value: mockStats.activeUsers.toLocaleString(),
        label: 'Active Users',
        cardStyle: styles.infoCard,
      },
      {
        icon: 'trending-up',
        value: `+${mockStats.monthlyGrowth}%`,
        label: 'Monthly Growth',
        cardStyle: styles.warningCard,
      },
    ];
    const columns = isTablet ? 4 : 2;
    const rows = [];
    for (let i = 0; i < metrics.length; i += columns) {
      rows.push(metrics.slice(i, i + columns));
    }
    return rows.map((row, rowIndex) => (
      <View key={rowIndex} style={[styles.metricsRow, isTablet && styles.metricsRowTablet]}>
        {row.map((metric, idx) => (
          <View key={metric.label} style={[styles.metricCard, metric.cardStyle, isTablet && styles.metricCardTablet]}>
            <Ionicons name={metric.icon} size={isTablet ? 38 : 28} color="#fff" style={{ marginBottom: 6 }} />
            <Text style={[styles.metricValue, isTablet && styles.metricValueTablet]}>{metric.value}</Text>
            <Text style={[styles.metricLabel, isTablet && styles.metricLabelTablet]}>{metric.label}</Text>
          </View>
        ))}
      </View>
    ));
  };

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'overview':
        return (
          <Animated.View style={{
            opacity: mainAnim,
            transform: [{ translateY: mainAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }],
          }}>
            {/* Welcoming Header */}
            <View style={styles.dashboardHeader}>
              <Text style={styles.dashboardTitle}>Welcome to Your Dashboard!</Text>
              <Text style={styles.dashboardSubtitle}>Track your impact, manage collection points, and see your community grow.</Text>
            </View>
            {/* Quick Actions */}
            <View style={styles.quickActionsRow}>
              <TouchableOpacity style={styles.quickActionButton} onPress={() => Alert.alert('Scan Item', 'Go to Scan screen!')}>
                <Ionicons name="scan" size={28} color="#fff" />
                <Text style={styles.quickActionText}>Scan Item</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickActionButton} onPress={() => Alert.alert('Find Drop-off', 'Go to Map!')}>
                <Ionicons name="map" size={28} color="#fff" />
                <Text style={styles.quickActionText}>Find Drop-off</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickActionButton} onPress={() => Alert.alert('Invite Friends', 'Share the app!')}>
                <Ionicons name="person-add" size={28} color="#fff" />
                <Text style={styles.quickActionText}>Invite Friends</Text>
              </TouchableOpacity>
            </View>
            {/* Eco Tip */}
            <View style={styles.ecoTipCard}>
              <Ionicons name="leaf" size={22} color="#43e97b" style={{ marginRight: 8 }} />
              <Text style={styles.ecoTipText}>{ecoTips[ecoTipIndex]}</Text>
            </View>
            {/* Safe Zones Map Preview */}
            <View style={[styles.sectionCard, isTablet && styles.sectionCardTablet, { padding: 0, overflow: 'hidden', marginBottom: 28 }]}> 
              <Text style={[styles.sectionTitle, isTablet && styles.sectionTitleTablet, { padding: 16 }]}>Safe Zones Map</Text>
              <MapView
                style={styles.mapPreview}
                initialRegion={{
                  latitude: -1.9403,
                  longitude: 30.0739,
                  latitudeDelta: 0.12,
                  longitudeDelta: 0.12,
                }}
                pointerEvents="none"
              >
                {mockStats.collectionPointsList.map(point => (
                  <Marker
                    key={point.id}
                    coordinate={{ latitude: point.coordinates.lat, longitude: point.coordinates.lng }}
                    title={point.name}
                    description={point.location}
                  />
                ))}
              </MapView>
              <TouchableOpacity style={styles.mapButton} onPress={() => Alert.alert('Open Map', 'Go to full map!')}>
                <Text style={styles.mapButtonText}>Open Full Map</Text>
              </TouchableOpacity>
            </View>
            {/* Material Breakdown Pie Chart */}
            <View style={[styles.sectionCard, isTablet && styles.sectionCardTablet]}> 
              <Text style={[styles.sectionTitle, isTablet && styles.sectionTitleTablet]}>Material Breakdown</Text>
              <PieChart
                data={mockStats.materialTypes}
                width={isTablet ? 400 : screenWidth - 60}
                height={isTablet ? 220 : 160}
                chartConfig={{
                  color: (opacity = 1) => `rgba(45, 106, 79, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
                }}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft={isTablet ? '20' : '10'}
                absolute
                style={{ alignSelf: 'center' }}
              />
            </View>
            {/* Leaderboard */}
            <View style={[styles.sectionCard, isTablet && styles.sectionCardTablet]}> 
              <Text style={[styles.sectionTitle, isTablet && styles.sectionTitleTablet]}>Top Recyclers</Text>
              {mockStats.topRecyclers.map((user, idx) => (
                <View key={user.id} style={styles.leaderboardRow}>
                  <Ionicons name="trophy" size={22} color={idx === 0 ? '#ffd700' : idx === 1 ? '#c0c0c0' : '#cd7f32'} style={{ marginRight: 8 }} />
                  <Text style={styles.leaderboardName}>{user.name}</Text>
                  <Text style={styles.leaderboardPoints}>{user.points} pts</Text>
                  <Text style={styles.leaderboardItems}>{user.items} items</Text>
                </View>
              ))}
            </View>
            {/* Key Metrics (Responsive Grid) */}
            <View style={[styles.metricsContainer, isTablet && styles.metricsContainerTablet]}>
              {renderMetricsGrid()}
            </View>
            {/* Environmental Impact */}
            <View style={[styles.sectionCard, isTablet && styles.sectionCardTablet]}>
              <Text style={[styles.sectionTitle, isTablet && styles.sectionTitleTablet]}>Environmental Impact</Text>
              <View style={styles.impactRow}>
                <View style={styles.impactItem}>
                  <Ionicons name="cloud" size={isTablet ? 32 : 24} color="#27ae60" />
                  <Text style={[styles.impactValue, isTablet && styles.impactValueTablet]}>{mockStats.co2Saved} tons</Text>
                  <Text style={[styles.impactLabel, isTablet && styles.impactLabelTablet]}>CO₂ Saved</Text>
                </View>
                <View style={styles.impactItem}>
                  <Ionicons name="star" size={isTablet ? 32 : 24} color="#f39c12" />
                  <Text style={[styles.impactValue, isTablet && styles.impactValueTablet]}>{mockStats.pointsDistributed.toLocaleString()}</Text>
                  <Text style={[styles.impactLabel, isTablet && styles.impactLabelTablet]}>Points Distributed</Text>
                </View>
              </View>
            </View>
            {/* Weekly Collection Chart */}
            <View style={[styles.sectionCard, isTablet && styles.sectionCardTablet]}>
              <Text style={[styles.sectionTitle, isTablet && styles.sectionTitleTablet]}>Weekly Collection Trends</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <LineChart
                  data={mockStats.weeklyData}
                  width={(isTablet ? 700 : screenWidth - 60)}
                  height={isTablet ? 280 : 200}
                  chartConfig={{
                    backgroundColor: '#fff',
                    backgroundGradientFrom: '#fff',
                    backgroundGradientTo: '#fff',
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(45, 106, 79, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    style: { borderRadius: 16 },
                    propsForDots: {
                      r: isTablet ? '6' : '4',
                      strokeWidth: isTablet ? '3' : '2',
                      stroke: '#2d6a4f',
                    },
                  }}
                  bezier
                  style={styles.chart}
                />
              </ScrollView>
            </View>
          </Animated.View>
        );

      case 'points':
        return (
          <View>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search collection points..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#999"
              />
            </View>

            {/* Collection Points List */}
            <FlatList
              data={filteredPoints}
              keyExtractor={item => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.pointCard} onPress={() => handlePointPress(item)}>
                  <View style={styles.pointHeader}>
                    <View style={styles.pointInfo}>
                      <Text style={styles.pointName}>{item.name}</Text>
                      <Text style={styles.pointLocation}>{item.location}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                      <Text style={styles.statusText}>{item.status}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.pointMetrics}>
                    <View style={styles.pointMetric}>
                      <Text style={styles.metricNumber}>{item.capacity}%</Text>
                      <Text style={styles.metricText}>Capacity</Text>
                      <View style={styles.capacityBar}>
                        <View style={[styles.capacityFill, { 
                          width: `${item.capacity}%`, 
                          backgroundColor: getCapacityColor(item.capacity) 
                        }]} />
                      </View>
                    </View>
                    <View style={styles.pointMetric}>
                      <Text style={styles.metricNumber}>{item.dailyCollection}</Text>
                      <Text style={styles.metricText}>Daily Items</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        );

      case 'analytics':
        return (
          <View>
            {/* Material Distribution */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Material Distribution</Text>
              <PieChart
                data={mockStats.materialTypes}
                width={screenWidth - 60}
                height={220}
                chartConfig={{
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                }}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
              />
            </View>

            {/* Top Recyclers */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Top Recyclers This Month</Text>
              {mockStats.topRecyclers.map((recycler, index) => (
                <View key={recycler.id} style={styles.recyclerRow}>
                  <View style={styles.recyclerRank}>
                    <Text style={styles.rankNumber}>{index + 1}</Text>
                  </View>
                  <View style={styles.recyclerInfo}>
                    <Text style={styles.recyclerName}>{recycler.name}</Text>
                    <Text style={styles.recyclerStats}>
                      {recycler.points.toLocaleString()} points • {recycler.items} items
                    </Text>
                  </View>
                  <Ionicons name="trophy" size={20} color={index === 0 ? '#f1c40f' : index === 1 ? '#95a5a6' : '#cd7f32'} />
                </View>
              ))}
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'success': return '#27ae60';
      case 'warning': return '#f39c12';
      case 'error': return '#e74c3c';
      default: return '#3498db';
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'success': return 'checkmark-circle';
      case 'warning': return 'warning';
      case 'error': return 'alert-circle';
      default: return 'information-circle';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1b4332" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Government Dashboard</Text>
          <Text style={styles.headerSubtitle}>Rwanda Recycling Management</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={24} color="#fff" />
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationCount}>3</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[ 
            { key: 'overview', label: 'Overview', icon: 'analytics' },
            { key: 'points', label: 'Collection Points', icon: 'location' },
            { key: 'analytics', label: 'Analytics', icon: 'pie-chart' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, selectedTab === tab.key && styles.activeTab]}
              onPress={() => setSelectedTab(tab.key)}
            >
              <Ionicons name={tab.icon} size={20} color={selectedTab === tab.key ? '#2d6a4f' : '#666'} />
              <Text style={[styles.tabText, selectedTab === tab.key && styles.activeTabText]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {renderTabContent()}
      </ScrollView>

      {/* Point Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedPoint && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedPoint.name}</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Ionicons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.modalBody}>
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Status:</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedPoint.status) }]}>
                      <Text style={styles.statusText}>{selectedPoint.status}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Location:</Text>
                    <Text style={styles.modalValue}>{selectedPoint.location}</Text>
                  </View>
                  
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Capacity:</Text>
                    <Text style={styles.modalValue}>{selectedPoint.capacity}%</Text>
                  </View>
                  
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Daily Collection:</Text>
                    <Text style={styles.modalValue}>{selectedPoint.dailyCollection} items</Text>
                  </View>
                  
                  <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="settings" size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>Manage Point</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#1b4332',
    paddingHorizontal: 20,
    paddingVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#a8d5ba',
    marginTop: 2,
  },
  notificationButton: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#e74c3c',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tabContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginRight: 10,
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#2d6a4f',
  },
  tabText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#2d6a4f',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  metricsContainer: {
    marginBottom: 24,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 900,
  },
  metricsContainerTablet: {
    marginBottom: 36,
    maxWidth: 900,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  metricsRowTablet: {
    marginBottom: 28,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#2d6a4f',
    borderRadius: 18,
    marginHorizontal: 6,
    paddingVertical: 18,
    paddingHorizontal: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  metricCardTablet: {
    borderRadius: 28,
    paddingVertical: 32,
    marginHorizontal: 14,
  },
  metricValue: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 2,
  },
  metricValueTablet: {
    fontSize: 32,
  },
  metricLabel: {
    color: '#e0e0e0',
    fontSize: 14,
    marginTop: 2,
  },
  metricLabelTablet: {
    fontSize: 18,
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionCardTablet: {
    borderRadius: 24,
    padding: 30,
    marginBottom: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1b4332',
    marginBottom: 15,
  },
  sectionTitleTablet: {
    fontSize: 24,
    marginBottom: 20,
  },
  impactRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  impactItem: {
    alignItems: 'center',
  },
  impactValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1b4332',
    marginTop: 8,
  },
  impactValueTablet: {
    fontSize: 28,
  },
  impactLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  impactLabelTablet: {
    fontSize: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
    paddingHorizontal: 15,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16,
    color: '#333',
  },
  pointCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  pointHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  pointInfo: {
    flex: 1,
  },
  pointName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1b4332',
  },
  pointLocation: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  pointMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pointMetric: {
    flex: 1,
  },
  metricNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1b4332',
  },
  metricText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  capacityBar: {
    height: 4,
    backgroundColor: '#e9ecef',
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  capacityFill: {
    height: '100%',
    borderRadius: 2,
  },
  recyclerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  recyclerRank: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
  recyclerInfo: {
    flex: 1,
  },
  recyclerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  recyclerStats: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '100%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1b4332',
  },
  modalBody: {
    padding: 20,
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  modalLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  modalValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  dashboardHeader: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 10,
    paddingHorizontal: 10,
  },
  dashboardTitle: {
    color: '#222',
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: 1.2,
  },
  dashboardSubtitle: {
    color: '#11998e',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 2,
    fontWeight: '500',
    lineHeight: 24,
  },
  deniedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  deniedText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#d9534f',
    marginTop: 10,
  },
  deniedSub: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 20,
  },
  contactButton: {
    backgroundColor: '#2d6a4f',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2d6a4f',
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
    marginTop: 8,
    gap: 10,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: '#11998e',
    borderRadius: 16,
    alignItems: 'center',
    paddingVertical: 14,
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    marginTop: 4,
  },
  ecoTipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0f7fa',
    borderRadius: 14,
    padding: 12,
    marginBottom: 18,
    marginHorizontal: 2,
    shadowColor: '#43e97b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  ecoTipText: {
    color: '#11998e',
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  mapPreview: {
    width: '100%',
    height: 180,
    minHeight: 120,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  mapButton: {
    backgroundColor: '#43e97b',
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  mapButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  leaderboardName: {
    flex: 1,
    fontWeight: 'bold',
    color: '#222',
    fontSize: 15,
  },
  leaderboardPoints: {
    color: '#11998e',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 14,
  },
  leaderboardItems: {
    color: '#888',
    marginLeft: 8,
    fontSize: 13,
  },
});

export default Dashboard; 