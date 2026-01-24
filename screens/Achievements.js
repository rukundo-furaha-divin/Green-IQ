import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const badges = [
  {
    id: 1,
    name: 'Starter',
    icon: 'star',
    earned: true,
    color: '#FFD700',
    progress: 1,
    hint: 'Sign up and recycle your first item.'
  },
  {
    id: 2,
    name: 'Recycler',
    icon: 'leaf',
    earned: true,
    color: '#00C896',
    progress: 1,
    hint: 'Recycle 10 items to earn this badge.'
  },
  {
    id: 3,
    name: 'Eco Hero',
    icon: 'trophy',
    earned: false,
    color: '#FF6B35',
    progress: 0.45,
    hint: 'Earn 500 eco points to unlock.'
  },
  {
    id: 4,
    name: 'Streak',
    icon: 'flame',
    earned: false,
    color: '#FF5722',
    progress: 0.3,
    hint: 'Recycle every day for 7 days in a row.'
  },
];

export default function Achievements({ navigation }) {
  const { width } = useWindowDimensions();
  const isSmall = width < 400;
  const isTablet = width > 700;

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fffe' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: isSmall ? 32 : 44, paddingBottom: isSmall ? 10 : 16, backgroundColor: '#1B5E20', paddingHorizontal: 10, marginBottom: 10 }}>
        <TouchableOpacity onPress={() => navigation && navigation.goBack && navigation.goBack()} style={{ padding: 6, marginRight: 10 }}>
          <Ionicons name="arrow-back" size={isSmall ? 22 : 28} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ color: '#fff', fontSize: isSmall ? 18 : 24, fontWeight: 'bold', letterSpacing: 1 }}>🏅 Achievements</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: isTablet ? 60 : 10, paddingBottom: 40 }}>
        {badges.map((badge, idx) => (
          <LinearGradient
            key={badge.id}
            colors={badge.earned ? [badge.color + '55', '#fff'] : ['#f0f0f0', '#fff']}
            style={{
              borderRadius: 22,
              marginBottom: isTablet ? 38 : isSmall ? 18 : 28,
              padding: isTablet ? 28 : isSmall ? 10 : 18,
              flexDirection: 'row',
              alignItems: 'center',
              elevation: 4,
              shadowColor: badge.color,
              shadowOpacity: 0.10,
              shadowRadius: 8,
              backgroundColor: '#fff',
              width: '100%',
              minWidth: 0,
            }}
          >
            <View style={{ alignItems: 'center', marginRight: isTablet ? 32 : isSmall ? 8 : 18, width: isTablet ? 56 : isSmall ? 28 : 36 }}>
              <View style={{ backgroundColor: badge.earned ? badge.color : '#bbb', borderRadius: 12, width: isTablet ? 38 : isSmall ? 18 : 28, height: isTablet ? 38 : isSmall ? 18 : 28, justifyContent: 'center', alignItems: 'center', marginBottom: 6 }}>
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: isTablet ? 22 : isSmall ? 12 : 16 }}>{idx + 1}</Text>
              </View>
              <Ionicons name={badge.icon} size={isTablet ? 48 : isSmall ? 22 : 36} color={badge.earned ? badge.color : '#bbb'} style={{ marginBottom: 2 }} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: isTablet ? 24 : isSmall ? 13 : 18, fontWeight: 'bold', color: badge.earned ? badge.color : '#bbb', marginBottom: 2 }}>{badge.name}</Text>
              <Text style={{ fontSize: isTablet ? 16 : isSmall ? 10 : 13, color: badge.earned ? '#1B5E20' : '#bbb', fontWeight: 'bold', marginBottom: 6 }}>{badge.earned ? 'Earned' : 'Locked'}</Text>
              {!badge.earned && (
                <View style={{ width: '100%', height: isTablet ? 18 : isSmall ? 8 : 14, backgroundColor: '#eee', borderRadius: 8, marginBottom: 6, overflow: 'hidden' }}>
                  <LinearGradient
                    colors={[badge.color, '#e0e0e0']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ width: `${Math.round(badge.progress * 100)}%`, height: '100%' }}
                  />
                </View>
              )}
              <Text style={{ fontSize: isTablet ? 16 : isSmall ? 9 : 13, color: '#888', marginTop: 2, textAlign: 'left', minHeight: 24 }}>{badge.hint}</Text>
            </View>
          </LinearGradient>
        ))}
      </ScrollView>
    </View>
  );
} 