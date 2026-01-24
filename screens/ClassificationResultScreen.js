import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5, Entypo, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
let WebView;
try {
  WebView = require('react-native-webview').WebView;
} catch (e) {
  WebView = null;
}
let ChartKit;
try {
  ChartKit = require('react-native-chart-kit');
} catch (e) {
  ChartKit = null;
}
const SCREEN_WIDTH = Dimensions.get('window').width;

const infoByLabel = {
  biodegradable: {
    definition: 'Biodegradable waste is any material that can be broken down naturally by microorganisms over time.',
    impact: 'Properly disposing of biodegradable waste reduces landfill use and returns nutrients to the soil. Composting is the best way to handle this waste.',
    learnMore: {
      url: 'https://www.epa.gov/recycle/composting-home',
      label: 'Learn about Composting (EPA)'
    },
    moreItems: [
      'Fruit and vegetable peels',
      'Coffee grounds',
      'Eggshells',
      'Yard trimmings',
      'Paper towels',
      'Tea bags',
      'Bread',
      'Leaves',
    ],
    disposal: 'Compost at home or use a municipal organic waste bin.',
    color: ['#43e97b', '#38f9d7'],
    bgColor: '#e6f9ed',
    textColor: '#2d6a4f',
  },
  non_biodegradable: {
    definition: 'Non-biodegradable waste cannot be broken down by natural organisms and remains in the environment for a long time.',
    impact: 'Improper disposal of non-biodegradable waste leads to pollution and harms wildlife. Recycling and safe disposal are crucial.',
    learnMore: {
      url: 'https://www.epa.gov/recycle',
      label: 'Learn about Recycling (EPA)'
    },
    moreItems: [
      'Plastic bottles',
      'Styrofoam',
      'Aluminum cans',
      'Glass',
      'Batteries',
      'Electronics',
      'Metals',
      'Synthetic fabrics',
    ],
    disposal: 'Recycle if possible, or use designated bins for hazardous or electronic waste.',
    color: ['#ff9966', '#ff5e62'],
    bgColor: '#fff3e6',
    textColor: '#b34700',
  }
};

const wasteControlTips = [
  {
    icon: <MaterialCommunityIcons name="recycle" size={20} color="#388e3c" />, 
    title: 'Reduce',
    text: 'Buy only what you need and avoid single-use products.',
    color: '#ffebee',
    textColor: '#b71c1c',
  },
  {
    icon: <Ionicons name="heart" size={20} color="#8e24aa" />,
    title: 'Reuse',
    text: 'Find new uses for items instead of throwing them away.',
    color: '#f3e5f5',
    textColor: '#6a1b9a',
  },
  {
    icon: <MaterialCommunityIcons name="tree" size={20} color="#388e3c" />,
    title: 'Recycle',
    text: 'Sort your waste and recycle whenever possible.',
    color: '#e8f5e9',
    textColor: '#1b5e20',
  },
  {
    icon: <MaterialCommunityIcons name="water" size={20} color="#039be5" />,
    title: 'Compost',
    text: 'Compost food scraps and biodegradable waste.',
    color: '#e3f2fd',
    textColor: '#01579b',
  },
  {
    icon: <MaterialIcons name="flash-on" size={20} color="#fbc02d" />,
    title: 'Educate',
    text: 'Share knowledge about waste management with others.',
    color: '#fffde7',
    textColor: '#fbc02d',
  },
  {
    icon: <Entypo name="globe" size={20} color="#3949ab" />,
    title: 'Participate',
    text: 'Join local clean-up or recycling programs.',
    color: '#e8eaf6',
    textColor: '#1a237e',
  },
];

