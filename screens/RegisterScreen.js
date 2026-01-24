import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../utils/apiConfig';
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
  useWindowDimensions,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useFocusEffect } from '@react-navigation/native';
import * as Location from 'expo-location';
import CountryPicker from 'react-native-country-picker-modal';
import { parsePhoneNumber } from 'libphonenumber-js/bundle/libphonenumber-max.js';


const { width, height } = Dimensions.get('window');

const RegisterScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  // Initialize state with route params if they exist
  const [userType, setUserType] = useState(route?.params?.userType || 'citizen');
  const [fullName, setFullName] = useState(route?.params?.fullName || '');
  const [companyName, setCompanyName] = useState(route?.params?.companyName || '');
  const [email, setEmail] = useState(route?.params?.email || '');
  const [phoneNumber, setPhoneNumber] = useState(route?.params?.phoneNumber || '');
  const [countryCode, setCountryCode] = useState('RW');
  const [callingCode, setCallingCode] = useState('250');
  const [referralCode, setReferralCode] = useState(route?.params?.referralCode || '');
  const [password, setPassword] = useState(route?.params?.password || '');
  const [confirmPassword, setConfirmPassword] = useState(route?.params?.confirmPassword || '');
  const [location, setLocation] = useState(route?.params?.location || '');
  const [companyLocation, setCompanyLocation] = useState(route?.params?.companyLocation || '');
  const [companyContact, setCompanyContact] = useState(route?.params?.companyContact || '');
  const [wasteTypes, setWasteTypes] = useState(route?.params?.wasteTypes || []);
  const [selectedWasteType, setSelectedWasteType] = useState(route?.params?.selectedWasteType || '');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const window = useWindowDimensions();
  const isTablet = window.width >= 700;
  const isSmallScreen = window.width < 400 || window.height < 700;

  // Handle location selection from LocationSelectionScreen
  useEffect(() => {
    if (route?.params?.selectedLocation) {
      if (userType === 'citizen') {
        setLocation(route.params.selectedLocation);
      } else {
        setCompanyLocation(route.params.selectedLocation);
      }
    }
  }, [route?.params?.selectedLocation, userType]);

  // Handle form state restoration from route params
  useEffect(() => {
    if (route?.params) {
      const params = route.params;
      if (params.userType) setUserType(params.userType);
      if (params.fullName) setFullName(params.fullName);
      if (params.companyName) setCompanyName(params.companyName);
      if (params.email) setEmail(params.email);
      // Phone number handling if returned from stack could be tricky with splitting country code, keeping simple for now
      if (params.phoneNumber) setPhoneNumber(params.phoneNumber);
      if (params.referralCode) setReferralCode(params.referralCode);
      if (params.password) setPassword(params.password);
      if (params.confirmPassword) setConfirmPassword(params.confirmPassword);
      if (params.location) setLocation(params.location);
      if (params.companyLocation) setCompanyLocation(params.companyLocation);
      if (params.companyContact) setCompanyContact(params.companyContact);
      if (params.wasteTypes) setWasteTypes(params.wasteTypes);
      if (params.selectedWasteType) setSelectedWasteType(params.selectedWasteType);
    }
  }, [route?.params]);

  useFocusEffect(
    React.useCallback(() => {
      if (route?.params) {
        // Similar to useEffect, but good for when screen comes back into focus
      }
    }, [route?.params])
  );

  const validatePhoneNumber = (phone, country) => {
    try {
      const parsedNumber = parsePhoneNumber(phone, country);
      if (parsedNumber && parsedNumber.isValid()) {
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  const getCompanyLocationDisplay = () => {
    if (!companyLocation) return 'Select Collection Point Location';
    if (typeof companyLocation === 'string') {
      return companyLocation;
    }
    if (typeof companyLocation === 'object' && companyLocation.name) {
      return `${companyLocation.name} (${companyLocation.coordinates.latitude.toFixed(4)}, ${companyLocation.coordinates.longitude.toFixed(4)})`;
    }
    return 'Select Collection Point Location';
  };

  const getCurrentLocation = async () => {
    try {
      setIsLoadingLocation(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'Please enable location permissions to use this feature.',
          [{ text: 'OK' }]
        );
        setIsLoadingLocation(false);
        return;
      }
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 10000,
      });

      const { latitude, longitude } = location.coords;

      if (userType === 'citizen') {
        setLocation('Current Location');
      } else {
        setCompanyLocation({
          name: 'Current Location',
          district: 'Current Location',
          sector: 'Current Location',
          coordinates: {
            latitude: latitude,
            longitude: longitude
          },
          types: ['Custom Location'],
          hours: '24/7',
          contact: 'N/A',
          capacity: 'Custom',
          status: 'Active',
          description: 'Your current location',
          manager: 'Self'
        });
      }

      Toast.show({
        type: 'success',
        text1: 'Location Set',
        text2: 'Your current location has been set successfully'
      });

    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert(
        'Location Error',
        'Unable to get your current location. Please try again or select a location manually.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const navigateToLocationSelection = () => {
    const currentFormState = {
      userType,
      fullName,
      companyName,
      email,
      phoneNumber,
      referralCode,
      password,
      confirmPassword,
      location,
      companyLocation,
      companyContact,
      wasteTypes,
      selectedWasteType
    };
    navigation.navigate('LocationSelection', currentFormState);
  };

  const onSelectCountry = (country) => {
    setCountryCode(country.cca2);
    setCallingCode(country.callingCode[0]);
  };

  const handleRegister = async () => {
    if (userType === 'citizen') {
      if (!fullName || !email || !phoneNumber || !password || !confirmPassword || !location) {
        Toast.show({ type: 'error', text1: 'Missing Fields', text2: 'Please fill out all fields for citizen registration.' });
        return;
      }
    } else {
      if (!companyName || !email || !phoneNumber || !password || !confirmPassword || !companyLocation || !companyContact || wasteTypes.length === 0) {
        Toast.show({ type: 'error', text1: 'Missing Fields', text2: 'Please fill out all fields for company registration, including waste types.' });
        return;
      }
    }

    if (password !== confirmPassword) {
      Toast.show({ type: 'error', text1: 'Password Mismatch', text2: 'Passwords do not match.' });
      return;
    }

    // Validate phone number using libphonenumber-js
    // Construct the potential full number for validation
    const fullPhoneNumber = `+${callingCode}${phoneNumber}`;

    if (!validatePhoneNumber(fullPhoneNumber, countryCode)) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Phone Number',
        text2: `Please enter a valid phone number for ${countryCode}.`
      });
      return;
    }

    setIsLoading(true);
    try {
      if (userType === "citizen") {
        const response = await axios.post(
          `${API_BASE_URL}/register`,
          {
            email,
            fullNames: fullName,
            password,
            phoneNumber: fullPhoneNumber,
            userType,
            referralUsed: referralCode,
            latitude: (typeof location === 'object' && location.coordinates) ? location.coordinates.latitude : null,
            longitude: (typeof location === 'object' && location.coordinates) ? location.coordinates.longitude : null,
            // Fallback for manual location
            userAddress: typeof location === 'string' ? location : (location.name || location.district || 'Custom Location'),
          },
          {
            timeout: 60000, // 60 second timeout for email sending
          }
        );
        Toast.show({
          type: "success",
          text1: "Account Created!",
          text2: "Please check your email to verify your account",
          visibilityTime: 3000
        });
        // Increased delay to let user see the success message
        setTimeout(() => navigation.navigate("Login"), 2500);
      } else {
        const response = await axios.post(
          `${API_BASE_URL}/registerCompany`,
          {
            companyName,
            email,
            phoneNumber: fullPhoneNumber, // Send the full formatted number
            district: typeof companyLocation === 'object' ? companyLocation.district : '',
            sector: typeof companyLocation === 'object' ? companyLocation.sector : '',
            latitude: typeof companyLocation === 'object' && companyLocation.coordinates ? companyLocation.coordinates.latitude : null,
            longitude: typeof companyLocation === 'object' && companyLocation.coordinates ? companyLocation.coordinates.longitude : null,
            contactPersonalName: companyContact,
            password,
            wasteTypeHandled: wasteTypes,
          },
          {
            timeout: 60000, // 60 second timeout for email sending
          }
        );
        Toast.show({
          type: "success",
          text1: "Account Created!",
          text2: "Please check your email to verify your account",
          visibilityTime: 3000
        });
        // Increased delay to let user see the success message
        setTimeout(() => navigation.navigate("Login"), 2500);
      }
    } catch (error) {
      console.log('Registration error:', error);
      console.log('Error response:', error?.response?.data);

      // Show specific error message from backend
      let errorMessage = 'Registration failed. Please try again.';

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message?.includes('timeout')) {
        errorMessage = 'Request timed out. The server might be slow. Please try again.';
      } else if (error?.message?.includes('Network')) {
        errorMessage = 'Network error. Please check your internet connection.';
      }

      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
        text2: errorMessage,
        visibilityTime: 4000
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
            { paddingBottom: insets.bottom + 50 }
          ]}
          bounces={false}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Illustration - Increased Size */}
          <View style={styles.imageContainer}>
            <Image
              source={require('../assets/register-image.png')}
              style={styles.heroImage}
              resizeMode="contain"
            />
          </View>

          {/* Header */}
          <View style={styles.headerContainer}>
            <Text style={styles.titleText}>Register</Text>
            <Text style={styles.subtitleText}>Please register to login.</Text>
          </View>

          {/* User Type Selection */}
          <View style={styles.userTypeContainer}>
            <TouchableOpacity
              style={[styles.userTypeButton, userType === 'citizen' && styles.userTypeButtonActive]}
              onPress={() => setUserType('citizen')}
            >
              <Ionicons name="person" size={20} color={userType === 'citizen' ? '#fff' : '#4CAF50'} />
              <Text style={[styles.userTypeText, userType === 'citizen' && styles.userTypeTextActive]}>Citizen</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.userTypeButton, userType === 'company' && styles.userTypeButtonActive]}
              onPress={() => setUserType('company')}
            >
              <Ionicons name="business" size={20} color={userType === 'company' ? '#fff' : '#4CAF50'} />
              <Text style={[styles.userTypeText, userType === 'company' && styles.userTypeTextActive]}>Company</Text>
            </TouchableOpacity>
          </View>

          {/* Form Inputs */}
          <View style={styles.formContainer}>

            {/* Name Input - Changed to Fullname */}
            {userType === 'citizen' ? (
              <View style={styles.inputWrapper}>
                <View style={styles.inputContainer}>
                  <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Fullname"
                    placeholderTextColor="#999"
                    value={fullName}
                    onChangeText={setFullName}
                  />
                </View>
              </View>
            ) : (
              <View style={styles.inputWrapper}>
                <View style={styles.inputContainer}>
                  <Ionicons name="business-outline" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Company Name"
                    placeholderTextColor="#999"
                    value={companyName}
                    onChangeText={setCompanyName}
                  />
                </View>
              </View>
            )}

            {/* Email Input */}
            <View style={styles.inputWrapper}>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email Address"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Phone Number with Country Picker */}
            <View style={styles.inputWrapper}>
              <View style={styles.inputContainer}>
                {/* Country Picker Section */}
                <View style={styles.countryPickerContainer}>
                  <CountryPicker
                    withFilter
                    withFlag
                    withCallingCode
                    withEmoji
                    countryCode={countryCode}
                    onSelect={onSelectCountry}
                    theme={{
                      fontSize: 14,
                      onBackgroundTextColor: '#333'
                    }}
                    containerButtonStyle={styles.countryPickerButton}
                  />
                  <Text style={styles.callingCodeText}>+{callingCode}</Text>
                  <View style={styles.separator} />
                </View>

                {/* Phone Input Section */}
                <TextInput
                  style={styles.input}
                  placeholder="Mobile Number"
                  placeholderTextColor="#999"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* Referral Code (Citizen) */}
            {userType === 'citizen' && (
              <View style={styles.inputWrapper}>
                <View style={styles.inputContainer}>
                  <Ionicons name="gift-outline" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Referral Code (Optional)"
                    placeholderTextColor="#999"
                    value={referralCode}
                    onChangeText={setReferralCode}
                    autoCapitalize="characters"
                  />
                </View>
              </View>
            )}

            {/* Location Fields */}
            {userType === 'citizen' ? (
              <View style={styles.inputWrapper}>
                <View style={[styles.inputContainer, styles.locationContainer]}>
                  <Ionicons name="location-outline" size={20} color="#666" style={styles.inputIcon} />
                  <TouchableOpacity onPress={navigateToLocationSelection} style={{ flex: 1 }}>
                    <Text style={[styles.input, !location && styles.placeholderText]}>{location || 'Select Your Location'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={getCurrentLocation} disabled={isLoadingLocation}>
                    {isLoadingLocation ? <ActivityIndicator size="small" color="#4CAF50" /> : <Ionicons name="locate" size={20} color="#4CAF50" />}
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <>
                <View style={styles.inputWrapper}>
                  <View style={[styles.inputContainer, styles.locationContainer]}>
                    <Ionicons name="location-outline" size={20} color="#666" style={styles.inputIcon} />
                    <TouchableOpacity onPress={navigateToLocationSelection} style={{ flex: 1 }}>
                      <Text style={[styles.input, !companyLocation && styles.placeholderText]}>{getCompanyLocationDisplay()}</Text>
                    </TouchableOpacity>

                    {typeof companyLocation === 'object' && companyLocation.coordinates && (
                      <Ionicons name="checkmark-circle" size={16} color="#4CAF50" style={{ marginRight: 8 }} />
                    )}
                    <TouchableOpacity onPress={getCurrentLocation} disabled={isLoadingLocation}>
                      {isLoadingLocation ? <ActivityIndicator size="small" color="#4CAF50" /> : <Ionicons name="locate" size={20} color="#4CAF50" />}
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputWrapper}>
                  <View style={styles.inputContainer}>
                    <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Contact Person Name"
                      placeholderTextColor="#999"
                      value={companyContact}
                      onChangeText={setCompanyContact}
                    />
                  </View>
                </View>

                {/* Waste Types */}
                <View style={styles.wasteTypesContainer}>
                  <Text style={styles.wasteTypesTitle}>Waste Types You Collect:</Text>
                  <View style={styles.wasteTypesGrid}>
                    {['Biodegradable', 'Non biodegradable', 'Recyclable', 'Hazardous', "Organic", "Inorganic"].map((type) => (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.wasteTypeButton,
                          wasteTypes.includes(type) && styles.wasteTypeButtonActive
                        ]}
                        onPress={() => {
                          if (wasteTypes.includes(type)) {
                            setWasteTypes(wasteTypes.filter(t => t !== type));
                          } else {
                            setWasteTypes([...wasteTypes, type]);
                          }
                        }}
                      >
                        <Text style={[
                          styles.wasteTypeText,
                          wasteTypes.includes(type) && styles.wasteTypeTextActive
                        ]}>
                          {type}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </>
            )}

            {/* Password Inputs */}
            <View style={styles.inputWrapper}>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#999" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm Password"
                  placeholderTextColor="#999"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeButton}>
                  <Ionicons name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#999" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Sign Up Button */}
            <TouchableOpacity
              style={styles.registerButton}
              onPress={handleRegister}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <Text style={styles.registerButtonText}>
                {isLoading ? 'Creating Account...' : 'Sign Up'}
              </Text>
            </TouchableOpacity>

            {/* Sign In Link */}
            <View style={styles.signInContainer}>
              <Text style={styles.signInText}>Already have account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.signInLink}>Sign In</Text>
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
    height: height / 2.3,
  },
  headerContainer: {
    marginBottom: 20,
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
  userTypeContainer: {
    flexDirection: 'row',
    marginBottom: 25,
    gap: 15,
  },
  userTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#4CAF50',
    backgroundColor: '#fff',
  },
  userTypeButtonActive: {
    backgroundColor: '#4CAF50',
  },
  userTypeText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  userTypeTextActive: {
    color: '#fff',
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
  locationContainer: {
    justifyContent: 'space-between'
  },
  inputIcon: {
    marginRight: 15,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    textAlign: 'center', // Centered as requested
  },
  placeholderText: {
    color: '#999',
    paddingVertical: 15, // to give it height when text
  },
  eyeButton: {
    padding: 5,
  },
  countryPickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  countryPickerButton: {
    paddingRight: 5,
  },
  callingCodeText: {
    fontSize: 16,
    color: '#333',
    marginRight: 10,
  },
  separator: {
    width: 1,
    height: 24,
    backgroundColor: '#ccc',
    marginRight: 10,
  },
  wasteTypesContainer: {
    marginBottom: 20,
  },
  wasteTypesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 10,
    marginLeft: 4,
  },
  wasteTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  wasteTypeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F7F8F9',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  wasteTypeButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  wasteTypeText: {
    fontSize: 12,
    color: '#666',
  },
  wasteTypeTextActive: {
    color: '#FFFFFF',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  registerButton: {
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
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  signInText: {
    fontSize: 14,
    color: '#999',
  },
  signInLink: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
});

export default RegisterScreen;