import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import QRCodeLargeSvg from '../../assets/serviceIcons/qrcode-large.svg'; // Ensure this exists
import ESIMCard from '../components/ESIMCard';
import QRCodeModal from '../../QRCode/components/QRCodeModal';
import i18n from '../../translations/i18n';
import Esim from '../types/esim';

// SVG imports for different providers
import InwiSvg from '../../assets/serviceIcons/inwi-img.svg';
import OrangeSvg from '../../assets/serviceIcons/orange-img.svg';

interface ESIMCardsContainerProps {
  esims: Esim[];
  loading: boolean;
  error: string | null;
}

const ESIMCardsContainer: React.FC<ESIMCardsContainerProps> = ({ esims, loading, error }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedESim, setSelectedESim] = useState<Esim | null>(null);

  const handleESIMPress = (esim: Esim) => {
    setSelectedESim(esim);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const getOperatorLogo = (operator: string) => {
    switch (operator.toLowerCase()) {
      case 'inwi':
        return <InwiSvg width={70} height={50} />;
      case 'orange':
        return <OrangeSvg width={70} height={50} />;
      default:
        return <QRCodeLargeSvg width={70} height={50} />;
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (esims.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>{i18n.t('qrcode.noESIM')}</Text>
        <Text style={styles.emptyDescription}>
          {i18n.t('qrcode.noESIMDescription')}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{i18n.t('qrcode.eSIMFounds')}</Text>
      
      {esims.map(esim => (
        <ESIMCard
          key={esim.id}
          logo={getOperatorLogo(esim.operator)}
          name={esim.operator}
          phoneNumber={esim.simNumber}
          onPress={() => handleESIMPress(esim)}
        />
      ))}

      {/* QR Code Modal */}
      {selectedESim && (
        <QRCodeModal
          visible={modalVisible}
          title={selectedESim.operator}
          onClose={handleCloseModal}
          data={selectedESim.offer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: '#333',
    marginBottom: 12,
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    lineHeight: 20,
  },
});

export default ESIMCardsContainer;