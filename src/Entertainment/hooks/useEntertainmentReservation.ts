import { NavigationProp, useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import i18n from '../../translations/i18n';
import { RootStackParamList } from '../../types/navigation';
import { Entertainment, EntertainmentPricing } from '../types/Entertainment';
import api from '../../service/ApiProxy';
import { registerPaywallCallback } from '../../payment/utils/callbackRegistry';
import { trackEvent } from '../../service/Mixpanel';

interface UseEntertainmentReservationParams {
  onClose: () => void;
  entertainment: Entertainment;
}

export const useEntertainmentReservation = ({
  onClose,
  entertainment,
}: UseEntertainmentReservationParams) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const isDevMode = __DEV__;

  const [selectedPricing, setSelectedPricing] = useState<EntertainmentPricing | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const formatDisplayDate = useCallback((dateInput: string | Date) => {
    if (!dateInput) return '';

    try {
      let date: Date;

      if (typeof dateInput === 'string') {
        const [year, month, day] = dateInput.split('/');
        date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
      } else {
        date = dateInput;
      }

      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      const dayName = days[date.getDay()];
      const dayNum = date.getDate().toString().padStart(2, '0');
      const monthName = months[date.getMonth()];

      return `${dayName} ${dayNum} ${monthName}`;
    } catch (error) {
      return typeof dateInput === 'string' ? dateInput : format(dateInput, 'MMM dd, yyyy');
    }
  }, []);

  const handleDateSelect = useCallback((date: string) => {
    const [year, month, day] = date.split('/');
    const newDate = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
    setSelectedDate(newDate);
    setShowDatePicker(false);
  }, []);

  const handleTimeConfirm = useCallback((hour: number, minute: number) => {
    const baseDate = selectedDate ? new Date(selectedDate) : new Date();
    baseDate.setHours(hour);
    baseDate.setMinutes(minute);
    baseDate.setSeconds(0);
    baseDate.setMilliseconds(0);

    setSelectedTime(baseDate);
    setShowTimePicker(false);
  }, [selectedDate]);

  const handleTimeCancel = useCallback(() => {
    setShowTimePicker(false);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!selectedPricing) {
      Alert.alert(
        i18n.t('reservation.errorTitle') || 'Error',
        'Please select a pricing option'
      );
      return;
    }

    if (!selectedDate || !selectedTime) {
      Alert.alert(
        i18n.t('reservation.errorTitle') || 'Error',
        i18n.t('reservation.pleaseSelectDateAndTime') || 'Please select date and time'
      );
      return;
    }

    if (!user) {
      navigation.navigate('Login');
      return;
    }

    // Combine date and time into format "yyyy-MM-dd HH:mm"
    const reservationDateTime = new Date(selectedDate);
    reservationDateTime.setHours(selectedTime.getHours());
    reservationDateTime.setMinutes(selectedTime.getMinutes());
    reservationDateTime.setSeconds(0);
    reservationDateTime.setMilliseconds(0);
    
    // Format as "yyyy-MM-dd HH:mm" (e.g., "2025-12-20 10:00")
    const reservationDateFormatted = format(reservationDateTime, "yyyy-MM-dd HH:mm");

    const reservationPayload = {
      email: user.email,
      reservationDate: reservationDateFormatted,
      selectedPricingId: selectedPricing.id,
    };

    const handleReservationFailure = (reason: string, extra?: Record<string, unknown>) => {
      trackEvent('Entertainment_Reservation_Failed', {
        entertainmentId: entertainment.id || entertainment.code,
        entertainmentName: entertainment.name || entertainment.title,
        reason,
        ...extra,
      });
      Alert.alert(
        i18n.t('reservation.errorTitle') || 'Error',
        i18n.t('reservation.bookingFailed') || 'Failed to book reservation',
        [{ text: i18n.t('common.close') || 'Close' }]
      );
    };

    const completeReservation = async (orderId?: string) => {
      try {
        const entertainmentId = entertainment.id || entertainment.code;
        const payloadWithOrder = { ...reservationPayload, orderId };

        if (isDevMode) {
          console.log('Entertainment Reservation Payload:', payloadWithOrder);
        }

        // Make POST request to /entertainments/:id/reservations
        await api.post(`/entertainments/${entertainmentId}/reservations`, payloadWithOrder);

        trackEvent('Entertainment_Reservation_Success', {
          entertainmentId,
          entertainmentName: entertainment.name || entertainment.title,
          pricingCategory: selectedPricing.category,
          price: selectedPricing.price,
          reservationDate: reservationDateFormatted,
          status: 'success'
        });

        Alert.alert(
          i18n.t('reservation.success') || 'Success',
          i18n.t('reservation.bookingConfirmed') || 'Your reservation has been confirmed',
          [{ text: i18n.t('common.close') || 'Close', onPress: onClose }]
        );
      } catch (error: any) {
        console.error('Failed to book entertainment:', error);
        const errorMessage = error.response?.data?.message || error.message || i18n.t('reservation.bookingFailed') || 'Failed to book reservation';
        handleReservationFailure('booking_error', {
          error: errorMessage,
        });
      }
    };

    // Track reservation attempt
    trackEvent('Entertainment_Reservation_Opened', {
      entertainmentId: entertainment.id || entertainment.code,
      entertainmentName: entertainment.name || entertainment.title,
      pricingCategory: selectedPricing.category,
      price: selectedPricing.price,
    });

    onClose();

    if (isDevMode) {
      // In dev mode, send the POST request without orderId
      setLoading(true);
      try {
        await completeReservation();
      } catch (error) {
        // Error handling is done in completeReservation
        console.error('Dev mode reservation failed:', error);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Production mode: navigate to payment
    const onSuccessCallbackId = registerPaywallCallback(async (orderId, status) => {
      if (status === 'failure') {
        handleReservationFailure('payment_failed');
        return;
      }

      setLoading(true);
      await completeReservation(orderId);
      setLoading(false);
    });

    // Create description with entertainment name and pricing plan
    const getPricingLabel = (category: string) => {
      return category.charAt(0) + category.slice(1).toLowerCase();
    };

    const description = `${entertainment.name || entertainment.title} - ${getPricingLabel(selectedPricing.category)} (${selectedPricing.duration} min)`;

    navigation.navigate('PaymentCheckout', {
      amount: selectedPricing.price,
      clientId: user.id,
      description,
      onSuccessCallbackId
    });
  }, [selectedPricing, selectedDate, selectedTime, user, entertainment, navigation, onClose, isDevMode]);

  return {
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
  };
};

