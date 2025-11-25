import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface AppUpdateModalProps {
  visible: boolean;
  title?: string;
  description?: string;
  currentVersion: string;
  latestVersion: string | null;
  forceUpdate?: boolean;
  onUpdate: () => void;
  onLater: () => void;
}

export const AppUpdateModal: React.FC<AppUpdateModalProps> = ({
  visible,
  title = 'Update Available',
  description = 'Enjoy the newest Morocco View experiences.',
  currentVersion,
  latestVersion,
  forceUpdate = false,
  onUpdate,
  onLater,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <LinearGradient
            colors={['#FFF7F7', '#FFF0F0']}
            style={styles.gradientBackground}
          >
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>

            {/* What's inside this update - commented out until needed */}
            {/* <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>What's inside this update?</Text>
              <Text style={styles.infoText}>• Freshly curated city moments</Text>
              <Text style={styles.infoText}>• Faster tips for cafés & souks</Text>
              <Text style={styles.infoText}>• Smoother bookings and routes</Text>
            </View> */}

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.updateButton]}
                onPress={onUpdate}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={['#CE1126', '#E31B2E']}
                  style={styles.gradientButton}
                >
                  <Text style={styles.buttonText}>Update now</Text>
                </LinearGradient>
              </TouchableOpacity>

              {!forceUpdate && (
                <TouchableOpacity
                  style={[styles.button, styles.laterButton]}
                  onPress={onLater}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={['#333333', '#444444']}
                    style={styles.gradientButton}
                  >
                    <Text style={styles.buttonText}>Later</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
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
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  infoCard: {
    borderRadius: 20,
    backgroundColor: '#FFF4F4',
    padding: 18,
    marginBottom: 28,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#B40024',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#4A4A4A',
    marginBottom: 4,
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
  updateButton: {
    backgroundColor: '#CE1126',
  },
  laterButton: {
    backgroundColor: '#333',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AppUpdateModal;


