import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import React from 'react';
import { Image, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Button from '../../components/Button';
import DatePickerModal from '../../Pickup/components/DatePickerModal';
import { TimePickerModal } from '../../Pickup/components/TimePickerModal';
import i18n from '../../translations/i18n';
import { Entertainment, EntertainmentPricing } from '../types/Entertainment';
import { useEntertainmentReservation } from '../hooks/useEntertainmentReservation';

interface EntertainmentReservationPopupProps {
  visible: boolean;
  onClose: () => void;
  entertainment: Entertainment;
}

const EntertainmentReservationPopup: React.FC<EntertainmentReservationPopupProps> = ({
  visible,
  onClose,
  entertainment,
}) => {
  const {
    selectedPricing,
    setSelectedPricing,
    selectedDate,
    selectedTime,
    showTimePicker,
    showDatePicker,
    setShowTimePicker,
    setShowDatePicker,
    loading,
    formatDisplayDate,
    handleDateSelect,
    handleTimeConfirm,
    handleTimeCancel,
    handleSubmit,
  } = useEntertainmentReservation({ onClose, entertainment });

  const getPricingLabel = (category: string) => {
    return category.charAt(0) + category.slice(1).toLowerCase();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.popup}>
          <View style={styles.header}>
            <Text style={styles.title}>{i18n.t('entertainment.bookReservation')}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <View style={styles.formContainer}>
            <View>
              {/* Entertainment Info */}
              <View style={styles.entertainmentInfo}>
                <Text style={styles.entertainmentName}>{entertainment.name || entertainment.title}</Text>
                {entertainment.address && (
                  <Text style={styles.entertainmentAddress}>{entertainment.address}</Text>
                )}
              </View>

              {/* Pricing Selection */}
              {entertainment.pricings && entertainment.pricings.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>{i18n.t('entertainment.pricing') || 'Select Pricing'}</Text>
                  <View style={styles.pricingContainer}>
                    {entertainment.pricings.map((pricing: EntertainmentPricing) => {
                      const isSelected = selectedPricing?.id === pricing.id;
                      return (
                        <TouchableOpacity
                          key={pricing.id}
                          style={[
                            styles.pricingOption,
                            isSelected && styles.pricingOptionSelected,
                          ]}
                          onPress={() => setSelectedPricing(pricing)}
                          activeOpacity={0.7}
                        >
                          {!isSelected && (
                            <Ionicons name="radio-button-off" size={20} color="#999" style={styles.radioIcon} />
                          )}
                          {isSelected && (
                            <Ionicons name="checkmark-circle" size={20} color="#AE1913" style={styles.checkIcon} />
                          )}
                          <View style={styles.pricingInfo}>
                            <Text style={[
                              styles.pricingCategory,
                              isSelected && styles.pricingCategorySelected,
                            ]}>
                              {getPricingLabel(pricing.category)}
                            </Text>
                            <Text style={styles.pricingDetails}>
                              {pricing.duration} min • {pricing.unitLabel}
                            </Text>
                          </View>
                          <Text style={[
                            styles.pricingPrice,
                            isSelected && styles.pricingPriceSelected,
                          ]}>
                            {pricing.price % 1 === 0 ? pricing.price.toString() : pricing.price.toFixed(2)} MAD
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </>
              )}

              {/* Date Selection */}
              <Text style={styles.sectionTitle}>{i18n.t('reservation.whenAreYouArriving') || 'When are you arriving?'}</Text>
              <View style={styles.dateTimeContainer}>
                <View style={styles.dateContainer}>
                  <Text style={styles.inputLabel}>{i18n.t('reservation.date') || 'Date'}</Text>
                  <TouchableOpacity
                    style={styles.dateInput}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Ionicons name="calendar" size={20} color="#666" style={styles.inputIcon} />
                    <Text style={styles.dateTimeText}>
                      {selectedDate ? formatDisplayDate(selectedDate) : i18n.t('reservation.selectDate') || 'Select Date'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.timeContainer}>
                  <Text style={styles.inputLabel}>{i18n.t('reservation.time') || 'Time'}</Text>
                  <TouchableOpacity
                    style={styles.timeInput}
                    onPress={() => setShowTimePicker(true)}
                  >
                    <Ionicons name="time" size={20} color="#666" style={styles.inputIcon} />
                    <Text style={styles.dateTimeText}>
                      {selectedTime ? format(selectedTime, 'hh:mm a') : i18n.t('reservation.selectTime') || 'Select Time'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <Image 
              source={require('../../Pickup/assets/payment.png')} 
              style={styles.paymentImage}
              resizeMode="contain"
            />
          </View>

          {/* Fixed footer with confirm button */}
          <View style={styles.fixedFooter}>
            <Button
              title={i18n.t('reservation.confirmReservation') || 'Confirm Reservation'}
              style={styles.confirmButton}
              icon={<Ionicons name="checkmark-circle" size={20} color="#fff" style={{ marginRight: 8 }} />}
              onPress={handleSubmit}
              loading={loading}
              disabled={loading || !selectedPricing || !selectedDate || !selectedTime}
            />
          </View>
        </View>

        {/* Date picker */}
        <DatePickerModal
          visible={showDatePicker}
          onClose={() => setShowDatePicker(false)}
          startDate={selectedDate ? format(selectedDate, 'yyyy/MM/dd') : format(new Date(), 'yyyy/MM/dd')}
          onDateSelect={handleDateSelect}
          formatDisplayDate={formatDisplayDate}
          color="#008060"
        />
        <TimePickerModal
          visible={showTimePicker}
          onClose={handleTimeCancel}
          onConfirm={handleTimeConfirm}
          initialHour={selectedTime?.getHours()}
          initialMinute={selectedTime?.getMinutes()}
        />
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  popup: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    flexDirection: 'column',
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 14,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    flex: 1,
  },
  closeButton: {
    padding: 4,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
  },
  entertainmentInfo: {
    marginVertical: 12,
  },
  entertainmentName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  entertainmentAddress: {
    fontSize: 14,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  pricingContainer: {
    marginBottom: 12,
  },
  pricingOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#F6FAFF',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  radioIcon: {
    marginRight: 12,
  },
  pricingOptionSelected: {
    backgroundColor: '#FFF5F5',
    borderColor: '#AE1913',
    borderStyle: 'solid',
    borderWidth: 2,
  },
  pricingInfo: {
    flex: 1,
  },
  pricingCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  pricingCategorySelected: {
    color: '#AE1913',
  },
  pricingDetails: {
    fontSize: 13,
    color: '#666',
  },
  pricingPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#006400',
    marginRight: 8,
  },
  pricingPriceSelected: {
    color: '#AE1913',
  },
  checkIcon: {
    marginRight: 12,
  },
  formContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
    paddingBottom: 60,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dateContainer: {
    flex: 1,
    marginRight: 8,
  },
  timeContainer: {
    flex: 1,
    marginLeft: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 2,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    backgroundColor: '#f9f9f9',
    width: '100%',
  },
  timeInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    backgroundColor: '#f9f9f9',
    width: '100%',
  },
  inputIcon: {
    marginRight: 8,
  },
  dateTimeText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    marginLeft: 8,
    textAlignVertical: 'center',
  },
  fixedFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    zIndex: 20,
  },
  paymentImage: {
    width: '100%',
    height: 50,
    alignSelf: 'center',
  },
  confirmButton: {
    backgroundColor: '#008060',
  },
});

export default EntertainmentReservationPopup;
