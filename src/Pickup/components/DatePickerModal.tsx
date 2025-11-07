import { Feather } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import { LogBox, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ModernDatePicker from 'react-native-modern-datepicker';
import i18n from '../../translations/i18n';

// Suppress the specific warning about defaultProps
LogBox.ignoreLogs([
  'Warning: DatePicker: Support for defaultProps will be removed from function components',
  'Warning: Header: Support for defaultProps will be removed from function components'
]);

// Create a wrapper component that doesn't rely on defaultProps
const DatePicker: React.FC<any> = (props) => {
  return (
    <ModernDatePicker {...props} />
  );
};

interface DatePickerModalProps {
  visible: boolean;
  onClose: () => void;
  startDate: string;
  onDateSelect: (date: string) => void;
  formatDisplayDate?: (dateString: string) => string;
  color?: string;
}

// Fonction pour obtenir une locale supportée par react-native-modern-datepicker
const getSupportedLocale = (locale: string): string => {
  // Liste des locales supportées par react-native-modern-datepicker
  const supportedLocales = ['en', 'fa']; // anglais et persan seulement
  
  // Gérer le cas où locale est null ou undefined
  if (!locale) {
    console.warn(`Locale is null/undefined, falling back to "en"`);
    return 'en';
  }
  
  // Extraire le code de langue principale (ex: 'fr' de 'fr-FR')
  const primaryLocale = locale.split('-')[0];
  
  // Si la locale est supportée, l'utiliser
  if (supportedLocales.includes(primaryLocale)) {
    return primaryLocale;
  }
  
  // Sinon, fallback vers l'anglais
  console.warn(`Locale "${primaryLocale}" not supported by react-native-modern-datepicker, falling back to "en"`);
  return 'en';
};

// Configuration française pour le calendrier
const getFrenchConfigs = () => ({
  dayNames: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
  dayNamesShort: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
  monthNames: [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ],
  selectedFormat: 'YYYY/MM/DD',
  dateFormat: 'YYYY/MM/DD',
  monthYearFormat: 'YYYY MM',
  timeFormat: 'HH:mm',
  hour: 'Heure',
  minute: 'Minute',
  timeSelect: 'Sélectionner',
  timeClose: 'Fermer',
});

const DatePickerModal: React.FC<DatePickerModalProps> = ({
  visible,
  onClose,
  startDate,
  onDateSelect,
  formatDisplayDate,
  color = '#008060'
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(startDate || '');

  // Reset selected date when modal opens or startDate changes
  useEffect(() => {
    if (visible) {
      setSelectedDate(startDate || '');
    }
  }, [visible, startDate]);

  // Get minimum date for picker (today)
  const getMinimumDate = () => {
    return new Date().toISOString().split('T')[0].replace(/-/g, '/');
  };

  // Get current date to show in the picker
  const getCurrentDate = () => {
    return startDate || new Date().toISOString().split('T')[0].replace(/-/g, '/');
  };

  // Obtenir la configuration selon la langue
  const getConfigs = () => {
    const currentLocale = i18n.locale ?? 'en';
    const primaryLocale = currentLocale.split('-')[0];
    
    if (primaryLocale === 'fr') {
      return getFrenchConfigs();
    }
    
    return {}; // Configuration par défaut pour les autres langues
  };

  // Handle date selection - ensure only single date is selected
  const handleDateChange = (date: string) => {
    if (!date || typeof date !== 'string') {
      return;
    }

    // The date picker might return a range or single date
    // Extract the first date if it's a range (format: "YYYY/MM/DD - YYYY/MM/DD")
    let singleDate = date.trim();
    
    if (singleDate.includes(' - ')) {
      // If it's a range, take only the first date
      singleDate = singleDate.split(' - ')[0].trim();
    }
    
    // Normalize date format - ensure it's YYYY/MM/DD
    // Handle both YYYY/MM/DD and YYYY-MM-DD formats
    singleDate = singleDate.replace(/-/g, '/');
    
    // Validate date format (YYYY/MM/DD)
    const dateRegex = /^\d{4}\/\d{2}\/\d{2}$/;
    if (dateRegex.test(singleDate)) {
      setSelectedDate(singleDate);
    } else {
      console.warn('Invalid date format received:', date);
    }
  };

  // Handle confirmation - only pass the selected date
  const handleConfirm = () => {
    if (selectedDate) {
      onDateSelect(selectedDate);
      onClose();
    }
  };

  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            activeOpacity={1}
            style={styles.pickerContainer}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>{i18n.t('reservation.selectDate')}</Text>
              <TouchableOpacity onPress={onClose}>
                <Feather name="x" size={24} color={color} />
              </TouchableOpacity>
            </View>

            <DatePicker
              mode="calendar"
              isGregorian={true}
              locale={getSupportedLocale(i18n.locale ?? 'en')}
              configs={getConfigs()}
              onSelectedChange={handleDateChange}
              onDateChange={() => {}} 
              current={getCurrentDate()}
              selected={selectedDate || startDate || ''}
              minimumDate={getMinimumDate()}
              options={{
                backgroundColor: '#FFF',
                textHeaderColor: '#000',
                textDefaultColor: '#000',
                selectedTextColor: '#FFF',
                mainColor: color,
                textSecondaryColor: '#666',
                borderColor: `${color}33`,
                defaultFont: 'System',
                headerFont: 'System',
              }}
              style={{
                borderRadius: 8,
              }}
            />

            {/* Confirmation button */}
            <View style={styles.pickerFooter}>
              <TouchableOpacity
                style={[styles.confirmButton, { backgroundColor: color }]}
                onPress={handleConfirm}
                disabled={!selectedDate}
              >
                <Text style={styles.confirmButtonText}>
                  {i18n.t('reservation.confirm') || 'Confirm'}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerContainer: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#F8F8F8',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  pickerFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#F8F8F8',
  },
  confirmButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DatePickerModal;

