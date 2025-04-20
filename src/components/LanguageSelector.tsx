import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLanguage } from '../contexts/LanguageContext';
import i18n, { languageNames } from '../translations/i18n';

interface LanguageSelectorProps {}

const LanguageSelector: React.FC<LanguageSelectorProps> = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const { currentLanguage, setLanguage } = useLanguage();

  const changeLanguage = (language: string) => {
    setLanguage(language);
    setModalVisible(false);
  };

  return (
    <View>
      <TouchableOpacity
        style={styles.languageButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.languageButtonText}>
          {currentLanguage.toUpperCase()}
        </Text>
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>{i18n.t('common.language')}</Text>

            {Object.keys(languageNames).map((langCode) => (
              <TouchableOpacity
                key={langCode}
                style={[
                  styles.languageOption,
                  currentLanguage === langCode && styles.selectedLanguage
                ]}
                onPress={() => changeLanguage(langCode)}
              >
                <Text 
                  style={[
                    styles.languageText,
                    currentLanguage === langCode && styles.selectedLanguageText
                  ]}
                >
                  {languageNames[langCode as keyof typeof languageNames]}
                </Text>
                {currentLanguage === langCode && (
                  <Ionicons name="checkmark" size={20} color="#AE1913" />
                )}
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>
                {i18n.locale === 'fr' ? 'Fermer' : 'Close'}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  languageButton: {
    width: 60,
    height: 54,
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginLeft: 6,
  },
  languageButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#AE1913',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  languageOption: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  selectedLanguage: {
    backgroundColor: '#FDF2F2',
  },
  languageText: {
    fontSize: 16,
  },
  selectedLanguageText: {
    fontWeight: 'bold',
    color: '#AE1913',
  },
  closeButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 30,
    backgroundColor: '#EFEFEF',
    borderRadius: 20,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default LanguageSelector; 