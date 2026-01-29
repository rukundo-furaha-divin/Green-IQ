import React, { useContext, useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from '../utils/apiConfig';
import Toast from "react-native-toast-message";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Alert,
  Switch,
  Modal,
} from "react-native";
import { useSettings } from "../context/SettingsContext"; // Settings Context
import { useTranslation } from "react-i18next"; // i18n

import { Ionicons } from "@expo/vector-icons";
import { UserContext } from "../context/UserContext";
import { LinearGradient } from "expo-linear-gradient";

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const {
    language, changeLanguage,
    highContrast, toggleHighContrast,
    fontScale, updateFontScale,
    voiceEnabled, toggleVoiceFeedback
  } = useSettings();
  const { t } = useTranslation();
  const [showLangModal, setShowLangModal] = useState(false);

  useEffect(() => {
    const getUserinfoProfile = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/userInfo`
        );
        setUser(response.data);
      } catch (error) {
        setTimeout(() => {
          Alert.alert(error?.response?.data?.message || "An error occured");
        }, 100);
        navigation.navigate("Login");
      }
    };
    getUserinfoProfile();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/logout`
      );
      setTimeout(() => {
        Alert.alert("Logged out");
      }, 100);
      navigation.navigate("Login");
    } catch (error) {
      Alert.alert("Error occured logging out");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.profileHeader}>
          {user ? (
            <Image
              source={{
                uri: user.profilePic.startsWith('http') ? user.profilePic : `${API_BASE_URL}/${user.profilePic}`,
              }}
              style={styles.avatar}
            />
          ) : (
            <View>
              <Text>Loading...</Text>
            </View>
          )}
          <Text style={styles.userName}>
            {user ? user.fullNames : "Loading..."}
          </Text>
          <Text style={styles.userHandle}>
            {user ? user.email : "Loading..."}
          </Text>
          {/* Eco Points Card */}
          <LinearGradient
            colors={["#e0f7fa", "#fff"]}
            style={styles.ecoPointsCard}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons
                name="leaf"
                size={28}
                color="#00C896"
                style={{ marginRight: 10 }}
              />
              <View>
                <Text
                  style={{ color: "#00C896", fontWeight: "bold", fontSize: 18 }}
                >
                  {t('profile.ecoPoints')}
                </Text>
                <Text
                  style={{ color: "#1B5E20", fontWeight: "bold", fontSize: 28 }}
                >
                  {user ? user.points : "Loading..."}
                </Text>
              </View>
            </View>
            {/* Progress bar to next badge */}
            {/* <View style={{ marginTop: 12 }}>
              <Text style={{ color: "#888", fontSize: 13, marginBottom: 2 }}>
                Progress to next badge
              </Text>
              <View
                style={{
                  height: 12,
                  backgroundColor: "#e0e0e0",
                  borderRadius: 8,
                  overflow: "hidden",
                }}
              >
                <LinearGradient
                  colors={["#00C896", "#00A578"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    width: `${
                      user && user.ecoPoints
                        ? Math.min(user.ecoPoints / 5, 100)
                        : 10
                    }%`,
                    height: 12,
                  }}
                />
              </View>
              <Text style={{ color: "#1B5E20", fontSize: 12, marginTop: 2 }}>
                Earn 5 more points for your next badge!
              </Text>
            </View> */}
            {/* Interactive buttons */}
            {/* <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: 16,
              }}
            >
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate("Achievements")}
              >
                <Ionicons name="medal-outline" size={20} color="#00C896" />
                <Text style={styles.actionButtonText}>Achievements</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate("EcoPointsDetails")}
              >
                <Ionicons name="analytics-outline" size={20} color="#00C896" />
                <Text style={styles.actionButtonText}>Eco Points</Text>
              </TouchableOpacity>
            </View> */}
          </LinearGradient>
        </View>

        {/* Settings Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>{t('settings.title')}</Text>

          {/* Language Setting */}
          <TouchableOpacity style={styles.settingItem} onPress={() => setShowLangModal(true)}>
            <View style={styles.settingLabelRow}>
              <Ionicons name="globe-outline" size={24} color="#1b4332" />
              <Text style={styles.settingText}>{t('settings.language')}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ marginRight: 10, color: 'gray' }}>{language === 'en' ? 'English' : language === 'sw' ? 'Kiswahili' : 'Français'}</Text>
              <Ionicons name="chevron-forward" size={20} color="gray" />
            </View>
          </TouchableOpacity>

          {/* Accessibility Settings */}
          <View style={styles.settingItem}>
            <View style={styles.settingLabelRow}>
              <Ionicons name="contrast-outline" size={24} color="#1b4332" />
              <Text style={styles.settingText}>{t('settings.highContrast')}</Text>
            </View>
            <Switch
              value={highContrast}
              onValueChange={toggleHighContrast}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={highContrast ? "#00C896" : "#f4f3f4"}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLabelRow}>
              <Ionicons name="text-outline" size={24} color="#1b4332" />
              <Text style={styles.settingText}>{t('settings.fontScale')}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity onPress={() => updateFontScale(1.0)} style={[styles.fontBtn, fontScale === 1.0 && styles.fontBtnActive]}>
                <Text style={{ fontSize: 14 }}>A</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => updateFontScale(1.2)} style={[styles.fontBtn, fontScale === 1.2 && styles.fontBtnActive]}>
                <Text style={{ fontSize: 18 }}>A</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => updateFontScale(1.4)} style={[styles.fontBtn, fontScale === 1.4 && styles.fontBtnActive]}>
                <Text style={{ fontSize: 22 }}>A</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLabelRow}>
              <Ionicons name="mic-outline" size={24} color="#1b4332" />
              <Text style={styles.settingText}>{t('settings.voiceFeedback')}</Text>
            </View>
            <Switch
              value={voiceEnabled}
              onValueChange={toggleVoiceFeedback}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={voiceEnabled ? "#00C896" : "#f4f3f4"}
            />
          </View>
        </View>

        <View style={styles.menuContainer}>

          {/* <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="person-outline" size={24} color="#1b4332" />
            <Text style={styles.menuItemText}>Edit Profile</Text>
          </TouchableOpacity> */}
          {/* <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="settings-outline" size={24} color="#1b4332" />
            <Text style={styles.menuItemText}>Settings</Text>
          </TouchableOpacity> */}
          {/* <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="notifications-outline" size={24} color="#1b4332" />
            <Text style={styles.menuItemText}>Notifications</Text>
          </TouchableOpacity> */}
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="help-circle-outline" size={24} color="#1b4332" />
            <Text style={styles.menuItemText}>{t('profile.helpCenter')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("Referral")}
          >
            <Ionicons name="people-outline" size={24} color="#1b4332" />
            <Text style={styles.menuItemText}>{t('profile.inviteFriends')}</Text>
          </TouchableOpacity>
          <Pressable style={[styles.menuItem, styles.logoutButton]} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#d9534f" />
            <Text style={[styles.menuItemText, { color: "#d9534f" }]}>
              {t('profile.logout')}
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Language Modal */}
      <Modal
        visible={showLangModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowLangModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('settings.selectLanguage')}</Text>
            {['en', 'sw', 'fr'].map(lang => (
              <TouchableOpacity
                key={lang}
                style={styles.langOption}
                onPress={() => {
                  changeLanguage(lang);
                  setShowLangModal(false);
                }}
              >
                <Text style={[styles.langText, language === lang && { color: '#00C896', fontWeight: 'bold' }]}>
                  {lang === 'en' ? 'English' : lang === 'sw' ? 'Kiswahili' : 'Français'}
                </Text>
                {language === lang && <Ionicons name="checkmark" size={24} color="#00C896" />}
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.closeBtn} onPress={() => setShowLangModal(false)}>
              <Text style={{ color: 'red' }}>{t('common.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f7f5",
  },
  profileHeader: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: "center",
  },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1b4332",
    marginTop: 15,
  },
  userHandle: {
    fontSize: 16,
    color: "gray",
    marginTop: 5,
  },
  menuContainer: {
    marginTop: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  menuItemText: {
    marginLeft: 20,
    fontSize: 18,
    color: "#1b4332",
  },
  logoutButton: {
    borderBottomWidth: 0,
    marginTop: 20,
  },
  ecoPointsCard: {
    marginTop: 18,
    width: "90%",
    alignSelf: "center",
    borderRadius: 18,
    padding: 18,
    elevation: 3,
    shadowColor: "#00C896",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    marginBottom: 10,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e0f7fa",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    elevation: 1,
  },
  actionButtonText: {
    color: "#00C896",
    fontWeight: "bold",
    marginLeft: 6,
    fontSize: 15,
  },
  sectionContainer: {
    marginTop: 20,
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  sectionTitle: {
    paddingHorizontal: 20,
    marginBottom: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#888',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    marginLeft: 15,
    color: '#333',
  },
  fontBtn: {
    marginHorizontal: 5,
    padding: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    minWidth: 30,
    alignItems: 'center',
  },
  fontBtnActive: {
    backgroundColor: '#e0f7fa',
    borderColor: '#00C896',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  langOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  langText: {
    fontSize: 18,
  },
  closeBtn: {
    marginTop: 20,
    alignItems: 'center',
    padding: 10,
  },
});


export default ProfileScreen;
