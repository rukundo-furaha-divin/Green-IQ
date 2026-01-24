import React, { useState, useContext } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { UserContext } from '../context/UserContext';

const { width, height } = Dimensions.get('window');

import { API_BASE_URL } from '../utils/apiConfig';

const LoginScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { setUser, setUserType } = useContext(UserContext);

  const handleSignIn = async () => {
    if (!email || !password) {
      Toast.show({
        type: 'error',
        text1: 'Incomplete Fields',
        text2: 'Please enter both email and password.',
        position: 'top',
      });
      return;
    }
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/Login`, {
        email,
        password
      });
      const token = response.data.token;
      await AsyncStorage.setItem('token', token);

      const userData = response.data.user || response.data;
      const userRole = userData.userRole || userData.role || userData.userType || 'citizen';

      setUser(userData);
      setUserType(userRole);

      Toast.show({
        type: 'success',
        text1: 'Welcome Back!',
        text2: 'Login successful',
        position: 'top',
      });

      if (userRole === "company" || userRole === "Company") {
        setTimeout(() => {
          navigation.navigate('CompanyHome');
        }, 100);
      } else {
        setTimeout(() => {
          navigation.navigate('Home');
        }, 100);
      }
    } catch (error) {
      console.log('Login error:', error);
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: error?.response?.data?.message || 'Invalid credentials',
        position: 'top',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollViewContent,
            { paddingBottom: insets.bottom + 50 } // Added Safe Area padding
          ]}
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          {/* Top Illustration - Increased Size */}
          <View style={styles.imageContainer}>
            <Image
              source={require('../assets/login-image.png')}
              style={styles.heroImage}
              resizeMode="contain"
            />
          </View>

          {/* Header */}
          <View style={styles.headerContainer}>
            <Text style={styles.titleText}>Login</Text>
            <Text style={styles.subtitleText}>Please Sign in to continue.</Text>
          </View>

          {/* Form Inputs */}
          <View style={styles.formContainer}>
            {/* Email Input */}
            <View style={styles.inputWrapper}>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color="#666"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputWrapper}>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#666"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#999"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#999"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password Link */}
            <View style={styles.forgotPasswordContainer}>
              {/* Optional link */}
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleSignIn}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <Text style={styles.loginButtonText}>
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Text>
            </TouchableOpacity>

            {/* Sign Up Link */}
            <View style={styles.signUpContainer}>
              <Text style={styles.signUpText}>Don't have account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.signUpLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingHorizontal: 30,
    paddingTop: 10,
    // paddingBottom is set dynamically
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  heroImage: {
    width: width * 0.9,
    height: height / 1.9, // Increased size
  },
  headerContainer: {
    marginBottom: 30,
  },
  titleText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  formContainer: {
    width: '100%',
  },
  inputWrapper: {
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F8F9',
    borderRadius: 30,
    paddingHorizontal: 20,
    height: 55,
  },
  inputIcon: {
    marginRight: 15,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  eyeButton: {
    padding: 5,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 30,
  },
  loginButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 30,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  signUpText: {
    fontSize: 14,
    color: '#999',
  },
  signUpLink: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
});

export default LoginScreen;