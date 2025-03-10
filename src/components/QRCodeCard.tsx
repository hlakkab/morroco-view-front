import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import QrCodeSvg from '../assets/serviceIcons/qrcode-icon.svg';

interface QRCodeCardProps {
  title: string;
  description: string;
  onPress?: () => void;
}

const QRCodeCard: React.FC<QRCodeCardProps> = ({ title, description, onPress }) => {
  return (
    <TouchableOpacity style={styles.qrCodeCard} onPress={onPress} activeOpacity={0.7}>
      <QrCodeSvg width={48} height={48} />
      <View style={styles.qrCodeDetails}>
        <Text style={styles.qrCodeTitle}>{title}</Text>
        <Text style={styles.qrCodeSubtitle}>{description}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  qrCodeCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  qrCodeDetails: {
    marginLeft: 16,
  },
  qrCodeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  qrCodeSubtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
});

export default QRCodeCard;