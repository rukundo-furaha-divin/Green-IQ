import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const ScanChoiceScreen = ({ navigation }) => {
  const window = useWindowDimensions();
  const isTablet = window.width >= 700;
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim1 = useRef(new Animated.Value(50)).current;
  const slideAnim2 = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim1, {
        toValue: 0,
        friction: 6,
        tension: 80,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim2, {
        toValue: 0,
        friction: 6,
        tension: 80,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const options = [
    {
      title: 'Scan Waste',
      description: 'Identify waste type & get recycling instructions.',
      icon: 'leaf-outline',
      nav: 'Scan',
      gradient: ['#00C896', '#00A578'],
      anim: slideAnim1,
    },
    {
      title: 'Scan Product',
      description: 'Scan a barcode to learn about its packaging.',
      icon: 'barcode-outline',
      nav: 'ProductScan',
      gradient: ['#FF6B35', '#F7931E'],
      anim: slideAnim2,
    },
  ];

  return (
    <LinearGradient colors={['#f8fffe', '#e0f2f1']} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="dark-content" />
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#1B5E20" />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, isTablet && styles.headerTitleTablet]}>Choose Scan Type</Text>
        </View>

        <View style={[styles.content, isTablet && styles.contentTablet]}>
          <Animated.Text style={[styles.title, isTablet && styles.titleTablet, { opacity: fadeAnim }]}>
            What would you like to scan?
          </Animated.Text>
          <Animated.Text style={[styles.subtitle, isTablet && styles.subtitleTablet, { opacity: fadeAnim }]}>
            Select an option below to get started on your eco-journey.
          </Animated.Text>

          {options.map((option, index) => (
            <Animated.View
              key={index}
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: option.anim }],
                width: '100%',
              }}
            >
              <TouchableOpacity
                style={[styles.optionCard, isTablet && styles.optionCardTablet]}
                onPress={() => navigation.navigate(option.nav)}
                activeOpacity={0.85}
              >
                <LinearGradient colors={option.gradient} style={styles.cardGradient}>
                  <View style={styles.cardTopRow}>
                    <View style={styles.cardIconContainer}>
                      <Ionicons name={option.icon} size={isTablet ? 32 : 28} color="#fff" />
                    </View>
                    <Text style={[styles.cardTitle, isTablet && styles.cardTitleTablet]}>{option.title}</Text>
                    <Ionicons name="chevron-forward" size={isTablet ? 28 : 24} color="rgba(255, 255, 255, 0.7)" />
                  </View>
                  <Text style={[styles.cardDescription, isTablet && styles.cardDescriptionTablet]}>
                    {option.description}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1B5E20',
    textAlign: 'center',
    flex: 1,
    marginRight: 40, // Balance the back button
  },
  headerTitleTablet: {
    fontSize: 28,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 50,
  },
  contentTablet: {
    paddingHorizontal: '15%',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1B5E20',
    textAlign: 'center',
    marginBottom: 12,
  },
  titleTablet: {
    fontSize: 40,
  },
  subtitle: {
    fontSize: 16,
    color: '#2E7D32',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  subtitleTablet: {
    fontSize: 20,
    marginBottom: 60,
  },
  optionCard: {
    borderRadius: 24,
    marginBottom: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  optionCardTablet: {
    maxWidth: 500,
  },
  cardGradient: {
    padding: 20,
    borderRadius: 24,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginRight: 16,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  cardTitleTablet: {
    fontSize: 24,
  },
  cardDescription: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 22,
    paddingLeft: 72, // Aligns with title text (Icon width + margin)
  },
  cardDescriptionTablet: {
    fontSize: 16,
  },
});

export default ScanChoiceScreen; 