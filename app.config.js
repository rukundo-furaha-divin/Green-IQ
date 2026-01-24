export default {
    expo: {
        name: "GreenIQ",
        slug: "GreenIQ",
        version: "1.0.0",
        sdkVersion: "53.0.0",
        jsEngine: "jsc",
        orientation: "portrait",
        icon: "./assets/logo.png",
        userInterfaceStyle: "light",
        packagerOpts: {
            hostType: "lan"
        },
        notification: {
            icon: "./assets/notification-icon.png",
            color: "#ffffff"
        },
        splash: {
            image: "./assets/logo.png",
            resizeMode: "contain",
            backgroundColor: "#ffffff"
        },
        ios: {
            supportsTablet: true,
            infoPlist: {
                NSCameraUsageDescription: "This app uses the camera to scan waste items.",
                NSLocationWhenInUseUsageDescription: "This app uses your location to show SafeZones.",
                NSPhotoLibraryUsageDescription: "This app needs access to your photo library to upload images.",
                NSAppTransportSecurity: {
                    NSAllowsArbitraryLoads: true
                }
            }
        },
        android: {
            package: "com.greeniq.app",
            usesCleartextTraffic: true,
            useNextNotificationsApi: true,
            adaptiveIcon: {
                foregroundImage: "./assets/logo.png",
                backgroundColor: "#ffffff"
            },
            permissions: [
                "CAMERA",
                "ACCESS_FINE_LOCATION",
                "READ_EXTERNAL_STORAGE",
                "WRITE_EXTERNAL_STORAGE",
                "INTERNET",
                "ACCESS_NETWORK_STATE"
            ],
            config: {
                googleMaps: {
                    apiKey: process.env.GOOGLE_MAPS_API_KEY
                }
            },
            networkSecurityConfig: "./network_security_config.xml"
        },
        web: {
            favicon: "./assets/favicon.png"
        },
        plugins: [
            "expo-secure-store",
            "expo-camera",
            "expo-location",
            "expo-image-picker"
        ],
        extra: {
            eas: {
                projectId: "cffe555f-2c68-412c-95da-7c3acfad2615"
            },
            deepSeekApiKey: process.env.DEEPSEEK_API_KEY
        }
    }
};
