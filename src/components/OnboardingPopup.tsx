import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Dimensions, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import i18n from '../translations/i18n';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  iconColor?: string;
}

interface OnboardingPopupProps {
  visible: boolean;
  onClose: () => void;
  steps: OnboardingStep[];
  title: string;
  subtitle?: string;
}

const { width } = Dimensions.get('window');

const OnboardingPopup: React.FC<OnboardingPopupProps> = ({
  visible,
  onClose,
  steps,
  title,
  subtitle
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  // Force re-render when language changes
  const [currentLanguage, setCurrentLanguage] = useState(i18n.locale);
  
  // Reset current step when steps array changes (e.g., language change)
  useEffect(() => {
    setCurrentStep(0);
  }, [steps]);
  
  // Update language state when it changes
  useEffect(() => {
    setCurrentLanguage(i18n.locale);
  }, [i18n.locale]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Last step, close the popup
      handleClose();
    }
  };

  const handleClose = () => {
    // Reset to first step when closing
    setCurrentStep(0);
    onClose();
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepIndicators = () => {
    return (
      <View style={styles.indicatorContainer}>
        {steps.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              index === currentStep ? styles.activeIndicator : {}
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
          
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          
          <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
            <View style={styles.stepIconContainer}>
              <Ionicons 
                name={steps[currentStep].icon as any} 
                size={60} 
                color={steps[currentStep].iconColor || '#CE1126'} 
              />
            </View>
            
            <Text style={styles.stepTitle}>
              {steps[currentStep].title}
            </Text>
            
            <Text style={styles.stepDescription}>
              {steps[currentStep].description}
            </Text>
          </ScrollView>
          
          {renderStepIndicators()}
          
          <View style={styles.buttonContainer}>
            {currentStep > 0 ? (
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Text style={styles.backButtonText}>{i18n.t('onboarding.back')}</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.emptyBackButton} />
            )}
            
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>
                {currentStep < steps.length - 1 
                  ? i18n.t('onboarding.next') 
                  : i18n.t('onboarding.getStarted')}
              </Text>
            </TouchableOpacity>
          </View>
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
    paddingHorizontal: 20,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: width * 0.9,
    maxWidth: 400,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    maxHeight: '80%',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    padding: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  content: {
    width: '100%',
  },
  contentContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  stepIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FCEBEC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  stepDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  indicatorContainer: {
    flexDirection: 'row',
    marginVertical: 24,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: '#CE1126',
    width: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  emptyBackButton: {
    width: 70,
  },
  nextButton: {
    backgroundColor: '#CE1126',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
  },
  nextButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});

export default OnboardingPopup; 