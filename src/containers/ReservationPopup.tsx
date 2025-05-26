import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Dimensions, Keyboard, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { CopilotProvider, CopilotStep, useCopilot, walkthroughable } from 'react-native-copilot';
import "react-native-get-random-values";
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import MapView, { Marker, PROVIDER_DEFAULT, Region } from 'react-native-maps';
import Button from '../components/Button';
import DatePickerModal from '../components/DatePickerModal';
import { trackEvent } from '../service/Mixpanel';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { bookPickupReservation, resetBookingStatus } from '../store/hotelPickupDetailsSlice';
import { togglePickupDirection } from '../store/hotelPickupSlice';
import i18n from '../translations/i18n';

const TOUR_FLAG = '@reservationPopupTourSeen';

// Create walkthroughable components
const WalkthroughableView = walkthroughable(View);

interface ReservationPopupProps {
  onClose: () => void;
  title: string;
  price: number;
  pickupId: string;
}

const ReservationPopupContent = ({ onClose, title, price, pickupId }: ReservationPopupProps) => {
  const mapRef = useRef<MapView | null>(null);
  const dispatch = useAppDispatch();
  const { bookingStatus, bookingError } = useAppSelector(
    (state) => state.hotelPickupDetails
  );
  const selectedCity = useAppSelector(
    (state) => state.hotelPickup.selectedCity
  );
  const { start: startTour, copilotEvents, visible } = useCopilot();
  const [tourStarted, setTourStarted] = useState(false);
  const [hasSeenTour, setHasSeenTour] = useState<boolean | null>(null);

  const pickupDirection = useAppSelector(
    (state) => state.hotelPickup.pickupDirection
  );

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [hotelLocation, setHotelLocation] = useState('');
  const [destination, setDestination] = useState<[number, number] | null>(null);
  const [showModernDatePicker, setShowModernDatePicker] = useState(false);
  const [passengers, setPassengers] = useState(1);
  const [luggage, setLuggage] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [mapVisible, setMapVisible] = useState(false);
  const [mapRegion, setMapRegion] = useState<Region | null>(null);
  const [showLocationInput, setShowLocationInput] = useState(true);

  // Replace isLocationSearchActive with a ref for GooglePlacesAutocomplete
  const googlePlacesRef = useRef(null);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      // Additional handling if needed when keyboard shows
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      // Additional handling if needed when keyboard hides
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  useEffect(() => {
    // Reset booking status when component mounts
    dispatch(resetBookingStatus());
  }, [dispatch]);

  useEffect(() => {
    // Handle successful booking
    if (bookingStatus === 'succeeded') {
      onClose();
    }
  }, [bookingStatus, onClose]);

  useEffect(() => {
    console.log('ReservationPopup - Current pickup direction:', pickupDirection);
    console.log('ReservationPopup - City:', selectedCity);
  }, [pickupDirection, selectedCity]);

  // ─── 1. Lire si le tour a déjà été vu ─────────────────
  useEffect(() => {
    AsyncStorage.getItem(TOUR_FLAG)
      .then(value => {
        console.log('Reservation Popup Tour seen status:', value);
        setHasSeenTour(value === 'true');
      })
      .catch(error => {
        console.error('Error reading Reservation Popup tour status:', error);
        setHasSeenTour(false);
      });
  }, []);

  // ─── 2. Démarrage automatique une seule fois ──────────
  useEffect(() => {
    console.log('Tour conditions:', {
      hasSeenTour,
      tourStarted,
      visible
    });

    if (hasSeenTour === false && !tourStarted && !visible) {
      console.log('Starting Reservation Popup tour automatically...');
      const timer = setTimeout(() => {
        startTour();
        setTourStarted(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [hasSeenTour, startTour, tourStarted, visible]);

  // ─── 3. Enregistrer la fin ou le skip du tour ────────
  useEffect(() => {
    const handleStop = async () => {
      console.log('Reservation Popup Tour stopped, saving status...');
      try {
        await AsyncStorage.setItem(TOUR_FLAG, 'true');
        setHasSeenTour(true);
        setTourStarted(false);
        console.log('Reservation Popup Tour status saved successfully');
      } catch (error) {
        console.error('Error saving Reservation Popup tour status:', error);
      }
    };

    const handleStepChange = (step: any) => {
      console.log('Step changed to:', step);
    };

    copilotEvents.on('stop', handleStop);
    copilotEvents.on('stepChange', handleStepChange);

    return () => {
      copilotEvents.off('stop', handleStop);
      copilotEvents.off('stepChange', handleStepChange);
    };
  }, [copilotEvents]);
  
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
    // Track direction toggle
    trackEvent('Pickup_Direction_Toggled', {
      pickupId,
      newDirection: pickupDirection === 'a2h' ? 'h2a' : 'a2h'
    });
  };

  // Custom date picker implementation
  const renderCustomDatePicker = () => {
    const today = new Date();
    const nextYear = new Date();
    nextYear.setFullYear(today.getFullYear() + 1);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = selectedDate.getMonth();
    const currentYear = selectedDate.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDatePicker(false)}
        >
          <View style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <View style={styles.pickerTitleContainer}>
                <Text style={styles.pickerTitle} numberOfLines={1}>{i18n.t('reservation.selectDate')}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowDatePicker(false)}
                style={styles.pickerCloseButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.pickerContent}>
              {/* Month Selector */}
              <View style={styles.pickerRow}>
                <Text style={styles.pickerLabel}>Month:</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.monthsContainer}
                >
                  {months.map((month, index) => (
                    <TouchableOpacity
                      key={month}
                      style={[
                        styles.monthItem,
                        currentMonth === index && styles.selectedItem
                      ]}
                      onPress={() => {
                        const newDate = new Date(selectedDate);
                        newDate.setMonth(index);
                        setSelectedDate(newDate);
                      }}
                    >
                      <Text
                        style={[
                          styles.monthText,
                          currentMonth === index && styles.selectedItemText
                        ]}
                      >
                        {month}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Day Selector */}
              <View style={styles.pickerRow}>
                <Text style={styles.pickerLabel}>Day:</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.daysContainer}
                >
                  {days.map((day) => (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.dayItem,
                        selectedDate.getDate() === day && styles.selectedItem
                      ]}
                      onPress={() => {
                        const newDate = new Date(selectedDate);
                        newDate.setDate(day);
                        setSelectedDate(newDate);
                      }}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          selectedDate.getDate() === day && styles.selectedItemText
                        ]}
                      >
                        {day}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Year Selector */}
              <View style={styles.pickerRow}>
                <Text style={styles.pickerLabel}>Year:</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.yearsContainer}
                >
                  {Array.from(
                    { length: 5 },
                    (_, i) => today.getFullYear() + i
                  ).map((year) => (
                    <TouchableOpacity
                      key={year}
                      style={[
                        styles.yearItem,
                        currentYear === year && styles.selectedItem
                      ]}
                      onPress={() => {
                        const newDate = new Date(selectedDate);
                        newDate.setFullYear(year);
                        setSelectedDate(newDate);
                      }}
                    >
                      <Text
                        style={[
                          styles.yearText,
                          currentYear === year && styles.selectedItemText
                        ]}
                      >
                        {year}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={styles.pickerActions}>
              <Button
                title="Confirm"
                style={styles.confirmPickerButton}
                onPress={() => setShowDatePicker(false)}
              />
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  // Custom time picker implementation
  const renderCustomTimePicker = () => {
    const hours = Array.from({ length: 12 }, (_, i) => i + 1);
    const minutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
    const periods = ['AM', 'PM'];

    const hour = selectedTime.getHours();
    const minute = selectedTime.getMinutes();
    const isPM = hour >= 12;
    const hour12 = hour % 12 || 12;

    return (
      <Modal
        visible={showTimePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowTimePicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowTimePicker(false)}
        >
          <View style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <View style={styles.pickerTitleContainer}>
                <Text style={styles.pickerTitle} numberOfLines={1}>{i18n.t('reservation.selectTime')}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowTimePicker(false)}
                style={styles.pickerCloseButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.pickerContent}>
              <View style={styles.timePickerRow}>
                {/* Hour Selector */}
                <View style={styles.timePickerColumn}>
                  <Text style={styles.pickerLabel}>{i18n.t('reservation.hour')}</Text>
                  <View style={styles.timePickerScrollWrapper}>
                    <ScrollView
                      showsVerticalScrollIndicator={true}
                      contentContainerStyle={styles.timePickerScrollContent}
                    >
                      {hours.map((h) => (
                        <TouchableOpacity
                          key={`hour-${h}`}
                          style={[
                            styles.timeItem,
                            hour12 === h && styles.selectedItem
                          ]}
                          onPress={() => {
                            const newTime = new Date(selectedTime);
                            const newHour = isPM ? (h % 12) + 12 : h % 12;
                            newTime.setHours(newHour);
                            setSelectedTime(newTime);
                          }}
                        >
                          <Text
                            style={[
                              styles.timeText,
                              hour12 === h && styles.selectedItemText
                            ]}
                          >
                            {h.toString().padStart(2, '0')}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </View>

                {/* Minute Selector */}
                <View style={styles.timePickerColumn}>
                  <Text style={styles.pickerLabel}>{i18n.t('reservation.minute')}</Text>
                  <View style={styles.timePickerScrollWrapper}>
                    <ScrollView
                      showsVerticalScrollIndicator={true}
                      contentContainerStyle={styles.timePickerScrollContent}
                    >
                      {minutes.map((m) => (
                        <TouchableOpacity
                          key={`minute-${m}`}
                          style={[
                            styles.timeItem,
                            Math.floor(minute / 5) * 5 === m && styles.selectedItem
                          ]}
                          onPress={() => {
                            const newTime = new Date(selectedTime);
                            newTime.setMinutes(m);
                            setSelectedTime(newTime);
                          }}
                        >
                          <Text
                            style={[
                              styles.timeText,
                              Math.floor(minute / 5) * 5 === m && styles.selectedItemText
                            ]}
                          >
                            {m.toString().padStart(2, '0')}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </View>

                {/* AM/PM Selector */}
                <View style={styles.timePickerColumn}>
                  <Text style={styles.pickerLabel}>{i18n.t('reservation.amPm')}</Text>
                  <View style={styles.amPmContainer}>
                    {periods.map((period) => (
                      <TouchableOpacity
                        key={period}
                        style={[
                          styles.periodItem,
                          (isPM ? 'PM' : 'AM') === period && styles.selectedItem
                        ]}
                        onPress={() => {
                          const newTime = new Date(selectedTime);
                          const currentHour = newTime.getHours();
                          const currentIsPM = currentHour >= 12;

                          if ((period === 'PM' && !currentIsPM) || (period === 'AM' && currentIsPM)) {
                            newTime.setHours((currentHour + 12) % 24);
                            setSelectedTime(newTime);
                          }
                        }}
                      >
                        <Text
                          style={[
                            styles.periodText,
                            (isPM ? 'PM' : 'AM') === period && styles.selectedItemText
                          ]}
                        >
                          {period}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.pickerActions}>
              <Button
                title={i18n.t('reservation.confirm')}
                style={styles.confirmPickerButton}
                onPress={() => setShowTimePicker(false)}
              />
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    );
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

  const handleLocationSelect = (data: any, details: any) => {
    const newLocation = {
      latitude: details.geometry.location.lat,
      longitude: details.geometry.location.lng,
      address: data.description,
    };

    setDestination([newLocation.longitude, newLocation.latitude]);
    setHotelLocation(newLocation.address);

    // Set the initial map region with appropriate deltas for zoom
    const newRegion = {
      latitude: newLocation.latitude,
      longitude: newLocation.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };

    setMapRegion(newRegion);
    setMapVisible(true);
    setShowLocationInput(false);

    // Dismiss keyboard and scroll to map
    Keyboard.dismiss();
    setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.animateToRegion(newRegion, 1000);
      }
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 400, animated: true });
      }
    }, 300);
  };

  const focusLocationSearch = () => {
    // Focus the GooglePlacesAutocomplete input
    if (googlePlacesRef.current) {
      // @ts-ignore - textInputRef doesn't exist in the type definitions
      googlePlacesRef.current.textInputRef?.focus();
    }
    setShowLocationInput(true);
  };

  // Zoom in function
  const zoomIn = () => {
    if (mapRef.current && mapRegion) {
      const newRegion = {
        ...mapRegion,
        latitudeDelta: mapRegion.latitudeDelta / 2,
        longitudeDelta: mapRegion.longitudeDelta / 2,
      };
      mapRef.current.animateToRegion(newRegion, 300);
    }
  };

  // Zoom out function
  const zoomOut = () => {
    if (mapRef.current && mapRegion) {
      const newRegion = {
        ...mapRegion,
        latitudeDelta: mapRegion.latitudeDelta * 2,
        longitudeDelta: mapRegion.longitudeDelta * 2,
      };
      mapRef.current.animateToRegion(newRegion, 300);
    }
  };

  const handleClearLocation = () => {
    setHotelLocation('');
    setDestination(null);
    setMapVisible(false);
    setShowLocationInput(true);
    // Focus the search input when clearing
    setTimeout(() => {
      focusLocationSearch();
    }, 100);
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

  // Add a button to manually start the tour
  const handleStartTour = () => {
    setTourStarted(true);
    startTour();
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
            {/* Manual tour button styled like in ScreenHeader */}
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
            <View style={styles.transportInfo}>
              <View style={styles.iconContainer}>
                <Ionicons name="car" size={28} color="#fff" />
              </View>
              <View style={styles.transportDetails}>
                <Text style={styles.transportTitle}>{title}</Text>
                <Text style={styles.transportPrice}>{price} € {i18n.t('pickup.perGroup')}</Text>
              </View>
            </View>

            {/* Direction switch control */}
            <CopilotStep
              text={i18n.t('copilot.selectedDirection')}
              order={1}
              name="directionSelector"
            >
              <WalkthroughableView style={styles.enhancedHighlight}>
                <View style={styles.directionSwitchWrapper}>
                  <View style={styles.directionControls}>
                    {pickupDirection === 'a2h' ? (
                      // Airport to Hotel layout
                      <>
                        <View style={styles.endpointWithLabel}>
                          <View style={[styles.directionEndpoint, styles.activeEndpoint]}>
                            <MaterialIcons name="flight" size={16} color="#CE1126" />
                          </View>
                          <Text style={styles.endpointLabel}>{i18n.t('pickup.airport')}</Text>
                        </View>

                        <View style={styles.directionMiddle}>
                          <Ionicons name="arrow-forward" size={20} color="#666" />
                          <Text style={styles.toLabel}>{i18n.t('pickup.toDirection')}</Text>
                        </View>


                        <View style={styles.endpointWithLabel}>
                          <View style={styles.directionEndpoint}>
                            <MaterialIcons name="hotel" size={16} color="#008060" />
                          </View>
                          <Text style={styles.endpointLabel}>{i18n.t('pickup.hotel')}</Text>
                        </View>
                      </>
                    ) : (
                      // Hotel to Airport layout
                      <>
                        <View style={styles.endpointWithLabel}>
                          <View style={[styles.directionEndpoint, styles.activeEndpoint]}>
                            <MaterialIcons name="hotel" size={16} color="#008060" />
                          </View>
                          <Text style={styles.endpointLabel}>{i18n.t('pickup.hotel')}</Text>
                        </View>

                        <View style={styles.directionMiddle}>
                          <Ionicons name="arrow-forward" size={20} color="#666" />
                          <Text style={styles.toLabel}>{i18n.t('pickup.toDirection')}</Text>
                        </View>


                        <View style={styles.endpointWithLabel}>
                          <View style={styles.directionEndpoint}>
                            <MaterialIcons name="flight" size={16} color="#CE1126" />
                          </View>
                          <Text style={styles.endpointLabel}>{i18n.t('pickup.airport')}</Text>
                        </View>
                      </>
                    )}
                  </View>
                </View>
              </WalkthroughableView>
            </CopilotStep>

            <View style={styles.routeContainer}>
              {pickupDirection === 'a2h' ? (
                <>
                  <View style={styles.routeItem}>
                    <View style={styles.routeIconContainer}>
                      <MaterialIcons name="flight" size={20} color="#fff" />
                    </View>
                    <Text style={styles.routeText}>{selectedCity} {i18n.t('pickup.airport')}</Text>
                  </View>
                  <View style={styles.routeLine}>
                    <View style={styles.routeDash}></View>
                    <View style={styles.routeDash}></View>
                    <View style={styles.routeDash}></View>
                    <View style={styles.routeDash}></View>
                  </View>
                  <View style={styles.routeItem}>
                    <View style={[styles.routeIconContainer, styles.destinationIconContainer]}>
                      <MaterialIcons name="hotel" size={20} color="#fff" />
                    </View>
                    <Text style={styles.routeText}>{i18n.t('pickup.hotel')} {i18n.t('pickup.in')} {selectedCity}</Text>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.routeItem}>
                    <View style={[styles.routeIconContainer, styles.destinationIconContainer]}>
                      <MaterialIcons name="hotel" size={20} color="#fff" />
                    </View>
                    <Text style={styles.routeText}>{i18n.t('pickup.hotel')} {i18n.t('pickup.in')} {selectedCity}</Text>
                  </View>
                  <View style={styles.routeLine}>
                    <View style={styles.routeDash}></View>
                    <View style={styles.routeDash}></View>
                    <View style={styles.routeDash}></View>
                    <View style={styles.routeDash}></View>
                  </View>
                  <View style={styles.routeItem}>
                    <View style={styles.routeIconContainer}>
                      <MaterialIcons name="flight" size={20} color="#fff" />
                    </View>
                    <Text style={styles.routeText}>{selectedCity} {i18n.t('pickup.airport')}</Text>
                  </View>
                </>
              )}
            </View>
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
                      onPress={() => setShowTimePicker(true)}
                    >
                      <Ionicons name="time" size={20} color="#666" style={styles.inputIcon} />
                      <Text style={styles.dateTimeText}>
                        {selectedTime ? format(selectedTime, 'hh:mm a') : i18n.t('reservation.selectTime')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={styles.sectionTitle}>{i18n.t('reservation.whereAreYouStaying')}</Text>
                
                {/* Location search input - always visible */}
                <View style={styles.locationInputContainer}>
                  <GooglePlacesAutocomplete
                    ref={googlePlacesRef}
                    placeholder={i18n.t('reservation.searchForLocation')}
                    onPress={handleLocationSelect}
                    query={{
                      key: 'AIzaSyCPr-CMCoPoLZAklHjtnuqgoxXuVD8WEek',
                      language: 'en',
                      components: 'country:ma',
                    }}
                    fetchDetails={true}
                    onFail={(error) => console.error(error)}
                    onNotFound={() => console.log('No results found')}
                    styles={{
                      container: styles.autocompleteContainer,
                      textInputContainer: styles.textInputContainer,
                      textInput: styles.searchInput,
                      listView: styles.listView,
                      row: styles.autocompleteRow,
                      description: styles.autocompleteDescription,
                      separator: styles.autocompleteSeparator,
                      poweredContainer: { display: 'none' }
                    }}
                    enablePoweredByContainer={false}
                    minLength={1}
                    listViewDisplayed={true}
                    textInputProps={{
                      placeholderTextColor: '#999',
                      returnKeyType: 'search',
                      clearButtonMode: 'while-editing',
                      onChangeText: (text) => {
                        if (text === '') {
                          handleClearLocation();
                        }
                      }
                    }}
                    keyboardShouldPersistTaps="handled"
                  />
                </View>

                {mapVisible && destination ? (
                  <View style={styles.mapContainer}>
                    <MapView
                      ref={mapRef}
                      provider={PROVIDER_DEFAULT}
                      style={styles.map}
                      initialRegion={mapRegion || undefined}
                      showsUserLocation={true}
                      showsCompass={true}
                      rotateEnabled={true}
                      scrollEnabled={true}
                      zoomEnabled={true}
                      pitchEnabled={Platform.OS !== 'ios'}
                    >
                      <Marker
                        coordinate={{
                          latitude: destination[1],
                          longitude: destination[0],
                        }}
                        title={i18n.t('reservation.selectedLocation')}
                        description={hotelLocation}
                      />
                    </MapView>

                    <View style={styles.zoomControls}>
                      <TouchableOpacity style={styles.zoomButton} onPress={zoomIn}>
                        <Ionicons name="add" size={24} color="#333" />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.zoomButton} onPress={zoomOut}>
                        <Ionicons name="remove" size={24} color="#333" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <View style={styles.mapPlaceholderContainer}>
                    <View style={styles.mapPlaceholderContent}>
                      <Ionicons name="map-outline" size={50} color="#CE1126" />
                      <Text style={styles.mapPlaceholderText}>{i18n.t('reservation.searchToSeeMapLocation') || "Search for a location to see it on the map"}</Text>
                    </View>
                    <View style={styles.mapPlaceholderGrid}>
                      <View style={styles.mapPlaceholderGridRow}>
                        <View style={[styles.mapPlaceholderGridItem, styles.mapPlaceholderGridItemRed]} />
                        <View style={styles.mapPlaceholderGridItem} />
                        <View style={[styles.mapPlaceholderGridItem, styles.mapPlaceholderGridItemRed]} />
                        <View style={styles.mapPlaceholderGridItem} />
                      </View>
                      <View style={styles.mapPlaceholderGridRow}>
                        <View style={styles.mapPlaceholderGridItem} />
                        <View style={[styles.mapPlaceholderGridItem, styles.mapPlaceholderGridItemDark]} />
                        <View style={styles.mapPlaceholderGridItem} />
                        <View style={[styles.mapPlaceholderGridItem, styles.mapPlaceholderGridItemDark]} />
                      </View>
                      <View style={styles.mapPlaceholderGridRow}>
                        <View style={[styles.mapPlaceholderGridItem, styles.mapPlaceholderGridItemDark]} />
                        <View style={styles.mapPlaceholderGridItem} />
                        <View style={[styles.mapPlaceholderGridItem, styles.mapPlaceholderGridItemDark]} />
                        <View style={styles.mapPlaceholderGridItem} />
                      </View>
                      <View style={styles.mapPlaceholderGridRow}>
                        <View style={styles.mapPlaceholderGridItem} />
                        <View style={[styles.mapPlaceholderGridItem, styles.mapPlaceholderGridItemRed]} />
                        <View style={styles.mapPlaceholderGridItem} />
                        <View style={[styles.mapPlaceholderGridItem, styles.mapPlaceholderGridItemRed]} />
                      </View>
                    </View>
                  </View>
                )}
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

      {/* Date and Time pickers */}
      <DatePickerModal
        visible={showModernDatePicker}
        onClose={() => setShowModernDatePicker(false)}
        pickerMode="start"
        setPickerMode={() => { }}
        startDate={format(selectedDate, 'yyyy/MM/dd')}
        endDate=""
        onDateSelect={handleDateSelect}
        formatDisplayDate={formatDisplayDate}
        color="#008060"
        type="specific"
      />

      {showDatePicker && renderCustomDatePicker()}
      {showTimePicker && renderCustomTimePicker()}
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
  scrollContainer: {
    // paddingBottom: 80,
  },
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
  transportInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 4,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#CE1126',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  transportDetails: {
    flex: 1,
  },
  transportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  transportPrice: {
    fontSize: 14,
    color: '#CE1126',
    fontWeight: '500',
  },
  routeContainer: {
    marginBottom: 10,
    paddingHorizontal: 8,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  routeIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#CE1126',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  destinationIconContainer: {
    backgroundColor: '#008060',
  },
  routeLine: {
    height: 34,
    width: 2,
    marginLeft: 17,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  routeDash: {
    width: 2,
    height: 6,
    backgroundColor: '#ddd',
  },
  routeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
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
  input: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  footer: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  confirmButton: {
    backgroundColor: '#008060',
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
  // Custom picker styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerContainer: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    maxHeight: '80%',
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  pickerTitleContainer: {
    flex: 1,
    marginRight: 16,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  pickerCloseButton: {
    padding: 4,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  pickerContent: {
    padding: 16,
  },
  pickerRow: {
    marginBottom: 16,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  monthsContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  monthItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  monthText: {
    fontSize: 14,
    color: '#333',
  },
  daysContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  dayItem: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  dayText: {
    fontSize: 14,
    color: '#333',
  },
  yearsContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  yearItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  yearText: {
    fontSize: 14,
    color: '#333',
  },
  selectedItem: {
    backgroundColor: '#008060',
  },
  selectedItemText: {
    color: 'white',
    fontWeight: '500',
  },
  pickerActions: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  confirmPickerButton: {
    backgroundColor: '#008060',
  },
  timePickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timePickerColumn: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  timePickerScrollWrapper: {
    height: 200,
    width: '100%',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    overflow: 'hidden',
  },
  timePickerScrollContent: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  timeItem: {
    width: 60,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
    borderRadius: 8,
    backgroundColor: '#f5f5f9',
  },
  timeText: {
    fontSize: 16,
    color: '#333',
  },
  amPmContainer: {
    marginTop: 8,
    height: 100,
    justifyContent: 'space-around',
  },
  periodItem: {
    width: 60,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  periodText: {
    fontSize: 16,
    color: '#333',
  },
  inputPlaceholder: {
    color: '#999',
  },
  directionSwitchWrapper: {
    marginBottom: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
  },
  directionControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  endpointWithLabel: {
    alignItems: 'center',
    width: 70,
  },
  directionEndpoint: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
    backgroundColor: '#fff',
    marginBottom: 4,
  },
  activeEndpoint: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  directionMiddle: {
    alignItems: 'center',
    marginHorizontal: 8,
  },
  switchButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
    // backgroundColor: '#fff',
    marginBottom: 4,
    //borderWidth: 1,
    //borderColor: '#eee',
    //shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  endpointLabel: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  toLabel: {
    fontSize: 13,
    color: '#666',
  },
  locationInputContainer: {
    marginBottom: 8,
    height: 40,
    zIndex: 5,
    position: 'relative',
  },
  autocompleteContainer: {
    flex: 1,
    width: '100%',
    position: 'relative',
    zIndex: 10,
  },
  textInputContainer: {
    width: '100%',
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    borderBottomWidth: 0,
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  listView: {
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    borderRadius: 8,
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    maxHeight: 210,
    zIndex: 15,
    elevation: 5,
  },
  autocompleteRow: {
    backgroundColor: '#fff',
    padding: 15,
    height: 'auto',
  },
  autocompleteDescription: {
    color: '#333',
    fontSize: 14,
  },
  autocompleteSeparator: {
    height: 1,
    backgroundColor: '#f0f0f0',
  },
  locationDisplayContainer: {
    marginBottom: 16,
  },
  locationDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#f9f9f9',
  },
  locationText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  clearButton: {
    padding: 6,
  },
  mapContainer: {
    height: 160, 
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  map: {
    flex: 1,
  },
  zoomControls: {
    position: 'absolute',
    right: 16,
    bottom: Platform.OS === 'ios' ? 50 : 16,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 8,
    overflow: 'hidden',
  },
  zoomButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  mapPlaceholderContainer: {
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholderContent: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    zIndex: 2,
  },
  mapPlaceholderText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    width: 200,
  },
  mapPlaceholderGrid: {
    width: '100%',
    height: '100%',
    opacity: 0.5,
    padding: 20,
  },
  mapPlaceholderGridRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flex: 1,
  },
  mapPlaceholderGridItem: {
    flex: 1,
    margin: 2,
    backgroundColor: '#f0f0f0',
  },
  mapPlaceholderGridItemDark: {
    backgroundColor: '#ccc',
  },
  mapPlaceholderGridItemRed: {
    backgroundColor: '#CE1126',
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
});

export default ReservationPopup; 