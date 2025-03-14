import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SaveButton: React.FC = () => {
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const handleSave = () => {
    setIsSaved(!isSaved);
  };

  return (
    <TouchableOpacity 
      style={[styles.saveButton, isSaved && styles.savedButton]} 
      onPress={handleSave}
    >
      <Ionicons 
        name={isSaved ? "bookmark" : "bookmark-outline"} 
        size={24} 
        color={isSaved ? "#888888" : "#000"}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  saveButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    opacity: 0.5,
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.7,
    borderColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  savedButton: {
    backgroundColor: '#E6E6E6',
    borderColor: '#E6E6E6', 
    opacity: 1,
  },
});

export default SaveButton;
