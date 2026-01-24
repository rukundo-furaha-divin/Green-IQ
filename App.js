import 'react-native-url-polyfill/auto';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AppRegistry } from 'react-native';
import WelcomeScreen from './screens/WelcomeScreen';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import CompanyPortal from './screens/CompanyPortal';
import EmployeeManagement from './screens/EmployeeManagement';
import CollectionManagement from './screens/CollectionManagement';
import CollectionPoints from './screens/CollectionPoints';
import Chat from './screens/Chat';
import ScanScreen from './screens/ScanScreen';
import ProfileScreen from './screens/ProfileScreen';
import LocationSelectionScreen from './screens/LocationSelectionScreen';
import Toast from 'react-native-toast-message';
import ChatInfoScreen from './screens/ChatInfo';
import { UserProvider } from './context/UserContext';
import Dashboard from './screens/Dashboard';
import Achievements from './screens/Achievements';
import EcoPointsDetails from './screens/EcoPointsDetails';
import Leaderboard from './screens/Leaderboard';
import Community from './screens/Community';
import Rewards from './screens/Rewards';
import ReferralScreen from './screens/ReferralScreen';
import SafeZoneAlerts from './screens/SafeZoneAlerts';
import SafeZonesMap from './screens/SafeZonesMap';
import ScanChoiceScreen from './screens/ScanChoiceScreen';
import ProductScanScreen from './screens/ProductScanScreen';
import ClassificationResultScreen from './screens/ClassificationResultScreen';
import NearByCompanies from './screens/NearByCompanies';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// The main app experience with the bottom tab bar for citizens
function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Map') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'Scan') {
            return (
              <View style={styles.scanButtonContainer}>
                <Ionicons name="scan" size={30} color="#fff" />
              </View>
            );
          } else if (route.name === 'RewardsTab') {
            iconName = focused ? 'gift' : 'gift-outline';
          } else if (route.name === 'Chat') {
            iconName = focused ? 'business' : 'business-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2d6a4f',
        tabBarInactiveTintColor: 'gray',
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontSize: 13, fontWeight: 'bold', marginBottom: 2 },
        tabBarLabelPosition: 'below-icon', // <-- force vertical layout
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 0,
          elevation: 10,
          shadowOpacity: 0.1,
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="Map" component={SafeZonesMap} options={{
        tabBarLabel: 'Safe Zones', tabBarIcon: ({ color, size, focused }) => (
          <Ionicons name={focused ? 'shield' : 'shield-outline'} size={size} color={color} />
        )
      }} />
      <Tab.Screen
        name="Scan"
        component={ScanScreen} // This component is a placeholder; the press action is overridden.
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            // Prevent default action and navigate to the choice screen
            e.preventDefault();
            navigation.navigate('ScanChoice');
          },
        })}
        options={{ tabBarLabel: 'Scan' }}
      />
      <Tab.Screen name="RewardsTab" component={Rewards} options={{ tabBarLabel: 'Rewards' }} />
      <Tab.Screen name="Chat" component={NearByCompanies} options={{ tabBarLabel: 'Nearby Companies' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}

// Company portal with bottom tab bar
function CompanyTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'CompanyHome') {
            iconName = focused ? 'business' : 'business-outline';
          } else if (route.name === 'CollectionMgmt') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Analytics') {
            iconName = focused ? 'analytics' : 'analytics-outline';
          } else if (route.name === 'Employees') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'CompanyProfile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2d6a4f',
        tabBarInactiveTintColor: 'gray',
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontSize: 13, fontWeight: 'bold', marginBottom: 2 },
        tabBarLabelPosition: 'below-icon',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 0,
          elevation: 10,
          shadowOpacity: 0.1,
        },
      })}
    >
      <Tab.Screen name="CompanyHome" component={CompanyPortal} options={{ tabBarLabel: 'Portal' }} />
      <Tab.Screen name="CollectionMgmt" component={CollectionManagement} options={{ tabBarLabel: 'Collection' }} />
      <Tab.Screen name="Analytics" component={Dashboard} options={{ tabBarLabel: 'Analytics' }} />
      <Tab.Screen name="Employees" component={EmployeeManagement} options={{ tabBarLabel: 'Employees' }} />
      <Tab.Screen name="CompanyProfile" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}

// The complete app navigation flow
function App() {
  return (
    <UserProvider>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Welcome"
            screenOptions={{
              headerShown: false,
            }}
          >
            {/* Auth screens */}
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={SignupScreen} />
            <Stack.Screen name="LocationSelection" component={LocationSelectionScreen} />

            {/* Main app screens (with tab bar) */}
            <Stack.Screen name="Home" component={AppTabs} />
            <Stack.Screen name="CompanyHome" component={CompanyTabs} />
            <Stack.Screen name="Map" component={CollectionPoints} />
            <Stack.Screen name="Chat" component={Chat} />
            <Stack.Screen name="ChatInfo" component={ChatInfoScreen} />
            <Stack.Screen name="Dashboard" component={Dashboard} />
            {/* Challenges Removed */}
            <Stack.Screen name="Achievements" component={Achievements} />
            <Stack.Screen name="EcoPointsDetails" component={EcoPointsDetails} />
            <Stack.Screen name="Leaderboard" component={Leaderboard} />
            <Stack.Screen name="Community" component={Community} />
            <Stack.Screen name="Rewards" component={Rewards} />
            <Stack.Screen name="Referral" component={ReferralScreen} />
            <Stack.Screen name="SafeZoneAlerts" component={SafeZoneAlerts} />
            <Stack.Screen name="SafeZonesMap" component={SafeZonesMap} />
            <Stack.Screen name="ScanChoice" component={ScanChoiceScreen} />
            <Stack.Screen name="Scan" component={ScanScreen} />
            <Stack.Screen name="ProductScan" component={ProductScanScreen} />
            <Stack.Screen name="ClassificationResult" component={ClassificationResultScreen} />
            <Stack.Screen name="EmployeeManagement" component={EmployeeManagement} />
            <Stack.Screen name="CollectionManagement" component={CollectionManagement} />
            <Stack.Screen name="NearByCompanies" component={NearByCompanies} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
      <Toast />
    </UserProvider>
  );
}

const styles = StyleSheet.create({
  scanButtonContainer: {
    backgroundColor: '#2d6a4f',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -30, // Lifts the button up
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
});

AppRegistry.registerComponent('main', () => App);

export default App;