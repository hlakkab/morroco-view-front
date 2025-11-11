import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import i18n from '../../translations/i18n';

interface TransportInfoProps {
  title: string;
  price: number;
}

export const TransportInfo: React.FC<TransportInfoProps> = ({ title, price }) => {
  return (
    <View style={styles.transportInfo}>
      <View style={styles.iconContainer}>
        <Ionicons name="car" size={28} color="#fff" />
      </View>
      <View style={styles.transportDetails}>
        <Text style={styles.transportTitle}>{title}</Text>
        <Text style={styles.transportPrice}>{price} DH {i18n.t('pickup.perGroup')}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  transportInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 4,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#CE1126',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  transportDetails: {
    flex: 1,
  },
  transportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  transportPrice: {
    fontSize: 14,
    color: '#CE1126',
    fontWeight: '500',
  },
});

