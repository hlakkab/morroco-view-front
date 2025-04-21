import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { Alert, Keyboard, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import "react-native-get-random-values";
import Button from '../components/Button';
import DatePickerModal from '../components/DatePickerModal';
import LocationPickerModal from '../components/LocationPickerModal';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { bookPickupReservation, resetBookingStatus } from '../store/hotelPickupDetailsSlice';
import { togglePickupDirection } from '../store/hotelPickupSlice';
import i18n from '../translations/i18n';

interface ReservationPopupProps {
  onClose: () => void;
  title: string;
  price: number;
  pickupId: string;
}

const ReservationPopup = ({ onClose, title, price, pickupId }: ReservationPopupProps) => {
  const dispatch = useAppDispatch();
  const { bookingStatus, bookingError } = useAppSelector(
    (state) => state.hotelPickupDetails
  );
  const selectedCity = useAppSelector(
    (state) => state.hotelPickup.selectedCity
  );

  const pickupDirection = useAppSelector(
    (state) => state.hotelPickup.pickupDirection
  );

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [hotelLocation, setHotelLocation] = useState('');
  const [destination, setDestination] = useState<[number, number] | null>(null);
  const [showModernDatePicker, setShowModernDatePicker] = useState(false);
  const [passengers, setPassengers] = useState(1);
  const [luggage, setLuggage] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

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

  const handleToggleDirection = () => {
    dispatch(togglePickupDirection());
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

      Alert.alert(
        i18n.t('reservation.success'),
        i18n.t('reservation.bookingConfirmed'),
        [{ text: i18n.t('common.close'), onPress: onClose }]
      );
    } catch (error) {
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
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        <ScrollView style={styles.scrollContent}>

          <View style={styles.content}>
            <View style={styles.transportInfo}>
              <View style={styles.iconContainer}>
                <Ionicons name="car" size={28} color="#fff" />
              </View>
              <View style={styles.transportDetails}>
                <Text style={styles.transportTitle}>{title}</Text>
                <Text style={styles.transportPrice}>{price} Dh {i18n.t('pickup.perGroup')}</Text>
              </View>
            </View>

            {/* Direction switch control */}
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
                      <TouchableOpacity 
                        style={styles.switchButton}
                        onPress={handleToggleDirection}
                      >
                        <Ionicons name="arrow-forward" size={14} color="#666" />
                      </TouchableOpacity>
                      <Text style={styles.toLabel}>{i18n.t('pickup.toDirection')}</Text>
                    </View>
                    
                    <View style={styles.endpointWithLabel}>
                      <View style={styles.directionEndpoint}>
                        <MaterialIcons name="hotel" size={16} color="#777" />
                      </View>
                      <Text style={styles.endpointLabel}>{i18n.t('pickup.hotel')}</Text>
                    </View>
                  </>
                ) : (
                  // Hotel to Airport layout
                  <>
                    <View style={styles.endpointWithLabel}>
                      <View style={[styles.directionEndpoint, styles.activeEndpoint]}>
                        <MaterialIcons name="hotel" size={16} color="#CE1126" />
                      </View>
                      <Text style={styles.endpointLabel}>{i18n.t('pickup.hotel')}</Text>
                    </View>
                    
                    <View style={styles.directionMiddle}>
                      <TouchableOpacity 
                        style={styles.switchButton}
                        onPress={handleToggleDirection}
                      >
                        <Ionicons name="arrow-forward" size={14} color="#666" />
                      </TouchableOpacity>
                      <Text style={styles.toLabel}>{i18n.t('pickup.toDirection')}</Text>
                    </View>
                    
                    <View style={styles.endpointWithLabel}>
                      <View style={styles.directionEndpoint}>
                        <MaterialIcons name="flight" size={16} color="#777" />
                      </View>
                      <Text style={styles.endpointLabel}>{i18n.t('pickup.airport')}</Text>
                    </View>
                  </>
                )}
              </View>
            </View>

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

            <View style={styles.formContainer}>
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
              <TouchableOpacity
                style={styles.inputContainer}
                onPress={() => setShowLocationPicker(true)}
              >
                <Text style={[styles.input, !hotelLocation && styles.inputPlaceholder]}>
                  {hotelLocation || i18n.t('reservation.tapToSelectYourHotelLocationOnTheMap')}
                </Text>
              </TouchableOpacity>

              {bookingError && (
                <Text style={styles.errorText}>{bookingError}</Text>
              )}
            </View>
          </View>

          <View style={styles.footer}>
            <Button
              title={i18n.t('reservation.confirmReservation')}
              style={styles.confirmButton}
              icon={<Ionicons name="checkmark-circle" size={20} color="#fff" style={{ marginRight: 8 }} />}
              onPress={handleSubmit}
              loading={bookingStatus === 'loading'}
              disabled={bookingStatus === 'loading'}
            />
          </View>
        </ScrollView>
      </View>

      {/* Modern Date Picker */}
      <DatePickerModal
        visible={showModernDatePicker}
        onClose={() => setShowModernDatePicker(false)}
        pickerMode="start"
        setPickerMode={() => {}}
        startDate={format(selectedDate, 'yyyy/MM/dd')}
        endDate=""
        onDateSelect={handleDateSelect}
        formatDisplayDate={formatDisplayDate}
        color="#008060"
        type="specific"
      />

      {/* Original Date Picker */}
      {showDatePicker && renderCustomDatePicker()}
      {showTimePicker && renderCustomTimePicker()}

      {showLocationPicker && (
        <LocationPickerModal
          onClose={() => setShowLocationPicker(false)}
          onLocationSelect={(longitude: number, latitude: number, address: string) => {
            setDestination([longitude, latitude]);
            setHotelLocation(address);
          }}
        />
      )}
    </KeyboardAvoidingView>
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
    paddingTop: 16,
    paddingBottom: 16,
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
  scrollContent: {
    flexGrow: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  transportInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
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
    marginBottom: 24,
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
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
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
    marginBottom: 8,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 50,
    backgroundColor: '#f9f9f9',
  },
  timeInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 50,
    backgroundColor: '#f9f9f9',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
    height: 50,
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
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
  },
  directionControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
    backgroundColor: '#fff',
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
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
    fontSize: 10,
    color: '#666',
  },
});

export default ReservationPopup; 