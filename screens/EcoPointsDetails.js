import React, { useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, useWindowDimensions, Animated } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';

const mockPointsHistory = [
  20, 40, 60, 80, 120, 180, 250, 300, 400, 500, 600, 800, 1000
];

const tips = [
  'Scan and recycle more items to earn points.',
  'Participate in daily and weekly challenges.',
  'Invite friends to join and recycle together.',
  'Redeem points for rewards and keep recycling!',
  'Check the community leaderboard for bonus events.',
  'Recycle rare or high-value items for extra points.',
  'Maintain a daily streak for bonus eco points.',
];

const productTips = [
  {
    product: 'Plastic Bottle',
    icon: 'bottle-soda',
    color: '#00C896',
    tips: [
      'Reuse the bottle before recycling.',
      'Always empty and rinse before recycling.',
      'Check for local recycling codes.'
    ]
  },
  {
    product: 'Electronics',
    icon: 'laptop',
    color: '#FF6B35',
    tips: [
      'Donate or sell working electronics.',
      'Take to certified e-waste centers.',
      'Never throw batteries in the trash.'
    ]
  },
  {
    product: 'Clothing',
    icon: 'tshirt-crew',
    color: '#9C27B0',
    tips: [
      'Donate gently used clothes.',
      'Repurpose old fabric for cleaning.',
      'Choose natural fibers when possible.'
    ]
  },
  {
    product: 'Food Packaging',
    icon: 'food-apple',
    color: '#F7931E',
    tips: [
      'Choose products with minimal packaging.',
      'Compost compostable packaging.',
      'Recycle only clean, dry packaging.'
    ]
  },
];

function ProgressRing({ percent, size = 110, stroke = 10, color = '#00C896', bg = '#e0f7fa', icon, iconColor }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const animated = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animated, {
      toValue: percent,
      duration: 1200,
      useNativeDriver: false,
    }).start();
  }, [percent]);

  const strokeDashoffset = animated.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  const AnimatedCircle = Animated.createAnimatedComponent(Circle);

  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={bg}
          strokeWidth={stroke}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>
      <View style={{ position: 'absolute', top: size / 2 - 22, left: size / 2 - 22 }}>
        <Ionicons name={icon} size={44} color={iconColor || color} />
      </View>
    </View>
  );
}

