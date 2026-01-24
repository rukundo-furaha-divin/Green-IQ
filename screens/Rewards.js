import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import { API_BASE_URL } from '../utils/apiConfig';
import Toast from "react-native-toast-message";

export default function Rewards({ navigation }) {
  const [selectedReward, setSelectedReward] = useState(null);
  const [rewards, setRewards] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getUserinfo = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/userInfo`);
        setUser(response.data);
      } catch (error) {
        Toast.show({
          type: "error",
          text1: "You must login first",
          text2: "Please login or create account first",
        });
        navigation.navigate("Login");
      }
    };
    getUserinfo();
  }, [navigation]);

  useEffect(() => {
    const getRewards = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log(`Fetching rewards from: ${API_BASE_URL}/getRewards`);
        const response = await axios.get(`${API_BASE_URL}/getRewards`, { timeout: 10000 });
        console.log('Rewards raw response:', response.data);

        if (response.data.message && Array.isArray(response.data.message)) {
          console.log(`Found ${response.data.message.length} rewards in .message`);
          setRewards(response.data.message);
        } else if (Array.isArray(response.data)) {
          console.log(`Found ${response.data.length} rewards in root`);
          setRewards(response.data);
        } else {
          console.log('No rewards found in response');
          setRewards([]);
        }
      } catch (error) {
        console.error('Error fetching rewards:', error);
        setError(error?.response?.data?.message || 'Failed to load rewards');
      } finally {
        setLoading(false);
      }
    };

    getRewards();
  }, []);

  const handleRedeem = async (reward) => {
    if (!user || user.points < reward.rewardCostPoints) {
      Toast.show({
        type: "error",
        text1: "Insufficient Points",
        text2: `You need ${reward.rewardCostPoints - (user?.points || 0)} more points to claim this reward.`,
      });
      return;
    }

    try {
      setIsSubmitting(true);
      console.log(`Attempting reward redemption: ${reward.rewardName} (${reward._id})`);
      console.log(`URL: ${API_BASE_URL}/buyReward`);
      const response = await axios.post(`${API_BASE_URL}/buyReward`, {
        rewardId: reward._id,
      }, { timeout: 60000 });
      console.log('Redemption response:', response.data);

      if (response.status === 200 || response.status === 201) {
        // Update local user points
        if (user) {
          setUser({
            ...user,
            points: user.points - reward.rewardCostPoints
          });
        }

        setSelectedReward(null);

        Toast.show({
          type: "success",
          text1: "Reward Claimed!",
          text2: response.data.message || "Check your email for instructions.",
          position: "bottom",
        });
      }
    } catch (error) {
      console.log('Detailed redemption error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        code: error.code
      });
      console.error("Redemption error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openRewardDetail = (reward) => {
    setSelectedReward(reward);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f8fffe" }}>
      {/* Top bar with back arrow */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={styles.headerTitle}>EcoPoints Rewards</Text>
        </View>
      </View>

      {/* User Points */}
      <View style={{ alignItems: "center", marginBottom: 18 }}>
        <LinearGradient colors={["#e0f7fa", "#fff"]} style={styles.pointsCard}>
          <Ionicons name="leaf" size={28} color="#00C896" style={{ marginRight: 10 }} />
          <Text style={{ color: "#00C896", fontWeight: "bold", fontSize: 18 }}>Your Eco Points</Text>
          <Text style={styles.userPoints}>{user ? user.points : '...'}</Text>
        </LinearGradient>
      </View>

      {/* Rewards List */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#00C896" />
            <Text style={styles.infoText}>Loading rewards...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <Ionicons name="alert-circle" size={60} color="#ff6b6b" />
            <Text style={styles.errorTitle}>Error Loading Rewards</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                setLoading(true);
                setError(null);
                // Simple re-fetch logic
                axios.get(`${API_BASE_URL}/getRewards`, { timeout: 10000 })
                  .then(res => setRewards(res.data.message || res.data))
                  .catch(err => setError(err?.response?.data?.message || 'Failed'))
                  .finally(() => setLoading(false));
              }}
            >
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : rewards.length === 0 ? (
          <View style={styles.centerContainer}>
            <Ionicons name="gift-outline" size={80} color="#E0E0E0" />
            <Text style={styles.emptyTitleText}>No Rewards Found</Text>
            <Text style={styles.infoText}>We couldn't find any rewards in our catalog right now. Please check back later!</Text>
          </View>
        ) : (
          rewards.map((reward) => (
            <TouchableOpacity
              key={reward._id}
              style={styles.rewardListItem}
              onPress={() => openRewardDetail(reward)}
            >
              <View style={styles.iconContainer}>
                {reward.rewardImage ? (
                  <Image
                    source={{ uri: reward.rewardImage.startsWith('http') ? reward.rewardImage : `${API_BASE_URL}/${reward.rewardImage}` }}
                    style={styles.rewardIcon}
                    resizeMode="cover"
                  />
                ) : (
                  <Ionicons name="gift" size={24} color="#fff" />
                )}
              </View>
              <View style={styles.rewardDetails}>
                <Text style={styles.rewardNameText}>{reward.rewardName}</Text>
                <Text style={styles.rewardDescText} numberOfLines={2}>
                  {reward.rewardDescription}
                </Text>
              </View>
              <View style={styles.costBadge}>
                <Text style={styles.costText}>{reward.rewardCostPoints} pts</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Reward Detail Modal */}
      <Modal
        visible={!!selectedReward}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedReward(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedReward(null)}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>

            {selectedReward && (
              <>
                <View style={styles.modalImageContainer}>
                  {selectedReward.rewardImage ? (
                    <Image
                      source={{ uri: selectedReward.rewardImage.startsWith('http') ? selectedReward.rewardImage : `${API_BASE_URL}/${selectedReward.rewardImage}` }}
                      style={styles.modalImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.modalIconPlaceholder}>
                      <Ionicons name="gift" size={60} color="#fff" />
                    </View>
                  )}
                </View>

                <View style={styles.modalInfo}>
                  <Text style={styles.modalTitle}>{selectedReward.rewardName}</Text>
                  <View style={styles.modalBadgeContainer}>
                    <View style={styles.modalCategoryBadge}>
                      <Text style={styles.modalCategoryText}>{selectedReward.rewardCategory}</Text>
                    </View>
                    <View style={styles.modalPointsBadge}>
                      <Text style={styles.modalPointsText}>{selectedReward.rewardCostPoints} Points</Text>
                    </View>
                  </View>

                  <Text style={styles.modalDescriptionTitle}>About this reward</Text>
                  <Text style={styles.modalDescription}>{selectedReward.rewardDescription}</Text>

                  <View style={styles.pointsStatus}>
                    <Text style={styles.currentPointsLabel}>Your Balance:</Text>
                    <Text style={[styles.currentPointsValue, (user?.points || 0) < selectedReward.rewardCostPoints && { color: '#ff6b6b' }]}>
                      {user?.points || 0} pts
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[
                    styles.claimButton,
                    ((user?.points || 0) < selectedReward.rewardCostPoints || isSubmitting) && styles.disabledButton
                  ]}
                  onPress={() => handleRedeem(selectedReward)}
                  disabled={isSubmitting || (user?.points || 0) < selectedReward.rewardCostPoints}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.claimButtonText}>
                      {(user?.points || 0) < selectedReward.rewardCostPoints ? 'Insufficient Points' : 'Claim Reward'}
                    </Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 44,
    paddingBottom: 16,
    backgroundColor: "#00C896",
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
  pointsCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e0f7fa",
    borderRadius: 18,
    padding: 16,
    marginTop: 10,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#00C896",
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  userPoints: {
    color: "#1B5E20",
    fontWeight: "bold",
    fontSize: 28,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 40,
  },
  centerContainer: {
    alignItems: 'center',
    marginTop: 40,
    paddingHorizontal: 20,
  },
  infoText: {
    marginTop: 10,
    color: '#666',
    textAlign: 'center',
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
  retryButton: {
    marginTop: 20,
    backgroundColor: '#00C896',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyTitle: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  categoryHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1B5E20",
    marginBottom: 12,
    marginTop: 10,
    marginLeft: 4,
  },
  rewardListItem: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#00C896",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  rewardIcon: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  rewardDetails: {
    flex: 1,
    marginLeft: 15,
  },
  rewardNameText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },
  rewardDescText: {
    fontSize: 12,
    color: "#777",
    marginTop: 2,
  },
  costBadge: {
    backgroundColor: "#E8F5E9",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginLeft: 10,
  },
  costText: {
    color: "#00C896",
    fontWeight: "bold",
    fontSize: 13,
  },
  loader: {
    marginTop: 100,
  },
  emptyContainer: {
    marginTop: 100,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    width: '100%',
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    position: 'relative',
    elevation: 20,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 15,
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    top: 20,
    zIndex: 10,
    padding: 5,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
  },
  modalImageContainer: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#E8F5E9',
    marginBottom: 20,
    marginTop: 10,
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  modalIconPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#00C896',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalInfo: {
    width: '100%',
    marginBottom: 25,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  modalBadgeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
  },
  modalCategoryBadge: {
    backgroundColor: '#E3F2FD',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  modalCategoryText: {
    color: '#2196F3',
    fontSize: 12,
    fontWeight: '600',
  },
  modalPointsBadge: {
    backgroundColor: '#FFF3E0',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  modalPointsText: {
    color: '#FF9800',
    fontSize: 12,
    fontWeight: '600',
  },
  modalDescriptionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1B5E20',
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 14,
    lineHeight: 22,
    color: '#666',
    marginBottom: 20,
  },
  pointsStatus: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 12,
  },
  currentPointsLabel: {
    fontSize: 14,
    color: '#888',
    marginRight: 8,
  },
  currentPointsValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00C896',
  },
  claimButton: {
    backgroundColor: '#00C896',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 3,
  },
  claimButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#ccc',
    elevation: 0,
  },
});
