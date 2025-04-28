import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import QrCodeSvg from '../assets/serviceIcons/qrcode-icon.svg';

interface ESIMCardProps {
  logo: React.ReactNode;
  name: string;
  phoneNumber: string;
  onPress?: () => void;
}

const ESIMCard: React.FC<ESIMCardProps> = ({ logo, name, phoneNumber, onPress }) => {
  return (
    <TouchableOpacity style={styles.esimCard} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.esimInfo}>
        {/* Display the passed logo component */}
        {logo}
        <View style={styles.esimDetails}>
          <Text style={styles.esimName}>{name}</Text>
          <Text style={styles.phoneNumber}>{phoneNumber}</Text>
        </View>
      </View>
      <QrCodeSvg width={50} height={50} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  esimCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16,
  },
  esimInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  esimDetails: {
    marginLeft: 8,
  },
  esimName: {
    fontSize: 20,
    fontWeight: '700',
  },
  phoneNumber: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});

export default ESIMCard;