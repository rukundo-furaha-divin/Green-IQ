# Green_IQ (Expo React Native App)

## Overview
Green_IQ is a modern, mobile-first React Native app (built with Expo) focused on waste management, recycling, and community engagement. It features real-time chat, AI-powered waste scanning, a government dashboard, and a map of collection points across Rwanda. The app is designed for both citizens and government officials, with role-based access and a clean, social-media-inspired UI.

---

## Table of Contents
- [Features](#features)
- [Screens & Navigation](#screens--navigation)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Environment & Configuration](#environment--configuration)
- [Backend Integration](#backend-integration)
- [Key Dependencies](#key-dependencies)
- [Assets & Styles](#assets--styles)
- [Contributing](#contributing)

---

## Features
- User Authentication: Register, login, and manage user sessions (with context and secure storage).
- Home Dashboard: Personalized stats, eco-impact, and quick actions.
- EcoPoints Rewards & Marketplace: Redeem eco points for certificates, products, and more. View available rewards and your redemption history.
- Referral System: Invite friends with your referral code, copy/share your code, and earn bonus points for each signup.
- Leaderboard: See the top recyclers and your rank, with avatars and medals for the top users.
- Community: Join the community chat, connect with other users, and share tips.
- Safe Zones: Interactive map of collection points, now labeled as "Safe Zones" in the app, with search and chat for each location.
- AI-Powered Scan: Use the device camera to take and upload photos of waste for classification (ML integration ready).
- Profile & Settings: Edit profile, view eco points, referral code, and access all your achievements and rewards.
- Onboarding & Welcome: Animated, feature-rich welcome screen with testimonials and app highlights.
- Tablet Support: Responsive layouts and tab bar for tablets and large screens.

---

## Screens & Navigation
- WelcomeScreen: Animated intro, feature highlights, testimonials, and navigation to login/register.
- LoginScreen / RegisterScreen**: Auth forms with validation, context, and secure storage.
- HomeScreen: User stats, eco-impact, quick links, featured rewards, and access to all new features.
- ScanScreen: Camera interface for taking, previewing, and uploading multiple waste photos.
- CollectionPoints (Safe Zones): Map of all collection points, search, and join chat for each location.
-Chat: Social-style chat with avatars, reactions, media, and immersive UI.
-ProfileScreen: User info, eco points, referral code, invite friends, and settings.
- Rewards: Browse and redeem eco points for certificates, products, and more.
- ReferralScreen**: View, copy, and share your referral code. Invite friends and earn points.
- Leaderboard: See the top recyclers and your rank, with avatars and medals.
- Community: Join the community chat and connect with other users.
- Dashboard: Government-only analytics, charts, collection point management, and activity logs.
- **LocationSelectionScreen**: Select location during registration.
- **ChatInfo**: Details about the chat/collection point manager.

Navigation is managed via React Navigation (stack and bottom tabs). The bottom tab bar now features icons and descriptive labels (Home, Safe Zones, Scan, Rewards, Community, Profile) with a consistent vertical layout on all devices, including tablets.

---

## Project Structure
```
Trash_IQ/
  ├── App.js                # Main app entry, navigation setup
  ├── app.json              # Expo config
  ├── package.json          # Dependencies and scripts
  ├── assets/               # Images, icons, splash, etc.
  ├── components/           # Reusable UI components
  ├── context/              # UserContext for global user state
  ├── navigation/           # Navigation stack/tab setup
  ├── screens/              # All app screens (see above)
  ├── services/             # API/auth helpers (SecureStore)
  ├── styles/               # Global/shared styles
  ├── utils/                # Validators, helpers
```

---

## Setup & Installation
1. **Clone the repo**
   ```bash
   git clone <repo-url>
   cd Trash_IQ/Trash_IQ
   ```
2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```
3. **Start the Expo server**
   ```bash
   npm start
   # or
   yarn start
   ```
4. **Run on device/emulator**
   - Android: `npm run android`
   - iOS: `npm run ios`
   - Web: `npm run web`

---

## Environment & Configuration
- **Expo Managed Workflow**: All configuration is in `app.json`.
- **Backend URL**: Set in `config.js` (currently commented for frontend-only mode).
- **Secure Storage**: User sessions are stored using `expo-secure-store`.

---

## Backend Integration
- **Auth & User Data**: See `services/auth.js` for SecureStore usage. Replace with API calls as needed.
- **Scan Upload**: The scan/upload flow is ready for backend/ML integration. Connect the upload logic in `ScanScreen.js` to your API endpoint.
- **Collection Points & Chat**: Currently uses mock data. Replace with real API endpoints for production.
- **Government Dashboard**: All analytics and stats are mock data; connect to backend for real-time data.

---

## Key Dependencies
- `expo`, `react-native`, `@react-navigation/*`, `expo-camera`, `expo-image-picker`, `expo-linear-gradient`, `expo-location`, `expo-secure-store`
- `react-native-maps`, `react-native-chart-kit`, `react-native-elements`, `react-native-toast-message`
- See `package.json` for full list.

---

## Assets & Styles
- All images, icons, and splash screens are in the `assets/` folder.
- Global and shared styles are in `styles/`.
- Custom components (e.g., buttons, text inputs) are in `components/`.

---

## Contributing
- Please follow best practices for React Native and Expo.
- Use context for global state (see `context/UserContext.js`).
- Keep UI modern, accessible, and responsive.
- For backend integration, replace mock data and connect API endpoints as needed.

---

## Contact
For questions or support, contact the project maintainer or open an issue. 



1.How to make be there permanently without any other temporary issues
2.How to make the one for iOS 
3.Terms and conditions for standard hosting
4.Complete finish!!!!