const ClassificationResultScreen = ({ route }) => {
  // Use the actual backend result from navigation
  const { result: initialResult } = route.params;
  const [result] = useState(initialResult);
  const [expandedSections, setExpandedSections] = useState({});
  const [selectedTip, setSelectedTip] = useState(null);
  const navigation = useNavigation();

  // Use dynamic info for educational sections
  const info = infoByLabel[result.label] || {};

  // Dynamic pools for videos, carbon facts, fun facts, and chart data
  const videoByLabel = {
    biodegradable: [
      { url: 'https://www.youtube.com/shorts/U3ejVA6015A', title: 'How to Compost: The Ultimate Guide' },
      { url: 'https://www.youtube.com/watch?v=sllhrTL_1Us', title: 'What is Biodegradable Waste?' },
      { url: 'https://www.youtube.com/watch?v=4ECxHTf_Co4', title: 'Composting for Beginners' },
    ],
    non_biodegradable: [
      { url: 'https://www.youtube.com/shorts/3b55OCaP6GI', title: 'How Recycling Works: Behind the Scenes' },
      { url: 'https://www.youtube.com/watch?v=YeVLBkypPRU', title: 'The Problem with Plastic Waste' },
      { url: 'https://www.youtube.com/embed/9yl6-HEY7_s', title: 'What Happens to Your Trash?' },
    ],
  };
  const carbonFactByLabel = {
    biodegradable: [
      'Composting 1 ton of food waste can reduce greenhouse gas emissions by the equivalent of removing 1 car from the road for 2 months.',
      'Biodegradable waste in landfills produces methane, a potent greenhouse gas. Composting helps prevent this.',
      'Composting at home can reduce your household carbon footprint by up to 30%.',
    ],
    non_biodegradable: [
      'Recycling 1 ton of plastic saves over 16 barrels of oil and reduces carbon emissions by nearly 2 tons.',
      'Producing new aluminum from recycled cans uses 95% less energy than making it from raw materials.',
      'Plastic waste in oceans is responsible for the deaths of over 1 million marine animals each year.',
    ],
  };
  const funFactByLabel = {
    biodegradable: [
      'Did you know? Banana peels decompose in about 2-5 weeks, while plastic bags can take up to 1,000 years!',
      'Eggshells are 95% calcium carbonate and are great for your compost pile.',
      'Composting can be done even in small apartments using indoor bins or worm composters.',
    ],
    non_biodegradable: [
      'Fun fact: Recycling one aluminum can saves enough energy to run a TV for 3 hours!',
      'Glass is 100% recyclable and can be recycled endlessly without loss in quality.',
      'Styrofoam can take up to 500 years to decompose in a landfill.',
    ],
  };
  const chartDataByLabel = {
    biodegradable: {
      labels: ['Banana Peel', 'Paper', 'Leaves', 'Eggshell'],
      data: [0.5, 2, 3, 5], // months to decompose
      legend: 'Decomposition Time (months)',
    },
    non_biodegradable: {
      labels: ['Plastic Bag', 'Aluminum Can', 'Glass Bottle', 'Styrofoam'],
      data: [240, 1200, 4000, 600], // years to decompose
      legend: 'Decomposition Time (years)',
    },
  };
  // Randomly select one from each pool
  function getRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  const [videoIdx] = useState(() => Math.floor(Math.random() * videoByLabel[result.label].length));
  const [carbonIdx] = useState(() => Math.floor(Math.random() * carbonFactByLabel[result.label].length));
  const [funIdx, setFunIdx] = useState(() => Math.floor(Math.random() * funFactByLabel[result.label].length));
  const video = videoByLabel[result.label][videoIdx];
  const carbonFact = carbonFactByLabel[result.label][carbonIdx];
  const funFacts = funFactByLabel[result.label];
  const funFact = funFacts[funIdx];
  const chartData = chartDataByLabel[result.label];

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleTipClick = (index) => {
    setSelectedTip(index === selectedTip ? null : index);
  };

  const openLearnMore = (url) => {
    import('react-native').then(({ Linking }) => Linking.openURL(url));
  };

  return (
    <ScrollView contentContainerStyle={{ alignItems: 'center', paddingBottom: 40, backgroundColor: info.bgColor }}>
      <View style={[styles.card, { backgroundColor: info.bgColor }]}>  
        {/* Show scanned image if present */}
        {result.image && (
          <Image
            source={{ uri: result.image }}
            style={styles.scannedImage}
            resizeMode="cover"
          />
        )}
        <Text style={[styles.label, { color: info.textColor }]}>{result.label.replace('_', ' ')}</Text>
        {/* Removed confidence and try/switch button */}
        {/* Definition */}
        <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleSection('definition')}>
          <View style={styles.sectionHeaderRow}>
            <Entypo name="globe" size={20} color={info.textColor} />
            <Text style={[styles.sectionTitle, { color: info.textColor }]}>Definition</Text>
            <Ionicons name={expandedSections.definition ? 'chevron-up' : 'chevron-down'} size={20} color={info.textColor} />
          </View>
        </TouchableOpacity>
        {expandedSections.definition && (
          <Text style={styles.sectionText}>{info.definition}</Text>
        )}
        {/* Impact */}
        <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleSection('impact')}>
          <View style={styles.sectionHeaderRow}>
            <MaterialIcons name="flash-on" size={20} color={info.textColor} />
            <Text style={[styles.sectionTitle, { color: info.textColor }]}>Environmental Impact</Text>
            <Ionicons name={expandedSections.impact ? 'chevron-up' : 'chevron-down'} size={20} color={info.textColor} />
          </View>
        </TouchableOpacity>
        {expandedSections.impact && (
          <Text style={styles.sectionText}>{info.impact}</Text>
        )}
        {/* Disposal Advice */}
        <View style={styles.sectionHeaderRow}>
          <MaterialCommunityIcons name="recycle" size={20} color={info.textColor} />
          <Text style={[styles.sectionTitle, { color: info.textColor }]}>Disposal Advice</Text>
        </View>
        <Text style={styles.advice}>{info.disposal}</Text>
        {/* Common Items */}
        <View style={styles.sectionHeaderRow}>
          <MaterialCommunityIcons name="tree" size={20} color={info.textColor} />
          <Text style={[styles.sectionTitle, { color: info.textColor }]}>Common Items</Text>
        </View>
        <View style={styles.exampleList}>
          {(info.moreItems || []).map((item, idx) => (
            <View key={idx} style={styles.exampleItem}>
              <Text style={[styles.exampleText, { color: info.textColor }]}>{item}</Text>
            </View>
          ))}
        </View>
        {/* Learn More Button */}
        {info.learnMore && (
          <TouchableOpacity style={styles.learnMoreBtn} onPress={() => openLearnMore(info.learnMore.url)}>
            <Ionicons name="open-outline" size={18} color={info.textColor} style={{ marginRight: 6 }} />
            <Text style={[styles.learnMoreText, { color: info.textColor }]}>{info.learnMore.label}</Text>
          </TouchableOpacity>
        )}
        {/* Waste Control Tips */}
        <View style={styles.tipsSection}>
          <View style={styles.tipsHeaderRow}>
            <Ionicons name="heart" size={24} color="#e53935" />
            <Text style={styles.tipsTitle}>How to Control and Reduce Waste</Text>
          </View>
          <View style={styles.tipsGrid}>
            {wasteControlTips.map((tip, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.tipCard,
                  { backgroundColor: selectedTip === idx ? tip.color : '#fff', borderColor: selectedTip === idx ? tip.textColor : '#eee' }
                ]}
                onPress={() => handleTipClick(idx)}
                activeOpacity={0.8}
              >
                <View style={styles.tipIcon}>{tip.icon}</View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.tipTitle, { color: tip.textColor }]}>{tip.title}</Text>
                  <Text style={styles.tipText}>{tip.text}</Text>
                </View>
                {selectedTip === idx && (
                  <Ionicons name="checkmark-circle" size={20} color="#43e97b" style={{ marginLeft: 6 }} />
                )}
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.tipsFooter}>Tap on each tip to learn more and help save our planet! 🌍</Text>
        </View>

        {/* Educational Additions */}
        <View style={styles.eduSection}>
          <Text style={styles.eduHeader}>Watch & Learn</Text>
          {WebView && video && (
            <View style={styles.videoContainer}>
              <WebView
                source={{ uri: video.url }}
                style={styles.video}
                javaScriptEnabled
                domStorageEnabled
                allowsFullscreenVideo
              />
              <Text style={styles.videoTitle}>{video.title}</Text>
            </View>
          )}

          {/* Carbon Footprint - Important Section */}
          <View style={styles.carbonSection}>
            <View style={styles.carbonHeaderRow}>
              <Ionicons name="alert-circle" size={22} color="#e53935" style={{ marginRight: 8 }} />
              <Text style={styles.carbonHeader}>Important: Carbon Footprint</Text>
            </View>
            <Text style={styles.carbonText}>{carbonFact}</Text>
            <Text style={styles.carbonNote}>
              The carbon footprint of your waste has a major impact on climate change. Proper disposal and recycling can significantly reduce greenhouse gas emissions for {result.label.replace('_', ' ')} waste.
            </Text>
          </View>

          <Text style={styles.eduHeader}>Fun Fact</Text>
          <Text style={styles.eduText}>{funFact}</Text>
          {funFacts.length > 1 && (
            <TouchableOpacity style={styles.showAnotherBtn} onPress={() => setFunIdx((funIdx + 1) % funFacts.length)}>
              <Text style={styles.showAnotherText}>Show Another Fact</Text>
            </TouchableOpacity>
          )}
          {/* Chart Section */}
          {ChartKit && chartData && (
            <View style={styles.chartSection}>
              <Text style={styles.eduHeader}>Decomposition Times</Text>
              <ChartKit.BarChart
                data={{
                  labels: chartData.labels,
                  datasets: [{ data: chartData.data }],
                }}
                width={SCREEN_WIDTH * 0.85}
                height={220}
                yAxisLabel={''}
                yAxisSuffix={result.label === 'biodegradable' ? 'm' : 'y'}
                chartConfig={{
                  backgroundColor: '#f8f8f8',
                  backgroundGradientFrom: '#f8f8f8',
                  backgroundGradientTo: '#e0e0e0',
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(44, 130, 201, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(44, 130, 201, ${opacity})` ,
                  style: { borderRadius: 16 },
                  propsForDots: { r: '6', strokeWidth: '2', stroke: '#2d6a4f' },
                }}
                style={{ borderRadius: 16, marginTop: 10 }}
                verticalLabelRotation={30}
              />
              <Text style={styles.chartLegend}>{chartData.legend}</Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#2d6a4f' }]}
            onPress={() => Alert.alert('EcoPoints Claimed!', 'You have claimed your EcoPoints!')}
          >
            <Ionicons name="leaf" size={22} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.actionButtonText}>Claim EcoPoints</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#388e3c' }]}
            onPress={() => navigation.navigate('Scan')}
          >
            <Ionicons name="camera" size={22} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.actionButtonText}>Scan Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  card: {
    marginTop: 32,
    marginBottom: 16,
    padding: 24,
    borderRadius: 22,
    alignItems: 'center',
    width: '92%',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 7,
  },
  scannedImage: {
    width: 120,
    height: 120,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    backgroundColor: '#f4f4f4',
  },
  headerIconWrap: {
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 50,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 28,
    marginBottom: 10,
    textTransform: 'capitalize',
    textAlign: 'center',
  },
  confidenceWrap: {
    marginBottom: 10,
  },
  confidence: {
    fontSize: 18,
    fontWeight: '600',
  },
  switchBtn: {
    backgroundColor: '#2d6a4f',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 24,
    marginBottom: 18,
    marginTop: 2,
  },
  sectionHeader: {
    marginTop: 10,
    marginBottom: 2,
    width: '100%',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
    flex: 1,
  },
  sectionText: {
    fontSize: 15,
    color: '#333',
    marginBottom: 4,
    textAlign: 'left',
    alignSelf: 'flex-start',
    width: '100%',
  },
  advice: {
    fontSize: 16,
    color: '#555',
    marginBottom: 12,
    textAlign: 'center',
    width: '100%',
  },
  exampleList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 10,
    width: '100%',
  },
  exampleItem: {
    backgroundColor: '#e9f5ee',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 3,
  },
  exampleText: {
    fontSize: 15,
  },
  learnMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e9f5ee',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 10,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  learnMoreText: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  tipsSection: {
    marginTop: 18,
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  tipsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    justifyContent: 'center',
  },
  tipsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#2d6a4f',
  },
  tipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 2,
    borderRadius: 14,
    padding: 12,
    margin: 4,
    minWidth: 140,
    maxWidth: 180,
    flex: 1,
  },
  tipIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  tipTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 2,
  },
  tipText: {
    fontSize: 14,
    color: '#555',
  },
  tipsFooter: {
    marginTop: 10,
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  eduSection: {
    marginTop: 24,
    width: '100%',
    backgroundColor: '#f8f8f8',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
    alignItems: 'center',
  },
  eduHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d6a4f',
    marginTop: 10,
    marginBottom: 6,
    alignSelf: 'flex-start',
  },
  eduText: {
    fontSize: 15,
    color: '#333',
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  videoContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    marginBottom: 10,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  video: {
    flex: 1,
    borderRadius: 12,
  },
  videoTitle: {
    fontSize: 15,
    color: '#555',
    marginTop: 4,
    marginBottom: 10,
    fontStyle: 'italic',
    alignSelf: 'center',
  },
  showAnotherBtn: {
    backgroundColor: '#2d6a4f',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 18,
    alignSelf: 'flex-start',
    marginBottom: 10,
    marginTop: 2,
  },
  showAnotherText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  chartSection: {
    marginTop: 18,
    width: '100%',
    alignItems: 'center',
  },
  chartLegend: {
    fontSize: 14,
    color: '#888',
    marginTop: 6,
    alignSelf: 'center',
    fontStyle: 'italic',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 28,
    marginBottom: 8,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 18,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
  },
  carbonSection: {
    backgroundColor: '#fff3e6',
    borderLeftWidth: 6,
    borderLeftColor: '#e53935',
    borderRadius: 12,
    padding: 14,
    marginTop: 18,
    marginBottom: 12,
    width: '100%',
    shadowColor: '#e53935',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  carbonHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  carbonHeader: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#e53935',
  },
  carbonText: {
    fontSize: 15,
    color: '#b34700',
    marginBottom: 4,
    fontWeight: '600',
  },
  carbonNote: {
    fontSize: 13,
    color: '#b34700',
    fontStyle: 'italic',
    marginTop: 2,
  },
});

export default ClassificationResultScreen;