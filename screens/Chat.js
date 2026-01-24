import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  Animated,
  ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const getMockMessages = (managerName) => [
  { id: '1', text: 'Welcome to our collection point chat! How can we help?', sender: 'manager', timestamp: new Date(Date.now() - 3600000) },
  { id: '2', text: 'Hi! I have some questions about waste collection.', sender: 'user', timestamp: new Date(Date.now() - 3500000) },
  { id: '3', text: 'Sure! What would you like to know?', sender: 'manager', timestamp: new Date(Date.now() - 3400000) },
  { id: '4', text: 'What types of waste do you accept?', sender: 'user', timestamp: new Date(Date.now() - 3300000) },
  { id: '5', text: 'We accept plastic, paper, and metal. Here\'s our schedule: Mon-Sat, 7am-6pm', sender: 'manager', timestamp: new Date(Date.now() - 3200000) },
].reverse(); 

const getMockUsers = (managerName) => ({
  manager: { id: 'manager1', name: managerName, avatar: `https://i.pravatar.cc/150?u=${managerName}` },
  user: { id: 'user1', name: 'You', avatar: 'https://i.pravatar.cc/150?u=user' },
});

const REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

const MessageBubble = ({ message, isUser, user }) => {
  return (
    <View style={[styles.messageRow, isUser ? styles.messageRowUser : {}]}>
      {!isUser && <Image source={{ uri: user.avatar }} style={styles.avatar} />}
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleManager]}>
        <Text style={isUser ? styles.bubbleTextUser : styles.bubbleTextManager}>{message.text}</Text>
        <View style={styles.bubbleFooter}>
          <Text style={styles.timestamp}>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
          {isUser && <Ionicons name="checkmark-done" size={16} color="#e0f2f1" style={{ marginLeft: 4 }} />}
        </View>
      </View>
    </View>
  );
};

