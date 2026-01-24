import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Community({ navigation }) {
  return (
    <View style={{ flex: 1, backgroundColor: '#f8fffe' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 44, paddingBottom: 16, backgroundColor: '#FF5722', paddingHorizontal: 10, marginBottom: 10 }}>
        <TouchableOpacity onPress={() => navigation && navigation.goBack && navigation.goBack()} style={{ padding: 6, marginRight: 10 }}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ color: '#fff', fontSize: 24, fontWeight: 'bold', letterSpacing: 1 }}>Community</Text>
        </View>
      </View>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Ionicons name="chatbubbles-outline" size={60} color="#FF5722" style={{ marginBottom: 20 }} />
        <Text style={{ fontSize: 20, color: '#FF5722', fontWeight: 'bold', marginBottom: 10 }}>Join the Community Chat!</Text>
        <Text style={{ fontSize: 15, color: '#888', marginBottom: 30, textAlign: 'center', maxWidth: 300 }}>
          Connect with other eco warriors, share tips, and ask questions in the chat room.
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Chat')} style={{ backgroundColor: '#FF5722', borderRadius: 22, paddingVertical: 12, paddingHorizontal: 36, flexDirection: 'row', alignItems: 'center', elevation: 2 }}>
          <Ionicons name="chatbubbles" size={22} color="#fff" style={{ marginRight: 8 }} />
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Enter Chat</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
} 