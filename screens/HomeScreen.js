import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { API_BASE_URL } from '../utils/apiConfig';
import Toast from "react-native-toast-message";
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Platform,
  Animated as RNAnimated,
  useWindowDimensions,
  RefreshControl,
  ActivityIndicator
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get("window");

const ecoTips = [
  {
    text: '🌟 Did you know? Recycling one aluminum can saves enough energy to run a TV for 3 hours!',
    likes: 124,
    liked: false
  },
  {
    text: '💡 Tip: Rinse containers before recycling to avoid contamination.',
    likes: 89,
    liked: false
  },
  {
    text: '♻️ Fact: Glass can be recycled endlessly without loss in quality.',
    likes: 156,
    liked: false
  },
  {
    text: '🛍️ Tip: Bring your own bag to reduce plastic waste.',
    likes: 72,
    liked: false
  },
  {
    text: '🌱 Fact: Composting food scraps reduces landfill waste and creates rich soil.',
    likes: 203,
    liked: false
  }
];

const HomeScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [ecoTipIndex, setEcoTipIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tips, setTips] = useState(ecoTips);
  const [isOffline, setIsOffline] = useState(false);
  const [activities, setActivities] = useState([]);
  const [growthStats, setGrowthStats] = useState([0, 0, 0, 0, 0, 0, 0]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [nearbyCompanies, setNearbyCompanies] = useState([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
  const [quickActionsVisible, setQuickActionsVisible] = useState(false);

  const scanAnim = useRef(new RNAnimated.Value(0.8)).current;
  const fadeAnim = useRef(new RNAnimated.Value(0)).current;
  const slideAnim = useRef(new RNAnimated.Value(50)).current;
  const pulseAnim = useRef(new RNAnimated.Value(1)).current;
  const tipFadeAnim = useRef(new RNAnimated.Value(1)).current;
  const quickActionsAnim = useRef(new RNAnimated.Value(0)).current;

  const window = useWindowDimensions();
  const isTablet = window.width >= 768;
  const isSmallDevice = window.width < 350;
  const isMediumDevice = window.width >= 350 && window.width < 450;
  const isLargeDevice = window.width >= 450;

  // Responsive dimensions
  const getResponsiveSize = (small, medium, large, tablet) => {
    if (isTablet) return tablet;
    if (isSmallDevice) return small;
    if (isMediumDevice) return medium;
    return large;
  };

  const responsiveSizes = {
    titleSize: getResponsiveSize(16, 18, 20, 24),
    subtitleSize: getResponsiveSize(12, 13, 14, 16),
    bodySize: getResponsiveSize(11, 12, 13, 15),
    headerSize: getResponsiveSize(18, 20, 22, 26),
    userNameSize: getResponsiveSize(16, 18, 20, 24),
    sectionSpacing: getResponsiveSize(16, 20, 24, 32),
    cardPadding: getResponsiveSize(12, 16, 18, 24),
    iconSize: getResponsiveSize(16, 18, 20, 24),
    largeIconSize: getResponsiveSize(24, 28, 32, 40),
    cardRadius: getResponsiveSize(12, 14, 16, 20),
    avatarSize: getResponsiveSize(32, 36, 40, 48),
    fabSize: getResponsiveSize(50, 56, 60, 68),
    gridGap: getResponsiveSize(8, 12, 16, 20),
    containerPadding: getResponsiveSize(16, 18, 20, 24),
  };

  useEffect(() => {
    const getUserinfo = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/userInfo`,
          { timeout: 5000 }
        );
        setUser(response.data);
        setIsOffline(false);
      } catch (error) {
        if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
          setIsOffline(true);
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
      }
    };
    getUserinfo();

    RNAnimated.parallel([
      RNAnimated.spring(scanAnim, {
        toValue: 1,
        friction: 4,
        tension: 80,
        useNativeDriver: true,
      }),
      RNAnimated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      RNAnimated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    const createPulse = () => {
      RNAnimated.sequence([
        RNAnimated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        RNAnimated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]).start(() => createPulse());
    };
    createPulse();

    const fetchDashboardData = async () => {
      try {
        const results = await Promise.allSettled([
          axios.get(`${API_BASE_URL}/userInfo`),
          axios.get(`${API_BASE_URL}/stats/recycling-growth`),
          axios.get(`${API_BASE_URL}/activities`),
          axios.get(`${API_BASE_URL}/tips`),
          axios.get(`${API_BASE_URL}/leaderboard`),
          axios.get(`${API_BASE_URL}/companyInfo`)
        ]);

        if (results[0].status === 'fulfilled') setUser(results[0].value.data);
        if (results[1].status === 'fulfilled') setGrowthStats(Array.isArray(results[1].value.data) ? results[1].value.data : [0, 0, 0, 0, 0, 0, 0]);
        if (results[2].status === 'fulfilled') {
          const activitiesData = results[2].value.data.message || results[2].value.data;
          setActivities(Array.isArray(activitiesData) ? activitiesData : []);
        }
        if (results[3].status === 'fulfilled') {
          const tipsData = results[3].value.data.message || results[3].value.data;
          const validTips = Array.isArray(tipsData)
            ? tipsData.filter(tip => tip && typeof tip.text === 'string' && tip.text.trim().length > 0)
            : [];
          setTips(validTips.length > 0 ? validTips : ecoTips);
        }
        if (results[4].status === 'fulfilled') {
          const leaderboardData = results[4].value.data.message || results[4].value.data;
          setLeaderboard(Array.isArray(leaderboardData) ? leaderboardData : []);
        }
        if (results[5].status === 'fulfilled') {
          const companiesData = results[5].value.data.companies || results[5].value.data.message || [];
          setNearbyCompanies(Array.isArray(companiesData) ? companiesData.slice(0, 4) : []);
        }

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoadingActivities(false);
        setIsLoadingStats(false);
        setIsLoadingCompanies(false);
      }
    };

    fetchDashboardData();

    const interval = setInterval(() => {
      RNAnimated.sequence([
        RNAnimated.timing(tipFadeAnim, {
          toValue: 0.3,
          duration: 300,
          useNativeDriver: true,
        }),
        RNAnimated.timing(tipFadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
      setEcoTipIndex((prev) => (prev + 1) % (tips && tips.length > 0 ? tips.length : 1));
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const results = await Promise.allSettled([
        axios.get(`${API_BASE_URL}/userInfo`, { timeout: 5000 }),
        axios.get(`${API_BASE_URL}/stats/recycling-growth`),
        axios.get(`${API_BASE_URL}/activities`),
        axios.get(`${API_BASE_URL}/tips`)
      ]);

      if (results[0].status === 'fulfilled') setUser(results[0].value.data);
      if (results[1].status === 'fulfilled') setGrowthStats(Array.isArray(results[1].value.data) ? results[1].value.data : [0, 0, 0, 0, 0, 0, 0]);
      if (results[2].status === 'fulfilled') {
        const activitiesData = results[2].value.data.message || results[2].value.data;
        setActivities(Array.isArray(activitiesData) ? activitiesData : []);
      }
      if (results[3].status === 'fulfilled') {
        const tipsData = results[3].value.data.message || results[3].value.data;
        const validTips = Array.isArray(tipsData)
          ? tipsData.filter(tip => tip && typeof tip.text === 'string' && tip.text.trim().length > 0)
          : [];
        setTips(validTips.length > 0 ? validTips : ecoTips);
      }

      setIsOffline(false);
    } catch (error) {
      setIsOffline(true);
    } finally {
      setRefreshing(false);
    }
  };

  const handleLikeTip = async (index) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const updatedTips = [...tips];
    const tip = updatedTips[index];
    if (!tip || !tip._id) return;

    const isNowLiked = !tip.liked;
    updatedTips[index] = {
      ...tip,
      liked: isNowLiked,
      likes: isNowLiked ? (tip.likes || 0) + 1 : Math.max(0, (tip.likes || 0) - 1)
    };
    setTips(updatedTips);

    try {
      console.log(`Sending like request for tip: ${tip._id} to ${API_BASE_URL}/tips/${tip._id}/like`);
      const response = await axios.post(`${API_BASE_URL}/tips/${tip._id}/like`);
      if (response.data) {
        console.log('Like request success:', response.data);
        updatedTips[index] = response.data;
        setTips(updatedTips);
      }
    } catch (error) {
      console.log('Detailed tip like error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      console.error("Failed to sync tip like status", error);
    }
  };

  const toggleQuickActions = () => {
    if (quickActionsVisible) {
      RNAnimated.timing(quickActionsAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      }).start(() => setQuickActionsVisible(false));
    } else {
      setQuickActionsVisible(true);
      RNAnimated.timing(quickActionsAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true
      }).start();
    }
  };

  const progress = user?.ecoPoints ? Math.min(user.ecoPoints / 1000, 1) : 0.1;

  const quickActions = [
    { icon: "scan-outline", label: "Scan", action: () => navigation.navigate("ScanChoice") },
    { icon: "map-outline", label: "Map", action: () => navigation.navigate("Map") },
    { icon: "qr-code-outline", label: "Purchase", action: () => navigation.navigate("Rewards") },
    { icon: "settings-outline", label: "Settings", action: () => navigation.navigate("Profile") },
  ];

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#1B5E20" />
        <Text style={[styles.loadingText, { fontSize: responsiveSizes.bodySize }]}>Loading your eco profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={[styles.simpleTopNav, { paddingHorizontal: responsiveSizes.containerPadding }]}>
        <View style={styles.simpleTopNavLeft}>
          <Text style={[styles.simpleTopNavGreeting, { fontSize: responsiveSizes.subtitleSize }]}>Welcome back,</Text>
          <Text style={[styles.simpleTopNavUserName, { fontSize: responsiveSizes.userNameSize }]} numberOfLines={1} adjustsFontSizeToFit>
            {user ? user.fullNames : "Guest User"}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate(user ? "Profile" : "Login")}
          style={styles.simpleTopNavAvatarTouchable}
        >
          <View style={[styles.simpleTopNavAvatarWrap, {
            width: responsiveSizes.avatarSize,
            height: responsiveSizes.avatarSize,
            borderRadius: responsiveSizes.avatarSize / 2,
          }]}>
            {user && user.profilePic ? (
              <Image
                source={{ uri: user.profilePic.startsWith('http') ? user.profilePic : `${API_BASE_URL}/${user.profilePic}` }}
                style={[styles.simpleTopNavAvatar, {
                  width: responsiveSizes.avatarSize,
                  height: responsiveSizes.avatarSize,
                  borderRadius: responsiveSizes.avatarSize / 2
                }]}
              />
            ) : (
              <View style={[styles.avatarFallback, {
                width: responsiveSizes.avatarSize,
                height: responsiveSizes.avatarSize,
                borderRadius: responsiveSizes.avatarSize / 2,
                backgroundColor: '#E8F5E9',
                justifyContent: 'center',
                alignItems: 'center'
              }]}>
                <Ionicons name="person" size={responsiveSizes.iconSize + 4} color="#4CAF50" />
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: responsiveSizes.containerPadding }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#2E7D32", "#4CAF50"]}
            tintColor="#2E7D32"
          />
        }
      >
        <View style={styles.statsCircleSection}>
          <View style={styles.mainProgressContainer}>
            <View style={styles.circularProgressBase}>
              <View style={[styles.circularProgressFill, { height: `${progress * 100}%` }]} />
              <View style={styles.circularProgressInner}>
                <Text style={styles.statsValueMain} numberOfLines={1} adjustsFontSizeToFit>
                  {user?.ecoPoints || 0}
                </Text>
                <Text style={styles.statsLabelMain}>Eco Points</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.activitySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderTitle}>Recycling Growth</Text>
            <View style={styles.growthIndicator}>
              <Ionicons name="trending-up" size={16} color="#4CAF50" />
              <Text style={styles.growthText}>+12%</Text>
            </View>
          </View>
          <View style={styles.chartContainer}>
            {growthStats.map((val, i) => (
              <View key={i} style={styles.chartBarColumn}>
                <LinearGradient
                  colors={i === 6 ? ['#4CAF50', '#2E7D32'] : ['#A5D6A7', '#81C784']}
                  style={[
                    styles.chartBar,
                    { height: Math.max((val / (Math.max(...growthStats, 1))) * 100, 5) }
                  ]}
                />
                <Text style={styles.chartDayText}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Leaderboard Top 3</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Leaderboard")}>
              <Text style={styles.seeAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.leaderboardPreview}>
            {leaderboard.length > 0 ? (
              leaderboard.slice(0, 3).map((item, index) => (
                <View key={item._id || index} style={styles.leaderboardItem}>
                  <View style={[styles.rankBadge, index === 0 ? styles.gold : index === 1 ? styles.silver : styles.bronze]}>
                    <Text style={styles.rankText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.leaderboardName} numberOfLines={1}>{item.fullNames || item.email}</Text>
                  <Text style={styles.leaderboardPoints}>{item.points || item.totalPoints || 0} pts</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noDataText}>No rankings available yet</Text>
            )}
          </View>
        </View>

        <View style={styles.quickActionsGrid}>
          {quickActions.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.gridActionCard}
              onPress={item.action}
              activeOpacity={0.8}
            >
              <LinearGradient colors={['#FFFFFF', '#F1F8E9']} style={styles.gridActionGradient}>
                <Ionicons name={item.icon} size={28} color="#2E7D32" />
                <Text style={styles.gridActionLabel}>{item.label}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activities</Text>
            <TouchableOpacity><Text style={styles.seeAllText}>History</Text></TouchableOpacity>
          </View>
          <View style={styles.activitiesList}>
            {activities.length > 0 ? (
              activities.map((activity) => (
                <View key={activity._id} style={styles.activityItem}>
                  <View style={[styles.activityIconCircle, activity.type === 'referral' && { backgroundColor: '#E3F2FD' }]}>
                    <Ionicons
                      name={activity.type === 'referral' ? 'people' : 'scan'}
                      size={20}
                      color={activity.type === 'referral' ? '#2196F3' : '#4CAF50'}
                    />
                  </View>
                  <View style={styles.activityInfo}>
                    <Text style={styles.activityTitle}>{activity.title}</Text>
                    <Text style={styles.activityTime}>{activity.time}</Text>
                  </View>
                  <Text style={[styles.activityPoints, activity.points?.startsWith('-') && { color: '#FF9800' }]}>
                    {activity.points} pts
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.noDataText}>No recent activities</Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Eco Tips</Text>
          <TouchableOpacity style={styles.tipCard} onPress={() => handleLikeTip(ecoTipIndex)}>
            <Text style={styles.tipText}>
              {tips && tips[ecoTipIndex] ? tips[ecoTipIndex].text : "Small actions today, a greener tomorrow!"}
            </Text>
            <View style={styles.tipFooter}>
              <Ionicons
                name={tips && tips[ecoTipIndex]?.liked ? "heart" : "heart-outline"}
                size={20}
                color={tips && tips[ecoTipIndex]?.liked ? "#FF5252" : "#8D6E63"}
              />
              <Text style={[styles.tipLikes, tips && tips[ecoTipIndex]?.liked && { color: '#FF5252' }]}>
                {tips && tips[ecoTipIndex] ? tips[ecoTipIndex].likes : 0}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {quickActionsVisible && (
        <RNAnimated.View style={[styles.quickActionsOverlay, { opacity: quickActionsAnim }]}>
          <TouchableOpacity style={styles.quickActionsBackground} onPress={toggleQuickActions} activeOpacity={1} />
        </RNAnimated.View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  loadingContainer: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 20, color: '#2E7D32', fontWeight: '600' },
  scrollContent: { paddingBottom: 100, alignItems: 'center', width: '100%' },
  section: { width: '100%', marginVertical: 15 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: "#2E7D32" },
  seeAllText: { color: '#4CAF50', fontWeight: '600', fontSize: 14 },
  simpleTopNav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#fff', paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 10,
    paddingBottom: 15, paddingHorizontal: 20, elevation: 2, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5,
  },
  simpleTopNavLeft: { flex: 1 },
  simpleTopNavGreeting: { color: '#8D6E63', fontWeight: '500', fontSize: 14 },
  simpleTopNavUserName: { color: '#2E7D32', fontWeight: '700', fontSize: 20 },
  simpleTopNavAvatarTouchable: { marginLeft: 15 },
  simpleTopNavAvatarWrap: { backgroundColor: '#E8F5E9', overflow: 'hidden', borderWidth: 2, borderColor: '#4CAF50' },
  simpleTopNavAvatar: { width: '100%', height: '100%', resizeMode: 'cover' },
  avatarFallback: { justifyContent: 'center', alignItems: 'center' },
  statsCircleSection: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%', marginTop: 10, marginBottom: 20 },
  mainProgressContainer: { width: width * 0.4, height: width * 0.4, justifyContent: 'center', alignItems: 'center' },
  circularProgressBase: {
    width: width * 0.38, height: width * 0.38, borderRadius: (width * 0.38) / 2,
    backgroundColor: '#fff', borderWidth: 8, borderColor: '#E8F5E9', justifyContent: 'center',
    alignItems: 'center', overflow: 'hidden', elevation: 4, shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8,
  },
  circularProgressFill: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#E8F5E9', opacity: 0.6 },
  circularProgressInner: { alignItems: 'center', zIndex: 1 },
  statsValueMain: { fontSize: 32, fontWeight: '800', color: '#2E7D32', textAlign: 'center', width: '100%', paddingHorizontal: 8 },
  statsLabelMain: { fontSize: 14, color: '#8D6E63', fontWeight: '600' },
  activitySection: { width: '100%', backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 20, elevation: 3, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  sectionHeaderTitle: { fontSize: 18, fontWeight: '700', color: '#2E7D32' },
  growthIndicator: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  growthText: { fontSize: 12, fontWeight: '700', color: '#4CAF50', marginLeft: 4 },
  chartContainer: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 120, paddingTop: 10 },
  chartBarColumn: { alignItems: 'center', flex: 1 },
  chartBar: { width: 12, backgroundColor: '#4CAF50', borderRadius: 6, marginBottom: 8 },
  chartDayText: { fontSize: 10, color: '#8D6E63', fontWeight: '600' },
  quickActionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
  gridActionCard: { width: '48%', marginBottom: 15, borderRadius: 15, overflow: 'hidden', elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 },
  gridActionGradient: { padding: 20, alignItems: 'center', justifyContent: 'center' },
  gridActionLabel: { marginTop: 10, fontSize: 14, fontWeight: '700', color: '#2E7D32' },
  leaderboardPreview: { backgroundColor: '#fff', borderRadius: 20, padding: 10, elevation: 2, marginBottom: 10 },
  leaderboardItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  rankBadge: { width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  gold: { backgroundColor: '#FFD700' }, silver: { backgroundColor: '#C0C0C0' }, bronze: { backgroundColor: '#CD7F32' },
  rankText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  leaderboardName: { flex: 1, fontSize: 14, fontWeight: '600', color: '#333' },
  leaderboardPoints: { fontSize: 14, fontWeight: '700', color: '#2E7D32' },
  noDataText: { textAlign: 'center', padding: 20, color: '#999', fontSize: 14 },
  activitiesList: { backgroundColor: '#fff', borderRadius: 20, padding: 10, elevation: 2 },
  activityItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  activityIconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  activityInfo: { flex: 1 },
  activityTitle: { fontSize: 14, fontWeight: '600', color: '#333' },
  activityTime: { fontSize: 11, color: '#999' },
  activityPoints: { fontSize: 14, fontWeight: '700', color: '#4CAF50' },
  tipCard: { backgroundColor: '#FFFDE7', borderRadius: 15, padding: 15, marginTop: 10, borderLeftWidth: 5, borderLeftColor: '#FBC02D' },
  tipText: { fontSize: 14, color: '#5D4037', lineHeight: 20, marginBottom: 10 },
  tipFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' },
  tipLikes: { marginLeft: 5, fontSize: 12, color: '#8D6E63', fontWeight: '600' },
  quickActionsOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 100 },
  quickActionsBackground: { flex: 1 },
});

export default HomeScreen;