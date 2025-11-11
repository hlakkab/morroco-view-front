import { NavigationProp, useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';
import { useCallback, useEffect, useRef } from 'react';
import { Alert, Keyboard, ScrollView } from 'react-native';

import { useAuth } from '../../contexts/AuthContext';
import i18n from '../../translations/i18n';
import { RootStackParamList } from '../../types/navigation';
import { trackEvent } from '../../service/Mixpanel';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { bookPickupReservation, resetBookingStatus } from '../store/hotelPickupDetailsSlice';
import { useReservationTour } from './useReservationTour';
import { useReservationForm } from './useReservationForm';
import { useMapControls } from './useMapControls';
import { useLocationSearch } from './useLocationSearch';
import { registerPaywallCallback } from '../../payment/utils/callbackRegistry';

interface UseReservationPopupParams {
  onClose: () => void;
  title: string;
  price: number;
  pickupId: string;
  currency?: string;
}

export const useReservationPopup = ({
  onClose,
  title,
  price,
  pickupId,
  currency,
}: UseReservationPopupParams) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();
  const scrollViewRef = useRef<ScrollView>(null);
  const { user } = useAuth();

  const { bookingStatus, bookingError } = useAppSelector(
    (state) => state.hotelPickupDetails
  );
  const selectedCity = useAppSelector(
    (state) => state.hotelPickup.selectedCity
  );
  const pickupDirection = useAppSelector(
    (state) => state.hotelPickup.pickupDirection
  );

  const { visible, handleStartTour } = useReservationTour();
  const {
    selectedDate,
    setSelectedDate,
    selectedTime,
    setSelectedTime,
    hotelLocation,
    setHotelLocation,
    destination,
    setDestination,
    showTimePicker,
    setShowTimePicker,
    showModernDatePicker,
    setShowModernDatePicker,
  } = useReservationForm();

  const {
    mapRef,
    mapVisible,
    setMapVisible,
    mapRegion,
    setMapRegion,
    zoomIn,
    zoomOut,
    animateToRegion,
  } = useMapControls();

  const enhancedLocationSelect = useCallback((location: {
    latitude: number;
    longitude: number;
    address: string;
  }) => {
    setDestination([location.longitude, location.latitude]);
    setHotelLocation(location.address);

    const newRegion = {
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };

    setMapRegion(newRegion);
    setMapVisible(true);

    Keyboard.dismiss();
    setTimeout(() => {
      animateToRegion(newRegion);
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 400, animated: true });
      }
    }, 300);
  }, [animateToRegion, setDestination, setHotelLocation, setMapRegion, setMapVisible]);

  const {
    googlePlacesRef,
    handleLocationSelect,
    handleClearLocation: clearLocationSearch,
  } = useLocationSearch({
    onLocationSelect: enhancedLocationSelect,
  });

  const handleClearLocation = useCallback(() => {
    setHotelLocation('');
    setDestination(null);
    setMapVisible(false);
    clearLocationSearch();
  }, [clearLocationSearch, setDestination, setHotelLocation, setMapVisible]);

  useEffect(() => {
    dispatch(resetBookingStatus());
  }, [dispatch]);

  useEffect(() => {
    if (bookingStatus === 'succeeded') {
      onClose();
    }
  }, [bookingStatus, onClose]);

  useEffect(() => {
    trackEvent('Pickup_Reservation_Opened', {
      pickupId,
      title,
      price,
      direction: pickupDirection
    });
  }, [pickupDirection, pickupId, price, title]);

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
    setShowModernDatePicker(false);
  }, [setSelectedDate, setShowModernDatePicker]);

  const handleTimeConfirm = useCallback((time: Date) => {
    if (!(time instanceof Date) || Number.isNaN(time.getTime())) {
      return;
    }

    const baseDate = selectedDate ? new Date(selectedDate) : new Date();
    baseDate.setHours(time.getHours());
    baseDate.setMinutes(time.getMinutes());
    baseDate.setSeconds(0);
    baseDate.setMilliseconds(0);

    setSelectedTime(baseDate);
    setShowTimePicker(false);
  }, [selectedDate, setSelectedTime, setShowTimePicker]);

  const handleTimeCancel = useCallback(() => {
    setShowTimePicker(false);
  }, [setShowTimePicker]);

  const handleSubmit = useCallback(() => {
    if (!selectedDate || !selectedTime || !destination) {
      return;
    }

    if (!user) {
      navigation.navigate('Login');
      return;
    }

    const reservationPayload = {
      pickupId,
      pickupDate: format(selectedDate, 'yyyy-MM-dd'),
      pickupTime: format(selectedTime, 'HH:mm'),
      destination,
    };

    const onSuccessCallbackId = registerPaywallCallback(async (orderId, status) => {
      try {
        const payloadWithOrder = { ...reservationPayload, orderId };
        await dispatch(bookPickupReservation(payloadWithOrder)).unwrap();

        trackEvent('Pickup_Reservation_Success', {
          pickupId,
          pickupDate: reservationPayload.pickupDate,
          pickupTime: reservationPayload.pickupTime,
          direction: pickupDirection,
          location: hotelLocation,
          status
        });

        Alert.alert(
          i18n.t('reservation.success'),
          i18n.t('reservation.bookingConfirmed'),
          [{ text: i18n.t('common.close'), onPress: onClose }]
        );
      } catch (error) {
        trackEvent('Pickup_Reservation_Failed', {
          pickupId,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        console.error('Failed to book pickup:', error);
        Alert.alert(
          i18n.t('reservation.errorTitle'),
          i18n.t('reservation.bookingFailed'),
          [{ text: i18n.t('common.close') }]
        );
      }
    });

    navigation.navigate('PaymentCheckout', {
      amount: price,
      clientId: user.id,
      description: `${title} pickup reservation`,
      onSuccessCallbackId
    });
  }, [
    destination,
    dispatch,
    hotelLocation,
    navigation,
    onClose,
    pickupDirection,
    pickupId,
    price,
    selectedDate,
    selectedTime,
    title,
    user
  ]);

  return {
    bookingStatus,
    bookingError,
    selectedCity,
    pickupDirection,
    visible,
    handleStartTour,
    selectedDate,
    selectedTime,
    hotelLocation,
    destination,
    showTimePicker,
    showModernDatePicker,
    setShowModernDatePicker,
    setShowTimePicker,
    mapRef,
    mapVisible,
    mapRegion,
    zoomIn,
    zoomOut,
    googlePlacesRef,
    onLocationSelect: handleLocationSelect,
    handleClearLocation,
    formatDisplayDate,
    handleDateSelect,
    handleTimeConfirm,
    handleTimeCancel,
    handleSubmit,
    scrollViewRef,
  };
};

export type UseReservationPopupReturn = ReturnType<typeof useReservationPopup>;

