import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ChatInfoScreen = ({ route, navigation }) => {
  const { user, collectionPoint } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Info</Text>
      </View>
      <View style={styles.profileContainer}>
        <Image source={{ uri: user.avatar }} style={styles.avatar} />
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userRole}>{user.role}</Text>
      </View>
      <View style={styles.detailsContainer}>
        <View style={styles.infoRow}>
          <Ionicons name="location-sharp" size={24} color="#2d6a4f" />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoLabel}>Collection Point</Text>
            <Text style={styles.infoValue}>{collectionPoint.name}</Text>
          </View>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="call" size={24} color="#2d6a4f" />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoLabel}>Contact</Text>
            <Text style={styles.infoValue}>{collectionPoint.contact}</Text>
          </View>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="time" size={24} color="#2d6a4f" />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoLabel}>Hours</Text>
            <Text style={styles.infoValue}>{collectionPoint.hours}</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  profileContainer: {
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
  },
  userRole: {
    fontSize: 16,
    color: '#6c757d',
    marginTop: 4,
  },
  detailsContainer: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  infoTextContainer: {
    marginLeft: 16,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6c757d',
  },
  infoValue: {
    fontSize: 16,
    marginTop: 2,
  },
});

export default ChatInfoScreen; 