const Chat = ({ route, navigation }) => {
  const { pointName = "Select a Chat", pointManager = "Manager" } = route.params || {};
  const insets = useSafeAreaInsets();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const users = useMemo(() => getMockUsers(pointManager), [pointManager]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showReactions, setShowReactions] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [showMessageOptions, setShowMessageOptions] = useState(false);
  const flatListRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    navigation.setOptions({
      title: pointName,
      headerStyle: {
        backgroundColor: '#fff',
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
      },
      headerTitleAlign: 'center',
      headerTitleStyle: {
        color: '#1B5E20',
        fontWeight: 'bold',
        fontSize: 18,
        letterSpacing: 0.5,
      },
      headerLeft: () => (
        <TouchableOpacity
          style={{ marginLeft: 10, backgroundColor: '#e0f7fa', borderRadius: 18, padding: 6 }}
          onPress={() => navigation.navigate('Home')}
          accessibilityLabel="Back to Home"
        >
          <Ionicons name="arrow-back" size={24} color="#00C896" />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate('ChatInfo', {
              user: users.manager,
              collectionPoint: route.params,
            })}
            accessibilityLabel="Chat Information"
          >
            <Ionicons name="information-circle-outline" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowMessageOptions(true)}
            accessibilityLabel="Message Options"
          >
            <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      ),
    });

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    if (route.params?.pointName) {
      setMessages(getMockMessages(pointManager));
    }
  }, [navigation, pointName, pointManager, fadeAnim, route.params]);

  const handleTyping = () => {
    setIsTyping(true);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 2000);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Please allow access to photos to send images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setIsLoading(true);
      const newMessage = {
        id: Date.now().toString(),
        type: 'image',
        imageUri: result.assets[0].uri,
        sender: 'user',
        senderName: 'You',
        timestamp: new Date().toISOString(),
        status: 'sending',
        reactions: [],
        isForwarded: false,
      };
      setMessages(prevMessages => [...prevMessages, newMessage]);

      setTimeout(() => {
        setMessages(prevMessages =>
          prevMessages.map(msg =>
            msg.id === newMessage.id
              ? { ...msg, status: 'sent' }
              : msg
          )
        );
        setIsLoading(false);
      }, 1000);
    }
  };

  const handleSend = () => {
    if (input.trim() === '') return;
    const newMessage = {
      id: Date.now().toString(),
      text: input.trim(),
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [newMessage, ...prev]);
    setInput('');
  };

  const handleReaction = (messageId, reaction) => {
    setMessages(prevMessages =>
      prevMessages.map(msg => {
        if (msg.id === messageId) {
          const reactions = [...(msg.reactions || [])];
          const existingIndex = reactions.findIndex(r => r.user === 'user');
          if (existingIndex >= 0) {
            reactions[existingIndex] = { user: 'user', reaction };
          } else {
            reactions.push({ user: 'user', reaction });
          }
          return { ...msg, reactions };
        }
        return msg;
      })
    );
    setShowReactions(false);
  };

  const handleMessageLongPress = (message) => {
    setSelectedMessage(message);
    setShowMessageOptions(true);
  };

  const handleForward = () => {
    if (selectedMessage) {
      setReplyTo(selectedMessage);
      setShowMessageOptions(false);
      Alert.alert('Forward Message', 'Select a contact to forward to');
    }
  };

  const handleDelete = () => {
    if (selectedMessage) {
      Alert.alert(
        'Delete Message',
        'Are you sure you want to delete this message?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              setMessages(prevMessages =>
                prevMessages.filter(msg => msg.id !== selectedMessage.id)
              );
              setShowMessageOptions(false);
            },
          },
        ]
      );
    }
  };

  if (!route.params?.pointName) {
    return (
      <ImageBackground source={require('../assets/Back.png')} style={styles.container} imageStyle={{ opacity: 0.1 }}>
        <SafeAreaView style={styles.emptyContainer}>
          <Ionicons name="chatbubbles-outline" size={80} color="#a0a0a0" />
          <Text style={styles.emptyText}>Please select a collection point to start chatting.</Text>
          <TouchableOpacity style={styles.browseButton} onPress={() => navigation.navigate('Map')}>
            <Text style={styles.browseButtonText}>Browse Collection Points</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <ImageBackground source={require('../assets/Back.png')} style={styles.container} imageStyle={{ opacity: 0.1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Image source={{ uri: users.manager.avatar }} style={styles.headerAvatar} />
          <View>
            <Text style={styles.headerTitle}>{pointName}</Text>
            <Text style={styles.headerSubtitle}>{pointManager}</Text>
          </View>
          <View style={{ flex: 1 }} />
          <TouchableOpacity onPress={() => navigation.navigate('ChatInfo', { user: users.manager, collectionPoint: route.params })} style={styles.headerButton}>
            <Ionicons name="information-circle-outline" size={26} color="#333" />
          </TouchableOpacity>
        </View>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingView}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <FlatList
            data={messages}
            renderItem={({ item }) => <MessageBubble message={item} isUser={item.sender === 'user'} user={users[item.sender]} />}
            keyExtractor={item => item.id}
            style={styles.chatList}
            inverted
            contentContainerStyle={{ paddingBottom: insets.bottom + 70, paddingTop: 10 }}
          />
          <View style={[styles.inputContainer, { marginBottom: insets.bottom }]}> 
            <TouchableOpacity style={styles.inputButton}>
              <Ionicons name="add" size={28} color="#2d6a4f" />
            </TouchableOpacity>
            <TextInput
              style={styles.textInput}
              placeholder="Type a message..."
              value={input}
              onChangeText={setInput}
              multiline
            />
            <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
              <Ionicons name="send" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#eef2f3' },
  keyboardAvoidingView: { flex: 1 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { fontSize: 18, textAlign: 'center', color: '#666', marginTop: 20 },
  browseButton: { marginTop: 30, backgroundColor: '#2d6a4f', paddingVertical: 15, paddingHorizontal: 30, borderRadius: 30 },
  browseButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, backgroundColor: 'rgba(255,255,255,0.8)', borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  headerButton: { padding: 8 },
  headerAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  headerTitle: { fontSize: 17, fontWeight: 'bold', color: '#1b4332' },
  headerSubtitle: { fontSize: 13, color: '#6c757d' },   
  chatList: { paddingHorizontal: 12, paddingTop: 10 },
  messageRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 15 },
  messageRowUser: { justifyContent: 'flex-end' },
  avatar: { width: 32, height: 32, borderRadius: 16, marginRight: 8 },
  bubble: { maxWidth: '75%', borderRadius: 18, paddingVertical: 10, paddingHorizontal: 16, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  bubbleUser: { backgroundColor: '#2d6a4f', borderBottomRightRadius: 4 },
  bubbleManager: { backgroundColor: '#fff', borderBottomLeftRadius: 4 },
  bubbleTextUser: { color: '#fff', fontSize: 16 },
  bubbleTextManager: { color: '#222', fontSize: 16 },
  bubbleFooter: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: 6 },
  timestamp: { fontSize: 11, color: '#a0a0a0' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#fff' },
  textInput: { flex: 1, backgroundColor: '#f0f2f5', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 16, marginRight: 10 },
  inputButton: { padding: 8, marginRight: 4 },
  sendButton: { backgroundColor: '#2d6a4f', borderRadius: 22, width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default Chat;