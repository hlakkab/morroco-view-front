import React from 'react';
import { Modal, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import i18n from '../translations/i18n';
import { LinearGradient } from 'expo-linear-gradient';

export type ModalType = 'auth' | 'firstTime';

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
  type?: ModalType;
  onFirstTimeComplete?: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ 
  visible, 
  onClose, 
  type = 'auth',
  onFirstTimeComplete 
}) => {
  const navigation = useNavigation();

  const handleLogin = () => {
    onClose();
    navigation.navigate('Login' as never);
  };

  const handleRegister = () => {
    onClose();
    navigation.navigate('Register' as never);
  };

  const handleFirstTimeComplete = () => {
    onClose();
    onFirstTimeComplete?.();
  };

  const getModalContent = () => {
    switch (type) {
      case 'firstTime':
        return {
          title: i18n.t('firstTime.welcome'),
          message: i18n.t('firstTime.message'),
          primaryButton: {
            text: i18n.t('firstTime.getStarted'),
            onPress: handleFirstTimeComplete
          },
          secondaryButton: null
        };
      default:
        return {
          title: i18n.t('auth.loginRequired'),
          message: i18n.t('auth.loginMessage'),
          primaryButton: {
            text: i18n.t('auth.login'),
            onPress: handleLogin
          },
          secondaryButton: {
            text: i18n.t('auth.register'),
            onPress: handleRegister
          }
        };
    }
  };

  const content = getModalContent();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <LinearGradient
            colors={['#FFF7F7', '#FFF0F0']}
            style={styles.gradientBackground}
          >
            <Text style={styles.title}>{content.title}</Text>
            <Text style={styles.message}>{content.message}</Text>
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.loginButton]}
                onPress={content.primaryButton.onPress}
              >
                <LinearGradient
                  colors={['#CE1126', '#E31B2E']}
                  style={styles.gradientButton}
                >
                  <Text style={styles.buttonText}>{content.primaryButton.text}</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              {content.secondaryButton && (
                <TouchableOpacity
                  style={[styles.button, styles.registerButton]}
                  onPress={content.secondaryButton.onPress}
                >
                  <LinearGradient
                    colors={['#333333', '#444444']}
                    style={styles.gradientButton}
                  >
                    <Text style={styles.buttonText}>{content.secondaryButton.text}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>

            {type === 'auth' && (
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={onClose}
              >
                <Text style={styles.closeButtonText}>{i18n.t('common.cancel')}</Text>
              </TouchableOpacity>
            )}
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#CE1126',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  gradientBackground: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#CE1126',
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  gradientButton: {
    padding: 16,
    alignItems: 'center',
  },
  loginButton: {
    backgroundColor: '#CE1126',
  },
  registerButton: {
    backgroundColor: '#333',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    marginTop: 16,
    padding: 8,
  },
  closeButtonText: {
    color: '#CE1126',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default AuthModal; 