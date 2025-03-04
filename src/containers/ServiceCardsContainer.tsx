import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';

// Example of SVG imports - replace these with your actual paths
import HotelSvg from '../assets/serviceIcons/hotelPick-icon.svg';
import MoneySvg from '../assets/serviceIcons/money-icon.svg';
import SimCardSvg from '../assets/serviceIcons/sim-card-icon.svg';
import QrCodeSvg from '../assets/serviceIcons/qr-code-icon.svg';

const { width } = Dimensions.get('window');

interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ icon, title }) => {
  return (
    <TouchableOpacity style={styles.serviceItem}>
      <View style={styles.serviceCardContainer}>
        <View style={styles.serviceIconContainer}>
          {icon}
        </View>
        <Text style={styles.serviceText}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};

interface ServiceCardsContainerProps {
  // You can add props here if needed in the future
}

const ServiceCardsContainer: React.FC<ServiceCardsContainerProps> = () => {
  return (
    <View style={styles.serviceIconsContainer}>
      <ServiceCard 
        icon={<HotelSvg width={28} height={28} />}
        title="Hotel Pickup"
      />
      <ServiceCard 
        icon={<MoneySvg width={28} height={28} />}
        title="Money Exchange"
      />
      <ServiceCard 
        icon={<SimCardSvg width={28} height={28} />}
        title="eSIM"
      />
      <ServiceCard 
        icon={<QrCodeSvg width={28} height={28} />}
        title="QR Codes"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  serviceIconsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  serviceItem: {
    width: (width - 75) / 4,
  },
  serviceCardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    height: 80,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  serviceIconContainer: {
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
    height: 18,
  },
  serviceText: {
    fontSize: 11,
    color: '#888',
    textAlign: 'center',
    fontWeight: '400',
  },
});

export default ServiceCardsContainer;