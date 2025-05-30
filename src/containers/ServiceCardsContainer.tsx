import { NavigationProp, useNavigation } from '@react-navigation/native';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLanguage } from '../contexts/LanguageContext';
import i18n from '../translations/i18n';
// Example of SVG imports - replace these with your actual paths
import HotelSvg from '../assets/serviceIcons/hotelPick-icon.svg';
import MoneySvg from '../assets/serviceIcons/money-icon.svg';
import QrCodeSvg from '../assets/serviceIcons/qrcode-icon.svg';
import SimCardSvg from '../assets/serviceIcons/sim-card-icon.svg';
// Import navigation types
import { RootStackParamList } from '../types/navigation';
import { trackEvent } from '../service/Mixpanel';

const { width } = Dimensions.get('window');

interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  onPress?: () => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ icon, title, onPress }) => {
  return (
    <TouchableOpacity style={styles.serviceItem} onPress={onPress}>
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
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { currentLanguage } = useLanguage();

  const handleESIMPress = () => {
    trackEvent('Service Clicked', {
      service_name: 'eSIM',
      language: currentLanguage
    });
    navigation.navigate('ESIM');
  };

  const handleQRCodesPress = () => {
    trackEvent('Service Clicked', {
      service_name: 'QR Codes',
      language: currentLanguage
    });
    navigation.navigate('QRCodes');
  };

  const handleHotelPickupPress = () => {
    trackEvent('Service Clicked', {
      service_name: 'Hotel Pickup',
      language: currentLanguage
    });
    navigation.navigate('HotelPickup');
  };

  const handleMoneyExchangePress = () => {
    trackEvent('Service Clicked', {
      service_name: 'Money Exchange',
      language: currentLanguage
    });
    navigation.navigate('MoneyExchange');
  };

  return (
      <View>
        <Text style={styles.sectionTitle}>{i18n.t('services.title')}</Text>

        <View style={styles.serviceIconsContainer}>
          <ServiceCard
              icon={<HotelSvg width={28} height={28} />}
              title={i18n.t('services.hotelPickup')}
              onPress={handleHotelPickupPress}
          />
          <ServiceCard
              icon={<MoneySvg width={28} height={28} />}
              title={i18n.t('services.moneyExchange')}
              onPress={handleMoneyExchangePress}
          />
          <ServiceCard
              icon={<SimCardSvg width={28} height={28} />}
              title={i18n.t('services.eSIM')}
              onPress={handleESIMPress}
          />
          <ServiceCard
              icon={<QrCodeSvg width={28} height={28} />}
              title={i18n.t('services.qrCodes')}
              onPress={handleQRCodesPress}
          />
        </View>
      </View>
  );

};

const styles = StyleSheet.create({
  serviceIconsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // marginBottom: 15,
  },
  serviceItem: {
    width: (width - 75) / 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
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