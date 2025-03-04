import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import ContactsIcon from '../assets/img/contacts-icon.svg';

interface EmergencyContactsButtonProps {
  onPress: () => void;
}

const EmergencyContactsButton: React.FC<EmergencyContactsButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Text style={styles.text}>Emergency Contacts</Text>
      <View style={styles.iconContainer}>
        <ContactsIcon width={18} height={18} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
    color: '#F5A623', // Golden yellow color as shown in the image
    marginRight: 10,
  },
  iconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F5A623', // Matching border color
    borderRadius: 4,
  },
  icon: {
    fontSize: 14,
    color: '#F5A623',
  },
});

export default EmergencyContactsButton;