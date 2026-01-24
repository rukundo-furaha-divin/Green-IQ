import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const RwandaStats = () => {
  const stats = [
    {
      icon: 'shield',
      label: 'Safe Zones',
      value: '8',
      color: '#4CAF50',
      description: 'Active in Kigali'
    },
    {
      icon: 'leaf',
      label: 'Green Infrastructure',
      value: '85%',
      color: '#8BC34A',
      description: 'Coverage rate'
    },
    {
      icon: 'reload',
      label: 'Recycling Centers',
      value: '45',
      color: '#00C896',
      description: 'Across Rwanda'
    },
    {
      icon: 'thermometer',
      label: 'Climate Resilience',
      value: '92%',
      color: '#FF9800',
      description: 'Safety score avg'
    }
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rwanda Climate Action Stats</Text>
      <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <View style={[styles.iconContainer, { backgroundColor: stat.color + '20' }]}>
              <Ionicons name={stat.icon} size={24} color={stat.color} />
            </View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
            <Text style={styles.statDescription}>{stat.description}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    margin: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#f8fffe',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  statDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

export default RwandaStats; 