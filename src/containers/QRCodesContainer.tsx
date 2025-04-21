import React, { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import QRCodeCard from '../components/QRCodeCard';
import QRCodeModal from '../components/QRCodeModal';
import { useAppSelector } from '../hooks/reduxHooks';
import i18n from '../translations/i18n';
import QRCode from '../types/qrcode';

interface QRCodesContainerProps {
  searchQuery?: string;
}

const QRCodesContainer: React.FC<QRCodesContainerProps> = ({ searchQuery = '' }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedQrCode, setSelectedQrCode] = useState<QRCode | null>(null);
  
  // Get QR codes from Redux store
  const { items } = useAppSelector(state => state.qrCodes);

  // Filter QR codes based on search query
  const filteredQrCodes = items.filter(qrCode => 
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
        {filteredQrCodes.map((qrCode: QRCode) => (
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