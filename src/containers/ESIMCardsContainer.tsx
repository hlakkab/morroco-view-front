import React, { useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import ESIMCard from '../components/ESIMCard';
import QRCodeModal from '../components/QRCodeModal';
import QRCodeLargeSvg from '../assets/serviceIcons/qrcode-large.svg'; // Ensure this exists

// SVG imports for different providers
import InwiSvg from '../assets/serviceIcons/inwi-img.svg';
import OrangeSvg from '../assets/serviceIcons/orange-img.svg';

// Sample data for multiple eSIM cards
const esimData = [
  {
    id: '1',
    logo: <InwiSvg width={70} height={50} />,
    name: 'eSIM Inwi',
    phoneNumber: '+212 689 907 879'
  },
  {
    id: '2',
    logo: <OrangeSvg width={70} height={50} />,
    name: 'eSIM Orange',
    phoneNumber: '+212 700 123 456'
  },
  {
    id: '3',
    logo: <InwiSvg width={70} height={50} />,
    name: 'eSIM Inwi',
    phoneNumber: '+212 661 789 012'
  }
];

interface ESIMCardsContainerProps {
  // You can add additional props if needed
}

const ESIMCardsContainer: React.FC<ESIMCardsContainerProps> = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedESim, setSelectedESim] = useState<typeof esimData[0] | null>(null);

  const handleESIMPress = (esim: typeof esimData[0]) => {
    setSelectedESim(esim);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>eSim Founds</Text>
      
      {esimData.map(esim => (
        <ESIMCard
          key={esim.id}
          logo={esim.logo}
          name={esim.name}
          phoneNumber={esim.phoneNumber}
          onPress={() => handleESIMPress(esim)}
        />
      ))}

      {/* QR Code Modal */}
      {selectedESim && (
        <QRCodeModal
          visible={modalVisible}
          title={selectedESim.name}
          onClose={handleCloseModal}
          customQRContent={<QRCodeLargeSvg width={300} height={300} />}
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
  }
});

export default ESIMCardsContainer;