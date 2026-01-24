import React from 'react';
import { Modal, View, Text, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

const WasteClassificationModal = ({ visible, results, onConfirm, onClose }) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Waste Classification Results</Text>
          <ScrollView style={{ maxHeight: 320 }}>
            {results.map((item, idx) => (
              <View key={idx} style={styles.resultItem}>
                <Image source={{ uri: item.image }} style={styles.image} />
                <View style={styles.info}>
                  <Text style={styles.type}>{item.type}</Text>
                  <Text style={styles.description}>{item.description}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
              <Text style={styles.buttonText}>Confirm & Earn EcoPoints</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 24,
    width: 340,
    maxWidth: '90%',
    alignItems: 'center',
    elevation: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 18,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#f8fffe',
    borderRadius: 10,
    padding: 8,
  },
  image: {
    width: 54,
    height: 54,
    borderRadius: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  info: {
    flex: 1,
  },
  type: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00C896',
    marginBottom: 2,
  },
  description: {
    fontSize: 13,
    color: '#555',
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 18,
    justifyContent: 'space-between',
    width: '100%',
  },
  confirmButton: {
    backgroundColor: '#00C896',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginRight: 8,
    flex: 1,
    alignItems: 'center',
  },
  closeButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    flex: 1,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});

export default WasteClassificationModal; 