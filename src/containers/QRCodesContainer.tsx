import React, { useState } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import QRCodeCard from '../components/QRCodeCard';
import QRCodeModal from '../components/QRCodeModal';
import QRCodeLargeSvg from '../assets/serviceIcons/qrcode-large.svg'; // Ensure this exists

// Sample data for QR codes
const initialQrCodesData = [
  {
    id: '1',
    title: 'Train Ticket',
    subtitle: 'train ticket at arrival'
  },
  {
    id: '2',
    title: 'Fly Depart Ticket',
    subtitle: 'train ticket at arrival'
  },
  {
    id: '3',
    title: 'Subway Ticket',
    subtitle: 'train ticket at arrival'
  },
  {
    id: '4',
    title: 'Museum Pass',
    subtitle: 'valid for 3 days'
  },
  {
    id: '5',
    title: 'Hotel Check-in',
    subtitle: 'reservation #MR12345'
  }
];

interface QRCodesContainerProps {
  searchQuery?: string;
}

const QRCodesContainer: React.FC<QRCodesContainerProps> = ({ searchQuery = '' }) => {
  const [qrCodes] = useState(initialQrCodesData);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedQrCode, setSelectedQrCode] = useState<{ title: string } | null>(null);

  // Filter QR codes based on search query
  const filteredQrCodes = qrCodes.filter(qrCode => 
    qrCode.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    qrCode.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleQrCodePress = (qrCode: typeof initialQrCodesData[0]) => {
    setSelectedQrCode(qrCode);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  return (
    <>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {filteredQrCodes.map(qrCode => (
          <QRCodeCard 
            key={qrCode.id}
            title={qrCode.title} 
            subtitle={qrCode.subtitle}
            onPress={() => handleQrCodePress(qrCode)}
          />
        ))}
      </ScrollView>

      {/* QR Code Modal */}
      {selectedQrCode && (
        <QRCodeModal
          visible={modalVisible}
          title={selectedQrCode.title}
          onClose={handleCloseModal}
          customQRContent={<QRCodeLargeSvg width={300} height={300} />}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
  }
});

export default QRCodesContainer;