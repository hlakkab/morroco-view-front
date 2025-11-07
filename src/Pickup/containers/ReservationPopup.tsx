import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import React, { useEffect, useRef } from 'react';
import { Alert, Dimensions, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CopilotProvider, CopilotStep, walkthroughable } from 'react-native-copilot';
import "react-native-get-random-values";
import Button from '../../components/Button';
import DatePickerModal from '../components/DatePickerModal';
import { DirectionSelector } from '../components/DirectionSelector';
import { LocationSearchInput } from '../components/LocationSearchInput';
import { MapDisplay } from '../components/MapDisplay';
import { RouteDisplay } from '../components/RouteDisplay';
import { TransportInfo } from '../components/TransportInfo';
import { useLocationSearch } from '../hooks/useLocationSearch';
import { useMapControls } from '../hooks/useMapControls';
import { useReservationForm } from '../hooks/useReservationForm';
import { useReservationTour } from '../hooks/useReservationTour';
import { trackEvent } from '../../service/Mixpanel';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { bookPickupReservation, resetBookingStatus } from '../store/hotelPickupDetailsSlice';
import { togglePickupDirection } from '../store/hotelPickupSlice';
import i18n from '../../translations/i18n';

// Create walkthroughable components
const WalkthroughableView = walkthroughable(View);

interface ReservationPopupProps {
  onClose: () => void;
  title: string;
  price: number;
  pickupId: string;
}