export default function EcoPointsDetails({ navigation }) {
  const { width } = useWindowDimensions();
  const isSmall = width < 400;
  const isTablet = width > 700;
  const totalPoints = mockPointsHistory[mockPointsHistory.length - 1];
  const maxPoints = Math.max(...mockPointsHistory);

  // Animate bar graph
  const barAnims = mockPointsHistory.map(() => useRef(new Animated.Value(0)).current);
  useEffect(() => {
    barAnims.forEach((anim, idx) => {
      Animated.timing(anim, {
        toValue: ((mockPointsHistory[idx] / maxPoints) * (isTablet ? 140 : 70)) + 10,
        duration: 800 + idx * 60,
        useNativeDriver: false,
      }).start();
    });
  }, [barAnims, isTablet, maxPoints]);

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fffe' }}>
      {/* Top bar with back arrow */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: isSmall ? 32 : 44, paddingBottom: isSmall ? 10 : 16, backgroundColor: '#00C896', paddingHorizontal: 10, marginBottom: 10 }}>
        <TouchableOpacity onPress={() => navigation && navigation.goBack && navigation.goBack()} style={{ padding: 6, marginRight: 10 }}>
          <Ionicons name="arrow-back" size={isSmall ? 22 : 28} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ color: '#fff', fontSize: isSmall ? 18 : 24, fontWeight: 'bold', letterSpacing: 1 }}>Eco Points Details</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: isTablet ? 60 : 16, paddingBottom: 40 }}>
        {/* Total Points with Progress Ring */}
        <View style={{ alignItems: 'center', marginBottom: isTablet ? 36 : 22 }}>
          <View style={{ marginBottom: 8 }}>
            <ProgressRing percent={1} color="#00C896" icon="leaf" iconColor="#1B5E20" />
          </View>
          <Text style={{ fontSize: isTablet ? 32 : 22, fontWeight: 'bold', color: '#00C896', marginBottom: 4 }}>Total Eco Points</Text>
          <Text style={{ fontSize: isTablet ? 48 : 32, fontWeight: 'bold', color: '#1B5E20' }}>{totalPoints}</Text>
        </View>
        {/* Animated Bar Graph */}
        <View style={{ backgroundColor: '#fff', borderRadius: 18, padding: isTablet ? 28 : 14, marginBottom: isTablet ? 36 : 22, elevation: 2, shadowColor: '#00C896', shadowOpacity: 0.08, shadowRadius: 6 }}>
          <Text style={{ fontSize: isTablet ? 20 : 15, fontWeight: 'bold', color: '#00C896', marginBottom: 10 }}>Points Progress</Text>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: isTablet ? 160 : 90, marginBottom: 8 }}>
            {mockPointsHistory.map((points, idx) => (
              <View key={idx} style={{ flex: 1, alignItems: 'center', marginHorizontal: 2 }}>
                <Animated.View style={{ width: isTablet ? 18 : 10, height: barAnims[idx], backgroundColor: '#00C896', borderRadius: 6, marginBottom: 2 }} />
                <Text style={{ fontSize: isTablet ? 13 : 9, color: '#888' }}>{idx + 1}</Text>
              </View>
            ))}
          </View>
          <Text style={{ fontSize: isTablet ? 13 : 10, color: '#888', textAlign: 'center' }}>Each bar shows your points at a different time.</Text>
        </View>
        {/* New Section: Scanning Products for Eco-Friendly Usage */}
        <View style={{ backgroundColor: '#e0f7fa', borderRadius: 18, padding: isTablet ? 28 : 14, marginBottom: 22, elevation: 2, shadowColor: '#00C896', shadowOpacity: 0.08, shadowRadius: 6 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <Ionicons name="barcode-outline" size={isTablet ? 28 : 20} color="#00C896" style={{ marginRight: 10 }} />
            <Text style={{ fontSize: isTablet ? 20 : 15, fontWeight: 'bold', color: '#009688' }}>Scan New Products for Eco Tips</Text>
          </View>
          <Text style={{ fontSize: isTablet ? 15 : 12, color: '#00796B', marginBottom: 10 }}>
            Scanning new products helps you discover how to use, reuse, and dispose of them in ways that protect the environment. Here are some examples:
          </Text>
          {productTips.map((item, idx) => (
            <LinearGradient key={idx} colors={[item.color + '22', '#fff']} style={{ borderRadius: 14, marginBottom: 14, padding: isTablet ? 18 : 10, flexDirection: 'row', alignItems: 'flex-start', elevation: 1 }}>
              <MaterialCommunityIcons name={item.icon} size={isTablet ? 36 : 24} color={item.color} style={{ marginRight: 12, marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: 'bold', color: item.color, fontSize: isTablet ? 16 : 13, marginBottom: 2 }}>{item.product}</Text>
                {item.tips.map((tip, tIdx) => (
                  <View key={tIdx} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 2 }}>
                    <Ionicons name="leaf-outline" size={isSmall ? 13 : 16} color={item.color} style={{ marginRight: 6, marginTop: 2 }} />
                    <Text style={{ fontSize: isTablet ? 14 : 11, color: '#333', flex: 1 }}>{tip}</Text>
                  </View>
                ))}
              </View>
            </LinearGradient>
          ))}
          {/* Call to Action Button */}
          <TouchableOpacity onPress={() => navigation && navigation.navigate && navigation.navigate('Scan')} style={{ marginTop: 10, alignSelf: 'center', backgroundColor: '#00C896', borderRadius: 22, paddingVertical: 10, paddingHorizontal: 32, flexDirection: 'row', alignItems: 'center', elevation: 2 }}>
            <Ionicons name="scan-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>Scan a Product</Text>
          </TouchableOpacity>
        </View>
        {/* Tips for Earning More */}
        <View style={{ backgroundColor: '#fff', borderRadius: 18, padding: isTablet ? 28 : 14, marginBottom: 18, elevation: 2, shadowColor: '#00C896', shadowOpacity: 0.08, shadowRadius: 6 }}>
          <Text style={{ fontSize: isTablet ? 20 : 15, fontWeight: 'bold', color: '#1B5E20', marginBottom: 10 }}>How to Earn More Eco Points</Text>
          {tips.map((tip, idx) => (
            <View key={idx} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 }}>
              <Ionicons name="checkmark-circle" size={isSmall ? 16 : 20} color="#00C896" style={{ marginRight: 8, marginTop: 2 }} />
              <Text style={{ fontSize: isTablet ? 15 : 12, color: '#333', flex: 1 }}>{tip}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
} 