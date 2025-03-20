import React, { useState } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import QRCodeCard from '../components/QRCodeCard';
import QRCodeModal from '../components/QRCodeModal';
import QRCodeLargeSvg from '../assets/serviceIcons/qrcode-large.svg'; // Ensure this exists
import QRCode from '../types/qrcode'; 
import { useAppSelector } from '../hooks/reduxHooks';

interface QRCodesContainerProps {
  searchQuery?: string;
}

const QRCodesContainer: React.FC<QRCodesContainerProps> = ({ searchQuery = '' }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedQrCode, setSelectedQrCode] = useState<QRCode | null>(null);
  
  // Get QR codes from Redux store
  const { items: qrCodes } = useAppSelector(state => state.qrCodes);

  // Filter QR codes based on search query
  const filteredQrCodes = qrCodes.filter(qrCode => 
    qrCode.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    qrCode.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleQrCodePress = (qrCode: QRCode) => {
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
            data={qrCode.data}
            description={qrCode.description}
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
          data={selectedQrCode.data}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  }
});

export default QRCodesContainer;