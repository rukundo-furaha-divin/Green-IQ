import React, { useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, Animated, Dimensions, StatusBar, TouchableOpacity } from 'react-native';

const { width, height } = Dimensions.get('window');

const WelcomeScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.spring(slideUpAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideUpAnim }],
          },
        ]}
      >
        {/* Illustration at top with curved bottom */}
        <View style={styles.illustrationWrapper}>
          <View style={styles.illustrationContainer}>
            <Image
              source={require('../assets/Welcome-Screen.png')}
              style={styles.illustration}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* Logo overlapping the illustration */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Image
              source={require('../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* App Name */}
        <Text style={styles.appName}>Green IQ</Text>

        {/* Tagline */}
        <Text style={styles.tagline}>Small actions today. A greener tomorrow.</Text>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          {/* Login Button - Green */}
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.8}
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>

          {/* Sign Up Button - White with green border */}
          <TouchableOpacity
            style={styles.signupButton}
            onPress={() => navigation.navigate('Register')}
            activeOpacity={0.8}
          >
            <Text style={styles.signupButtonText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  illustrationWrapper: {
    width: '100%',
    alignItems: 'center',
    marginTop: 40,
  },
  illustrationContainer: {
    width: width * 0.85,
    height: width * 0.85,
    borderRadius: (width * 0.85) / 2,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
  },
  illustration: {
    width: '100%',
    height: '100%',
  },
  logoContainer: {
    marginTop: -50,
    marginBottom: 20,
    zIndex: 10,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  logo: {
    width: 90,
    height: 90,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#2C2C2C',
    letterSpacing: 0.5,
    marginBottom: 8,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 13,
    fontWeight: '400',
    color: '#9E9E9E',
    textAlign: 'center',
    paddingHorizontal: 30,
    lineHeight: 20,
    marginBottom: 30,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 10,
    marginTop: 'auto',
    marginBottom: 40,
  },
  loginButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  signupButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  signupButtonText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export default WelcomeScreen;