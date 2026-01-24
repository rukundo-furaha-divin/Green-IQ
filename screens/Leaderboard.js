import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  ActivityIndicator,
  FlatList,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import { API_BASE_URL } from '../utils/apiConfig';

const medalColors = ["#FFD700", "#C0C0C0", "#CD7F32"];

export default function Leaderboard({ navigation }) {
  const { width } = useWindowDimensions();
  const isTablet = width > 700;
  const [allUsers, setAllUsers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${API_BASE_URL}/leaderboard`, { timeout: 10000 });
        setAllUsers(response.data.leaderBoard);
      } catch (err) {
        console.error('Leaderboard error:', err);
        setError(err?.response?.data?.message || 'Failed to load leaderboard');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const renderItem = ({ item, index }) => (
    <LinearGradient
      colors={[index < 3 ? medalColors[index] + "22" : "#fff", "#f8fffe"]}
      style={styles.rankCard}
    >
      <View style={styles.rankBadge}>
        <View style={[styles.badgeCircle, { backgroundColor: index < 3 ? medalColors[index] : "#e0e0e0" }]}>
          {index < 3 ? (
            <Ionicons name="medal" size={20} color="#fff" />
          ) : (
            <Text style={styles.rankText}>{index + 1}</Text>
          )}
        </View>
        {index < 3 && <Text style={[styles.rankLabel, { color: medalColors[index] }]}>{["1st", "2nd", "3rd"][index]}</Text>}
      </View>

      <View style={[styles.avatarContainer, { borderColor: index < 3 ? medalColors[index] : "#4ECDC4" }]}>
        {item.profilePic ? (
          <Image
            source={{ uri: item.profilePic.startsWith('http') ? item.profilePic : `${API_BASE_URL}/${item.profilePic}` }}
            style={styles.avatar}
            onError={(e) => console.log("Leaderboard image error", e.nativeEvent.error)}
          />
        ) : (
          <View style={styles.avatarFallback}>
            <Ionicons name="person" size={24} color="#4ECDC4" />
          </View>
        )}
      </View>

      <View style={{ flex: 1 }}>
        <Text style={[styles.userName, { fontSize: isTablet ? 20 : 16 }]}>{item.fullNames}</Text>
        <Text style={[styles.userPoints, { fontSize: isTablet ? 15 : 12 }]}>{item.points} pts</Text>
      </View>
    </LinearGradient>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#f8fffe" }}>
      {/* Top bar */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={styles.headerTitle}>🏆 Leaderboard</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#00C896" />
          <Text style={styles.infoText}>Loading leaderboard...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle" size={60} color="#ff6b6b" />
          <Text style={styles.errorTitle}>Error Loading Leaderboard</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : !allUsers || allUsers.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="trophy-outline" size={60} color="#ccc" />
          <Text style={styles.emptyTitle}>No Users Yet</Text>
          <Text style={styles.infoText}>Be the first to start recycling and earn points!</Text>
        </View>
      ) : (
        <FlatList
          data={allUsers}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={[styles.scrollContent, { paddingHorizontal: isTablet ? 60 : 12 }]}
          windowSize={10}
          removeClippedSubviews={true}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 44,
    paddingBottom: 16,
    backgroundColor: "#1B5E20",
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  backButton: {
    padding: 6,
    marginRight: 10,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  infoText: {
    marginTop: 10,
    color: '#666',
  },
  errorTitle: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  errorText: {
    marginTop: 5,
    color: '#666',
    textAlign: 'center',
  },
  emptyTitle: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  rankCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    padding: 12,
    marginBottom: 14,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    backgroundColor: "#fff",
  },
  rankBadge: {
    alignItems: "center",
    marginRight: 16,
    width: 40,
  },
  badgeCircle: {
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  rankText: {
    color: "#888",
    fontWeight: "bold",
    fontSize: 16,
  },
  rankLabel: {
    fontWeight: "bold",
    fontSize: 12,
  },
  avatarContainer: {
    width: 54,
    height: 54,
    borderRadius: 27,
    marginRight: 16,
    borderWidth: 2,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
  },
  userName: {
    fontWeight: "bold",
    color: "#1B5E20",
  },
  userPoints: {
    color: "#888",
    marginTop: 2,
  },
});
