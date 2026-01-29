import {
  View,
  Text,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
  useWindowDimensions,
  Platform,
  Dimensions,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { CameraView } from "expo-camera";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { FontAwesome, Ionicons } from "@expo/vector-icons"; // Added Ionicons
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { getProductGrades } from "../utils/ProductGrade";
import NoProductImage from "../assets/NoProductImage.png";
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { API_BASE_URL } from '../utils/apiConfig';
import { fetchProductFromOFF, getEcoAnalysis } from "../services/productService";
import { cleanText } from "../utils/cleanText";
import { extractYoutubeUrl } from "../utils/extractYoutubeURL";
import { WebView } from "react-native-webview";
import debounce from "lodash.debounce";
import Toast from "react-native-toast-message";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const ProductScanScreen = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState(null);
  const [scanned, setScanner] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraClicked, setCameraClicked] = useState(false);
  const [analysis, setAnalysis] = useState("");
  const [videoId, setVideoId] = useState("");

  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isTablet = windowWidth >= 768;
  const isSmallDevice = windowWidth < 375;
  const isLandscape = windowWidth > windowHeight;

  useEffect(() => {
    if (cameraClicked && hasPermission !== true) {
      const getCameraPermission = async () => {
        const { status } = await CameraView.requestCameraPermissionsAsync();
        const granted = status === "granted";
        setHasPermission(granted);
        if (granted) setShowCamera(true);
        else {
          setCameraClicked(false);
          Alert.alert("Camera permission required");
        }
      };
      getCameraPermission();
    }
  }, [cameraClicked]);

  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  async function retryFn(fn, { retries = 2, baseDelay = 700 } = {}) {
    let attempt = 0;
    while (true) {
      try {
        return await fn();
      } catch (err) {
        const status = err?.response?.status ?? err?.status ?? null;
        if (status === 429 && attempt < retries) {
          const delay = baseDelay * Math.pow(2, attempt);
          await sleep(delay);
          attempt++;
          continue;
        }
        throw err;
      }
    }
  }

  async function retryFetch(url, options = {}, { retries = 1, baseDelay = 600 } = {}) {
    let attempt = 0;
    while (true) {
      try {
        const resp = await fetch(url, options);
        return resp;
      } catch (err) {
        if (attempt < retries) {
          const delay = baseDelay * Math.pow(2, attempt);
          await sleep(delay);
          attempt++;
          continue;
        }
        throw err;
      }
    }
  }

  const handleScanProduct = async (barcode) => {
    try {
      const res = await retryFn(
        () => axios.post(`${API_BASE_URL}/scanProduct`, { barcode }),
        { retries: 1, baseDelay: 800 }
      );
    } catch (error) {
      const msg = error?.response?.data?.message || error?.message || "Unexpected backend error";
      Toast.show({
        type: 'error',
        text1: 'Backend Error',
        text2: msg
      });
    }
  };

  const deepSeekCache = useRef(new Map());
  const scannedCache = useRef(new Set());

  const handleBarcodeScanned = async ({ type, data }) => {
    try {
      if (scanned) return;
      if (!data) return;
      if (scannedCache.current.has(data)) {
        setScanner(true);
        setTimeout(() => setScanner(false), 1200);
        return;
      }

      setScanner(true);
      scannedCache.current.add(data);
      setShowCamera(false);
      setCameraClicked(false);
      setLoading(true);

      // 1. Fetch from OpenFoodFacts
      const offData = await fetchProductFromOFF(data);

      if (!offData) {
        scannedCache.current.delete(data);
        Toast.show({
          type: 'info',
          text1: 'Product Not Found',
          text2: 'This barcode is not in our database yet.'
        });
        setScanner(false);
        setShowCamera(true);
        return;
      }

      // 2. Local State update for UI
      const gradedProduct = await getProductGrades([offData.product]);
      if (isMounted.current) setProduct(gradedProduct[0]);

      const barcodeKey = data;

      // 3. check cache or call backend
      if (deepSeekCache.current.has(barcodeKey)) {
        const cached = deepSeekCache.current.get(barcodeKey);
        if (isMounted.current) {
          setAnalysis(cached.analysis);
          setVideoId(cached.videoId || "");
        }
      } else {
        // 4. Call Backend for Analysis
        const analysisResult = await getEcoAnalysis(offData);

        let youtubeId = "";
        try {
          youtubeId = await extractYoutubeUrl(analysisResult);
        } catch {
          youtubeId = "";
        }

        const cleaned = await cleanText(analysisResult);

        deepSeekCache.current.set(barcodeKey, { analysis: cleaned, videoId: youtubeId || "" });

        if (isMounted.current) {
          setAnalysis(cleaned);
          setVideoId(youtubeId || "");
        }
      }

    } catch (error) {
      let msg = "An error occurred while scanning";
      if (error.message && (error.message.includes('Network') || error.message.includes('fetch'))) {
        msg = "Network error. Please check your internet connection and try again.";
      } else if (error?.response?.data?.message) {
        msg = error.response.data.message;
      } else if (error.message) {
        msg = error.message;
      }

      Toast.show({
        type: 'error',
        text1: 'Scan Error',
        text2: msg
      });
      setScanner(false);
      setShowCamera(true);
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  const handlerRef = useRef(handleBarcodeScanned);
  handlerRef.current = handleBarcodeScanned;

  const debouncedHandleRef = useRef(null);
  useEffect(() => {
    debouncedHandleRef.current = debounce((event) => {
      handlerRef.current(event);
    }, 3000, { leading: true, trailing: false });

    return () => {
      if (debouncedHandleRef.current?.cancel) debouncedHandleRef.current.cancel();
    };
  }, []);

  if (hasPermission == false) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.permissionContainer}>
          <Text style={styles.permissionText}>Camera permission required</Text>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  const giveColor = (grade) => {
    const gradeContainerStyle = [styles.gradeContainer, isTablet && styles.gradeContainerTablet, isSmallDevice && styles.gradeContainerSmall];
    const gradeTextStyle = [styles.gradeLabel, isTablet && styles.gradeLabelTablet, isSmallDevice && styles.gradeLabelSmall];

    switch (grade) {
      case "a":
        return (
          <View style={gradeContainerStyle}>
            <View style={[styles.circle, styles.circleGreen]}>
              <Text style={styles.gradeText}>A</Text>
            </View>
            <Text style={[gradeTextStyle, { color: "#00A784" }]}>Eco Friendly</Text>
          </View>
        );
      case "b":
        return (
          <View style={gradeContainerStyle}>
            <View style={[styles.circle, styles.circleGreen]}>
              <Text style={styles.gradeText}>B</Text>
            </View>
            <Text style={[gradeTextStyle, { color: "#00A784" }]}>Eco Friendly</Text>
          </View>
        );
      case "c":
        return (
          <View style={gradeContainerStyle}>
            <View style={[styles.circle, styles.circleYellow]}>
              <Text style={styles.gradeText}>C</Text>
            </View>
            <Text style={[gradeTextStyle, { color: "#f0fc06ff" }]}>Eco Friendly</Text>
          </View>
        );
      case "d":
        return (
          <View style={gradeContainerStyle}>
            <View style={[styles.circle, styles.circleRed]}>
              <Text style={styles.gradeText}>D</Text>
            </View>
            <Text style={[gradeTextStyle, { color: "#ff0303ff" }]}>Not Eco Friendly</Text>
          </View>
        );
      case "e":
        return (
          <View style={gradeContainerStyle}>
            <View style={[styles.circle, styles.circleRed]}>
              <Text style={styles.gradeText}>E</Text>
            </View>
            <Text style={[gradeTextStyle, { color: "#ff0303ff" }]}>Not Eco Friendly</Text>
          </View>
        );
      case "unknown":
        return (
          <View style={gradeContainerStyle}>
            <View style={[styles.circle, styles.circlePurple]}>
              <Text style={styles.gradeText}>?</Text>
            </View>
            <Text style={[gradeTextStyle, { color: "#ff6ae4ff" }]}>Refer to analysis</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom", "left", "right"]}>
        {showCamera && (
          <View style={styles.cameraContainer}>
            <CameraView
              onBarcodeScanned={
                scanned
                  ? undefined
                  : (e) => {
                    if (debouncedHandleRef.current) debouncedHandleRef.current(e);
                  }
              }
              style={styles.camera}
            />
            <View style={[styles.scanFrame, isTablet && styles.scanFrameTablet, isSmallDevice && styles.scanFrameSmall]} />
          </View>
        )}



        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <ScrollView style={styles.scrollView} contentContainerStyle={[styles.scrollContent, isTablet && styles.scrollContentTablet]} showsVerticalScrollIndicator={false}>
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#00A784" />
            </View>
          )}

          {!cameraClicked && (
            <Pressable
              style={[styles.cameraHolder, isTablet && styles.cameraHolderTablet, isSmallDevice && styles.cameraHolderSmall, isLandscape && styles.cameraHolderLandscape]}
              onPress={() => {
                setCameraClicked(true);
                setProduct(null);
                setShowCamera(true);
                setScanner(false);
                setVideoId("");
                setAnalysis(null);
              }}
            >
              <FontAwesome name="camera" size={isTablet ? 40 : isSmallDevice ? 24 : 30} style={styles.cameraIcon} />
              <Text style={[styles.cameraText, isTablet && styles.cameraTextTablet, isSmallDevice && styles.cameraTextSmall]}>Scan a product</Text>
            </Pressable>
          )}

          {product && (
            <View style={[styles.productContainer, isTablet && styles.productContainerTablet, isLandscape && styles.productContainerLandscape]}>
              <View style={[styles.productCard, isTablet && styles.productCardTablet]}>
                <View style={[styles.imageContainer, isTablet && styles.imageContainerTablet]}>
                  <Image source={product.image ? { uri: product.image } : NoProductImage} style={[styles.productImage, isTablet && styles.productImageTablet, isSmallDevice && styles.productImageSmall]} resizeMode="cover" />
                </View>
                <View style={[styles.productInfo, isTablet && styles.productInfoTablet]}>
                  <Text style={[styles.productName, isTablet && styles.productNameTablet, isSmallDevice && styles.productNameSmall]}>{product.product_name}</Text>
                  <Text style={[styles.gradeLabel, isTablet && styles.gradeLabelTablet, isSmallDevice && styles.gradeLabelSmall]}>Grade: {product.grade}</Text>
                  {giveColor(product.grade)}
                </View>
              </View>
            </View>
          )}

          {analysis && (
            <View style={[styles.analysisContainer, isTablet && styles.analysisContainerTablet]}>
              <Text style={[styles.analysisTitle, isTablet && styles.analysisTitleTablet, isSmallDevice && styles.analysisTitleSmall]}>Environmental Impact Analysis:</Text>
              <Text style={[styles.paragraph, isTablet && styles.paragraphTablet, isSmallDevice && styles.paragraphSmall]}>{analysis}</Text>
            </View>
          )}

          {videoId !== "" && (
            <View style={[styles.videoView, isTablet && styles.videoViewTablet, isSmallDevice && styles.videoViewSmall]}>
              <WebView source={{ uri: `https://www.youtube.com/embed/${videoId}` }} javaScriptEnabled={true} allowsFullscreenVideo={true} domStorageEnabled={true} style={styles.webView} />
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  permissionContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  permissionText: { fontSize: 18, color: "#666", textAlign: "center" },
  cameraContainer: { width: "100%", height: "100%", position: "relative", backgroundColor: "transparent" },
  camera: { flex: 1 },
  scanFrame: { position: "absolute", top: "35%", left: "20%", width: "60%", height: "30%", borderWidth: 10, borderColor: "white", borderRadius: 20, zIndex: 10 },
  scanFrameTablet: { top: "30%", left: "25%", width: "50%", height: "40%", borderWidth: 12, borderRadius: 25 },
  scanFrameSmall: { top: "40%", left: "15%", width: "70%", height: "25%", borderWidth: 8, borderRadius: 15 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 20 },
  scrollContentTablet: { paddingHorizontal: 40, paddingBottom: 40 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 40 },
  cameraHolder: { backgroundColor: "#00A784", height: 200, width: "100%", maxWidth: 300, marginTop: 30, marginBottom: 20, borderRadius: 30, justifyContent: "center", alignItems: "center", alignSelf: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 5 },
  cameraHolderTablet: { height: 250, maxWidth: 400, borderRadius: 40, marginTop: 40 },
  cameraHolderSmall: { height: 160, maxWidth: 280, borderRadius: 25, marginTop: 20 },
  cameraHolderLandscape: { height: 150, maxWidth: 250, marginTop: 15 },
  cameraIcon: { color: "white", marginBottom: 8 },
  cameraText: { color: "white", fontSize: 16, fontWeight: "600" },
  cameraTextTablet: { fontSize: 20 },
  cameraTextSmall: { fontSize: 14 },
  productContainer: { marginTop: 20 },
  productContainerTablet: { marginTop: 30 },
  productContainerLandscape: { marginTop: 15 },
  productCard: { flexDirection: "row", backgroundColor: "#fff", borderRadius: 20, padding: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  productCardTablet: { padding: 30, borderRadius: 25 },
  imageContainer: { marginRight: 20 },
  imageContainerTablet: { marginRight: 30 },
  productImage: { width: wp("35%"), height: hp("18%"), borderRadius: 15, minWidth: 120, minHeight: 120 },
  productImageTablet: { width: wp("25%"), height: hp("15%"), borderRadius: 20, minWidth: 150, minHeight: 150 },
  productImageSmall: { width: wp("40%"), height: hp("20%"), borderRadius: 12, minWidth: 100, minHeight: 100 },
  productInfo: { flex: 1, justifyContent: "center" },
  productInfoTablet: { justifyContent: "flex-start", paddingTop: 10 },
  productName: { fontSize: 18, fontWeight: "bold", marginBottom: 12, color: "#333", lineHeight: 24 },
  productNameTablet: { fontSize: 24, marginBottom: 16, lineHeight: 30 },
  productNameSmall: { fontSize: 16, marginBottom: 10, lineHeight: 20 },
  gradeLabel: { marginBottom: 8, fontWeight: "bold", fontSize: 14, color: "#666" },
  gradeLabelTablet: { fontSize: 18, marginBottom: 12 },
  gradeLabelSmall: { fontSize: 12, marginBottom: 6 },
  gradeContainer: { flexDirection: "row", alignItems: "center" },
  gradeContainerTablet: { marginTop: 4 },
  gradeContainerSmall: { marginTop: 2 },
  circle: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center", marginRight: 12 },
  circleGreen: { backgroundColor: "#00A784" },
  circleYellow: { backgroundColor: "#f0fc06ff" },
  circleRed: { backgroundColor: "#ff0303ff" },
  circlePurple: { backgroundColor: "#ff6ae4ff" },
  gradeText: { color: "white", fontWeight: "bold", fontSize: 18 },
  analysisContainer: { marginTop: 30, paddingHorizontal: 0 },
  analysisContainerTablet: { marginTop: 40 },
  analysisTitle: { fontWeight: "bold", fontSize: 18, marginBottom: 12, color: "#333" },
  analysisTitleTablet: { fontSize: 22, marginBottom: 16 },
  analysisTitleSmall: { fontSize: 16, marginBottom: 10 },
  paragraph: { fontSize: 15, lineHeight: 24, color: "#333", textAlign: "left" },
  paragraphTablet: { fontSize: 17, lineHeight: 28 },
  paragraphSmall: { fontSize: 14, lineHeight: 20 },
  videoView: { height: 220, marginTop: 20, marginBottom: 10, borderRadius: 15, overflow: "hidden", backgroundColor: "#000", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 6 },
  videoViewTablet: { height: 300, marginTop: 30, marginBottom: 20, borderRadius: 20 },
  videoViewSmall: { height: 180, marginTop: 15, marginBottom: 5, borderRadius: 12 },
  webView: { flex: 1 },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 50, // Adjusted for better safe area
    left: 20,
    zIndex: 100, // Increased zIndex
    backgroundColor: 'rgba(0,0,0,0.5)', // Darker background for visibility
    padding: 12, // Larger padding
    borderRadius: 25,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});

export default ProductScanScreen;