const ReservationPopupContent = ({ onClose, title, price, pickupId }: ReservationPopupProps) => {
  const dispatch = useAppDispatch();
  const scrollViewRef = useRef<ScrollView>(null);
  
  const { bookingStatus, bookingError } = useAppSelector(
    (state) => state.hotelPickupDetails
  );
  const selectedCity = useAppSelector(
    (state) => state.hotelPickup.selectedCity
  );
  const pickupDirection = useAppSelector(
    (state) => state.hotelPickup.pickupDirection
  );

  // Custom hooks
  const { visible, handleStartTour } = useReservationTour();
  const {
    selectedDate,
    setSelectedDate,
    selectedTime,
    hotelLocation,
    setHotelLocation,
    destination,
    setDestination,
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

  const {
    googlePlacesRef,
    handleLocationSelect: onLocationSelect,
    handleClearLocation: clearLocation,
  } = useLocationSearch({
    onLocationSelect: (location) => {
      setDestination([location.longitude, location.latitude]);
      setHotelLocation(location.address);

      // Set the initial map region with appropriate deltas for zoom
      const newRegion = {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

      setMapRegion(newRegion);
      setMapVisible(true);

      // Dismiss keyboard and scroll to map
      Keyboard.dismiss();
      setTimeout(() => {
        animateToRegion(newRegion);
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({ y: 400, animated: true });
        }
      }, 300);
    },
  });

  const handleClearLocation = () => {
    setHotelLocation('');
    setDestination(null);
    setMapVisible(false);
    clearLocation();
  };

  // Effects
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {});
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {});

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  useEffect(() => {
    dispatch(resetBookingStatus());
  }, [dispatch]);

  useEffect(() => {
    if (bookingStatus === 'succeeded') {
      onClose();
    }
  }, [bookingStatus, onClose]);

  // Track when reservation popup is opened
  useEffect(() => {
    trackEvent('Pickup_Reservation_Opened', {
      pickupId,
      title,
      price,
      direction: pickupDirection
    });
  }, []);

  const handleToggleDirection = () => {
    dispatch(togglePickupDirection());
    trackEvent('Pickup_Direction_Toggled', {
      pickupId,
      newDirection: pickupDirection === 'a2h' ? 'h2a' : 'a2h'
    });
  };

  // Format date for display
  const formatDisplayDate = (dateInput: string | Date) => {
    if (!dateInput) return '';

    try {
      let date: Date;

      if (typeof dateInput === 'string') {
        const [year, month, day] = dateInput.split('/');
        date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } else {
        date = dateInput;
      }

      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      const dayName = days[date.getDay()];
      const dayNum = date.getDate().toString().padStart(2, '0');
      const monthName = months[date.getMonth()];

      return `${dayName} ${dayNum} ${monthName}`;
    } catch (e) {
      return typeof dateInput === 'string' ? dateInput : format(dateInput, 'MMM dd, yyyy');
    }
  };

  // Handle date selection from modern date picker
  const handleDateSelect = (date: string) => {
    const [year, month, day] = date.split('/');
    const newDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    setSelectedDate(newDate);
    setShowModernDatePicker(false);
  };

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime || !destination) {
      return;
    }

    try {
      await dispatch(bookPickupReservation({
        pickupId,
        pickupDate: format(selectedDate, 'yyyy-MM-dd'),
        pickupTime: format(selectedTime, 'HH:mm'),
        destination,
      })).unwrap();

      // Track successful reservation
      trackEvent('Pickup_Reservation_Success', {
        pickupId,
        pickupDate: format(selectedDate, 'yyyy-MM-dd'),
        pickupTime: format(selectedTime, 'HH:mm'),
        direction: pickupDirection,
        location: hotelLocation
      });

      Alert.alert(
        i18n.t('reservation.success'),
        i18n.t('reservation.bookingConfirmed'),
        [{ text: i18n.t('common.close'), onPress: onClose }]
      );
    } catch (error) {
      // Track failed reservation
      trackEvent('Pickup_Reservation_Failed', {
        pickupId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      console.error('Failed to book pickup:', error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.popup}>
        <View style={styles.fixedHeader}>
          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
              {i18n.t('reservation.reservePickup')}
            </Text>
          </View>
          <View style={styles.headerRightContainer}>
            {!visible && (
              <TouchableOpacity style={styles.tourButton} onPress={handleStartTour}>
                <Ionicons name="information-circle-outline" size={20} color="#FFF" />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.divider} />

        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollContent}
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <TransportInfo title={title} price={price} />
            <DirectionSelector pickupDirection={pickupDirection} />
            <RouteDisplay pickupDirection={pickupDirection} selectedCity={selectedCity} />
          </View>
        </ScrollView>

        <View style={styles.formContainer}>
          <CopilotStep
            text={i18n.t('copilot.completeReservation')}
            order={2}
            name="reservationSteps"
          >
            <WalkthroughableView style={styles.enhancedHighlight}>
              <View>
                <Text style={styles.sectionTitle}>{i18n.t('reservation.whenAreYouArriving')}</Text>

                <View style={styles.dateTimeContainer}>
                  <View style={styles.dateContainer}>
                    <Text style={styles.inputLabel}>{i18n.t('reservation.date')}</Text>
                    <TouchableOpacity
                      style={styles.dateInput}
                      onPress={() => setShowModernDatePicker(true)}
                    >
                      <Ionicons name="calendar" size={20} color="#666" style={styles.inputIcon} />
                      <Text style={styles.dateTimeText}>
                        {selectedDate ? formatDisplayDate(selectedDate) : i18n.t('reservation.selectDate')}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.timeContainer}>
                    <Text style={styles.inputLabel}>{i18n.t('reservation.time')}</Text>
                    <TouchableOpacity
                      style={styles.timeInput}
                      onPress={() => setShowModernDatePicker(true)}
                    >
                      <Ionicons name="time" size={20} color="#666" style={styles.inputIcon} />
                      <Text style={styles.dateTimeText}>
                        {selectedTime ? format(selectedTime, 'hh:mm a') : i18n.t('reservation.selectTime')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={styles.sectionTitle}>{i18n.t('reservation.whereAreYouStaying')}</Text>

                <LocationSearchInput
                  googlePlacesRef={googlePlacesRef}
                  onLocationSelect={onLocationSelect}
                  onClearLocation={handleClearLocation}
                />

                <MapDisplay
                  mapVisible={mapVisible}
                  mapRef={mapRef}
                  mapRegion={mapRegion}
                  destination={destination}
                  hotelLocation={hotelLocation}
                  onZoomIn={zoomIn}
                  onZoomOut={zoomOut}
                />
              </View>
            </WalkthroughableView>
          </CopilotStep>

          {bookingError && (
            <Text style={styles.errorText}>{bookingError}</Text>
          )}
        </View>

        {/* Fixed footer with confirm button */}
        <View style={styles.fixedFooter}>
          <CopilotStep
            text={i18n.t('copilot.confirmReservation')}
            order={3}
            name="confirmButton"
          >
            <WalkthroughableView style={styles.enhancedHighlight}>
              <Button
                title={i18n.t('reservation.confirmReservation')}
                style={styles.confirmButton}
                icon={<Ionicons name="checkmark-circle" size={20} color="#fff" style={{ marginRight: 8 }} />}
                onPress={handleSubmit}
                loading={bookingStatus === 'loading'}
                disabled={bookingStatus === 'loading' || !destination}
              />
            </WalkthroughableView>
          </CopilotStep>
        </View>
      </View>

      {/* Date picker */}
      <DatePickerModal
        visible={showModernDatePicker}
        onClose={() => setShowModernDatePicker(false)}
        startDate={format(selectedDate, 'yyyy/MM/dd')}
        onDateSelect={handleDateSelect}
        formatDisplayDate={formatDisplayDate}
        color="#008060"
      />
    </KeyboardAvoidingView>
  );
};

// Wrap the content with CopilotProvider
const ReservationPopup = (props: ReservationPopupProps) => {
  return (
    <CopilotProvider
      stepNumberComponent={() => null}
      tooltipStyle={styles.tooltip}
      backdropColor="rgba(0, 0, 0, 0.7)"
      animationDuration={300}
      overlay="svg"
      stopOnOutsideClick={true}
      labels={{
        skip: i18n.t('common.skip'),
        previous: i18n.t('common.previous'),
        next: i18n.t('common.next'),
        finish: i18n.t('common.done')
      }}
      arrowSize={8}
      arrowColor="#FFF7F7"
      verticalOffset={0}
      androidStatusBarVisible={true}
    >
      <ReservationPopupContent {...props} />
    </CopilotProvider>
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
  fixedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 14,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    zIndex: 10,
  },
  titleContainer: {
    flex: 1,
    marginRight: 16,
    flexDirection: 'row',
  },
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  tourButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 25,
    paddingVertical: 5,
    paddingHorizontal: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  scrollContent: {
    flexGrow: 0,
    maxHeight: 220,
  },
  scrollContainer: {},
  divider: {
    height: 1,
    backgroundColor: '#eee',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  enhancedHighlight: {
    width: '100%',
    borderRadius: 8,
    overflow: 'visible',
    backgroundColor: 'transparent',
    padding: 2,
    marginBottom: 0,
    zIndex: 100,
  },
  tooltip: {
    backgroundColor: '#F7F7F7',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#333',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    borderWidth: 4,
    borderColor: '#CE1126',
    width: '85%',
  },
  formContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
    paddingBottom: 60,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
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
  },
  inputIcon: {
    marginRight: 8,
  },
  errorText: {
    color: '#CE1126',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  dateTimeText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    marginLeft: 8,
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
  confirmButton: {
    backgroundColor: '#008060',
  },
});

export default ReservationPopup;
