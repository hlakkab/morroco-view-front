import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useRef, useState } from 'react';
import { Dimensions, FlatList, Image, Linking, Modal, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CopilotProvider, CopilotStep, useCopilot, walkthroughable } from 'react-native-copilot';
import AboutSection from '../components/AboutSection';
import AuthModal from '../components/AuthModal';
import Button from '../components/Button';
import DatePickerModal from '../components/DatePickerModal';
import LocationSection from '../components/LocationSection';
import ScreenHeader from '../components/ScreenHeader';
import { useAuth } from '../contexts/AuthContext';
import { toggleGuideBookmark } from '../store/guideSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import i18n from '../translations/i18n';
import { Guide } from '../types/guide';

const TOUR_FLAG = '@guideDetailTourSeen';

const { width } = Dimensions.get('window');

// Create walkthroughable components
const WalkthroughableView = walkthroughable(View);

// Content component with Copilot functionality
const GuideDetailScreenContent: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useAppDispatch();
  const { start: startTour, copilotEvents, visible } = useCopilot();
  const [tourStarted, setTourStarted] = useState(false);
  const [hasSeenTour, setHasSeenTour] = useState<boolean | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [pickerMode, setPickerMode] = useState<'start' | 'end'>('start');
  const [selectedTourType, setSelectedTourType] = useState<'fullDay' | 'halfDay'>('halfDay');
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const flatListRef = useRef<FlatList>(null);
  const { isAuthenticated } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Get guide details from route params
  const guideDetails = route.params as Guide;
  
  // Get the current save state from Redux
  const { guides } = useAppSelector(state => state.guide);
  const currentGuide = guides.find(g => g.id === guideDetails.id);
  const isSaved = currentGuide?.saved || guideDetails.saved;

  // ─── 1. Read if tour has already been seen ─────────────────
  React.useEffect(() => {
    AsyncStorage.getItem(TOUR_FLAG)
      .then(value => {
        console.log('Tour seen status:', value);
        setHasSeenTour(value === 'true');
      })
      .catch(error => {
        console.error('Error reading tour status:', error);
        setHasSeenTour(false);
      });
  }, []);

  // ─── 2. Automatic start once ──────────
  React.useEffect(() => {
    console.log('Tour conditions:', {
      hasSeenTour,
      tourStarted,
      visible
    });

    if (hasSeenTour === false && !tourStarted && !visible) {
      console.log('Starting tour automatically...');
      const timer = setTimeout(() => {
        startTour();
        setTourStarted(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [hasSeenTour, startTour, tourStarted, visible]);

  // ─── 3. Save tour completion ────────
  React.useEffect(() => {
    const handleStop = async () => {
      console.log('Tour stopped, saving status...');
      try {
        await AsyncStorage.setItem(TOUR_FLAG, 'true');
        setHasSeenTour(true);
        setTourStarted(false);
        console.log('Tour status saved successfully');
      } catch (error) {
        console.error('Error saving tour status:', error);
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

  // Add a button to manually start the tour
  const handleStartTour = () => {
    setTourStarted(true);
    startTour();
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSave = () => {
    if (!isAuthenticated()) {
      setShowAuthModal(true);
      return;
    }
    
    dispatch(toggleGuideBookmark(guideDetails));
  };

  const handleScroll = (event: any) => {
    const slideIndex = Math.floor(event.nativeEvent.contentOffset.x / width);
    setCurrentImageIndex(slideIndex);
  };

  const handleReservationPress = () => {
    if (!isAuthenticated()) {
      setShowAuthModal(true);
      return;
    }
    setShowReservationModal(true);
  };

  const handleCloseReservationModal = () => {
    setShowReservationModal(false);
  };

  const handleContactPress = () => {
    setShowContactModal(true);
  };

  const handleCloseContactModal = () => {
    setShowContactModal(false);
  };

  const handlePhoneCall = () => {
    if (guideDetails.phoneNumber) {
      Linking.openURL(`tel:${guideDetails.phoneNumber}`);
      handleCloseContactModal();
    }
  };

  const handleEmail = () => {
    if (guideDetails.email) {
      Linking.openURL(`mailto:${guideDetails.email}`);
      handleCloseContactModal();
    }
  };

  const handleWhatsApp = () => {
    if (guideDetails.phoneNumber) {
      const formattedNumber = guideDetails.phoneNumber.replace(/\D/g, '');
      Linking.openURL(`whatsapp://send?phone=${formattedNumber}&text=Hello, I'm interested in booking a tour with you.`);
      handleCloseContactModal();
    }
  };

  // Calculate prices - Total is fixed, per person decreases as more people join
  const getTotalTourPrice = () => {
    return selectedTourType === 'fullDay' ? guideDetails.priceFullDay : guideDetails.priceHalfDay;
  };

  const getPricePerPerson = () => {
    const totalPrice = getTotalTourPrice();
    return Math.round(totalPrice / numberOfPeople);
  };

  const handleConfirmReservation = () => {
    // TODO: Implement reservation logic with backend API
    console.log('Reservation details:', {
      guideId: guideDetails.id,
      date: selectedDate,
      tourType: selectedTourType,
      numberOfPeople,
      totalTourPrice: getTotalTourPrice(),
      pricePerPerson: getPricePerPerson()
    });
    // Close modal and show success message
    setShowReservationModal(false);
    // You can add a success toast/alert here
  };

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('/');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString(i18n.locale || 'en', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setShowDatePicker(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <ScreenHeader 
          title={guideDetails.name} 
          onBack={handleBack}
          showTour={!visible}
          onTourPress={handleStartTour}
        />
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView}
        scrollEventThrottle={16}
      >
        <CopilotStep
          text={i18n.t('copilot.viewGuideImages')}
          order={1}
          name="images"
        >
          <WalkthroughableView style={styles.imageSection}>
            <FlatList
              ref={flatListRef}
              data={guideDetails.images}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              keyExtractor={(_, index) => index.toString()}
              renderItem={({ item }) => (
                <Image 
                  source={{ uri: item }} 
                  style={styles.image} 
                  resizeMode="cover"
                />
              )}
            />
            
            <TouchableOpacity 
              style={[styles.saveButton, isSaved && styles.savedButton, {borderColor: isSaved ? "white" : "#666"}]} 
              onPress={handleSave}
            >
              <Ionicons 
                name={isSaved ? "bookmark" : "bookmark-outline"} 
                size={24} 
                color={isSaved ? "white" : "#666" }
              />
            </TouchableOpacity>
            
            <View style={styles.pagination}>
              {guideDetails.images.map((_, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.paginationDot, 
                    index === currentImageIndex && styles.activePaginationDot
                  ]} 
                />
              ))}
            </View>
          </WalkthroughableView>
        </CopilotStep>

        <View style={styles.content}>
          <CopilotStep
            text={i18n.t('copilot.seeGuideInfo')}
            order={2}
            name="guideInfo"
          >
            <WalkthroughableView>
              <View style={styles.headerInfo}>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={20} color="#FFA726" />
                  <Text style={styles.rating}>
                    {guideDetails.rating.toFixed(1)} ({guideDetails.reviewCount} {i18n.t('guide.reviews')})
                  </Text>
                </View>
              </View>

              <View style={styles.priceSection}>
                <Text style={styles.priceSectionTitle}>{i18n.t('guide.tourPricing')}</Text>
                
                <View style={styles.priceOptions}>
                  <View style={styles.priceOption}>
                    <View style={styles.priceOptionHeader}>
                      <Ionicons name="sunny-outline" size={20} color="#CE1126" />
                      <Text style={styles.priceOptionTitle}>{i18n.t('guide.halfDayTour')}</Text>
                    </View>
                    <Text style={styles.priceOptionValue}>{guideDetails.priceHalfDay} {guideDetails.currency}</Text>
                    <Text style={styles.priceOptionSubtext}>{i18n.t('guide.perTour')}</Text>
                  </View>

                  <View style={styles.priceOption}>
                    <View style={styles.priceOptionHeader}>
                      <Ionicons name="sunny" size={20} color="#CE1126" />
                      <Text style={styles.priceOptionTitle}>{i18n.t('guide.fullDayTour')}</Text>
                    </View>
                    <Text style={styles.priceOptionValue}>{guideDetails.priceFullDay} {guideDetails.currency}</Text>
                    <Text style={styles.priceOptionSubtext}>{i18n.t('guide.perTour')}</Text>
                  </View>
                </View>

                <View style={styles.maxTouristsInfo}>
                  <Ionicons name="people-outline" size={16} color="#666" />
                  <Text style={styles.maxTouristsText}>
                    {i18n.t('guide.maxTourists')}: {guideDetails.maxTouristsPerTour} {i18n.t('guide.people')}
                  </Text>
                </View>
              </View>

              <View style={styles.metaInfo}>
                <View style={styles.metaItem}>
                  <Ionicons name="location" size={16} color="#CE1126" />
                  <Text style={styles.metaText}>{guideDetails.region}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="time" size={16} color="#CE1126" />
                  <Text style={styles.metaText}>{guideDetails.experienceYears} {i18n.t('guide.yearsExperience')}</Text>
                </View>
              </View>
            </WalkthroughableView>
          </CopilotStep>

          <CopilotStep
            text={i18n.t('copilot.viewLanguages')}
            order={3}
            name="languages"
          >
            <WalkthroughableView>
              <Text style={styles.sectionTitle}>{i18n.t('guide.languages')}</Text>
              <View style={styles.languagesContainer}>
                {guideDetails.languages.map((language, index) => (
                  <View key={index} style={styles.languageBadge}>
                    <Ionicons name="language" size={14} color="#008060" />
                    <Text style={styles.languageText}>{language}</Text>
                  </View>
                ))}
              </View>
            </WalkthroughableView>
          </CopilotStep>

          <CopilotStep
            text={i18n.t('copilot.viewSpecialties')}
            order={4}
            name="specialties"
          >
            <WalkthroughableView>
              <Text style={styles.sectionTitle}>{i18n.t('guide.specialties')}</Text>
              <View style={styles.specialtiesContainer}>
                {guideDetails.specialties.map((specialty, index) => (
                  <View key={index} style={styles.specialtyItem}>
                    <Ionicons name="checkmark-circle" size={20} color="#CE1126" />
                    <Text style={styles.specialtyText}>{specialty}</Text>
                  </View>
                ))}
              </View>
            </WalkthroughableView>
          </CopilotStep>

          {guideDetails.certifications && guideDetails.certifications.length > 0 && (
            <View>
              <Text style={styles.sectionTitle}>{i18n.t('guide.certifications')}</Text>
              <View style={styles.certificationsContainer}>
                {guideDetails.certifications.map((cert, index) => (
                  <View key={index} style={styles.certificationItem}>
                    <Ionicons name="ribbon" size={16} color="#008060" />
                    <Text style={styles.certificationText}>{cert}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <CopilotStep
            text={i18n.t('copilot.checkContactInfo')}
            order={5}
            name="contactInfo"
          >
            <WalkthroughableView style={styles.infoContainer}>
              <View style={styles.infoItem}>
                <Ionicons name="time-outline" size={20} color="#666" />
                <Text style={styles.infoText}>
                  {guideDetails.startTime && guideDetails.endTime 
                    ? `${guideDetails.startTime} - ${guideDetails.endTime}`
                    : "08:00 - 20:00"}
                </Text>
              </View>
              
              {guideDetails.phoneNumber && (
                <View style={styles.infoItem}>
                  <Ionicons name="call-outline" size={20} color="#666" />
                  <Text style={styles.infoText}>{guideDetails.phoneNumber}</Text>
                </View>
              )}
              
              {guideDetails.email && (
                <View style={styles.infoItem}>
                  <Ionicons name="mail-outline" size={20} color="#666" />
                  <Text style={styles.infoText}>{guideDetails.email}</Text>
                </View>
              )}
            </WalkthroughableView>
          </CopilotStep>

          <CopilotStep
            text={i18n.t('copilot.learnMore')}
            order={6}
            name="about"
          >
            <WalkthroughableView>
              <AboutSection 
                title={i18n.t('guide.about')} 
                text={guideDetails.bio || i18n.t('guide.noInformation')} 
              />
            </WalkthroughableView>
          </CopilotStep>

          {guideDetails.mapId && (
            <CopilotStep
              text={i18n.t('copilot.findLocation')}
              order={7}
              name="location"
            >
              <WalkthroughableView>
                <LocationSection 
                  address={`${guideDetails.city}, ${guideDetails.region}`} 
                  mapUrl={guideDetails.mapId} 
                />
              </WalkthroughableView>
            </CopilotStep>
          )}
        </View>
      </ScrollView>

      <CopilotStep
        text={i18n.t('copilot.bookGuide')}
        order={8}
        name="reservation"
      >
        <WalkthroughableView style={styles.footer}>
          <View style={styles.footerButtons}>
            <TouchableOpacity 
              style={styles.contactIconButton}
              onPress={handleContactPress}
            >
              <Ionicons name="chatbubble-outline" size={24} color="#CE1126" />
            </TouchableOpacity>
            <Button 
              title={i18n.t('guide.bookNow')}
              style={styles.bookButton}
              onPress={handleReservationPress}
            />
          </View>
        </WalkthroughableView>
      </CopilotStep>

      {/* Reservation Modal */}
      <Modal
        visible={showReservationModal}
        transparent
        animationType="slide"
        onRequestClose={handleCloseReservationModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{i18n.t('guide.bookTour')}</Text>
              <TouchableOpacity onPress={handleCloseReservationModal}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScroll}>
              <Text style={styles.fieldLabel}>{i18n.t('guide.tourType')}</Text>
              <View style={styles.tourTypeSelector}>
                <TouchableOpacity 
                  style={[
                    styles.tourTypeOption,
                    selectedTourType === 'halfDay' && styles.tourTypeOptionActive
                  ]}
                  onPress={() => setSelectedTourType('halfDay')}
                >
                  <Ionicons 
                    name="sunny-outline" 
                    size={24} 
                    color={selectedTourType === 'halfDay' ? '#fff' : '#CE1126'} 
                  />
                  <Text style={[
                    styles.tourTypeText,
                    selectedTourType === 'halfDay' && styles.tourTypeTextActive
                  ]}>
                    {i18n.t('guide.halfDayTour')}
                  </Text>
                  <Text style={[
                    styles.tourTypePrice,
                    selectedTourType === 'halfDay' && styles.tourTypePriceActive
                  ]}>
                    {guideDetails.priceHalfDay} {guideDetails.currency}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[
                    styles.tourTypeOption,
                    selectedTourType === 'fullDay' && styles.tourTypeOptionActive
                  ]}
                  onPress={() => setSelectedTourType('fullDay')}
                >
                  <Ionicons 
                    name="sunny" 
                    size={24} 
                    color={selectedTourType === 'fullDay' ? '#fff' : '#CE1126'} 
                  />
                  <Text style={[
                    styles.tourTypeText,
                    selectedTourType === 'fullDay' && styles.tourTypeTextActive
                  ]}>
                    {i18n.t('guide.fullDayTour')}
                  </Text>
                  <Text style={[
                    styles.tourTypePrice,
                    selectedTourType === 'fullDay' && styles.tourTypePriceActive
                  ]}>
                    {guideDetails.priceFullDay} {guideDetails.currency}
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.fieldLabel}>{i18n.t('guide.selectDate')}</Text>
              <TouchableOpacity 
                style={styles.dateInput}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={20} color="#CE1126" />
                <Text style={[styles.dateText, selectedDate && styles.dateTextSelected]}>
                  {selectedDate ? formatDisplayDate(selectedDate) : i18n.t('guide.selectDate')}
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#666" style={{ marginLeft: 'auto' }} />
              </TouchableOpacity>

              <Text style={styles.fieldLabel}>{i18n.t('guide.numberOfPeople')}</Text>
              <View style={styles.peopleSelector}>
                <TouchableOpacity 
                  style={styles.peopleButton}
                  onPress={() => setNumberOfPeople(Math.max(1, numberOfPeople - 1))}
                  disabled={numberOfPeople <= 1}
                >
                  <Ionicons name="remove" size={20} color={numberOfPeople <= 1 ? '#ccc' : '#CE1126'} />
                </TouchableOpacity>
                <View style={styles.peopleCountContainer}>
                  <Text style={styles.peopleCount}>{numberOfPeople}</Text>
                  <Text style={styles.peopleMax}>/ {guideDetails.maxTouristsPerTour}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.peopleButton}
                  onPress={() => setNumberOfPeople(Math.min(guideDetails.maxTouristsPerTour, numberOfPeople + 1))}
                  disabled={numberOfPeople >= guideDetails.maxTouristsPerTour}
                >
                  <Ionicons name="add" size={20} color={numberOfPeople >= guideDetails.maxTouristsPerTour ? '#ccc' : '#CE1126'} />
                </TouchableOpacity>
              </View>

              <View style={styles.priceSummary}>
                <View style={styles.priceSummaryRow}>
                  <Text style={styles.priceSummaryLabel}>{i18n.t('guide.tourType')}:</Text>
                  <Text style={styles.priceSummaryValue}>
                    {selectedTourType === 'fullDay' ? i18n.t('guide.fullDayTour') : i18n.t('guide.halfDayTour')}
                  </Text>
                </View>
                <View style={styles.priceSummaryRow}>
                  <Text style={styles.priceSummaryLabel}>{i18n.t('guide.totalTourPrice')}:</Text>
                  <Text style={styles.priceSummaryValue}>{getTotalTourPrice()} {guideDetails.currency}</Text>
                </View>
                <View style={styles.priceSummaryRow}>
                  <Text style={styles.priceSummaryLabel}>{i18n.t('guide.numberOfPeople')}:</Text>
                  <Text style={styles.priceSummaryValue}>{numberOfPeople}</Text>
                </View>
                <View style={styles.priceSummaryDivider} />
                <View style={styles.priceSummaryRow}>
                  <Text style={styles.totalPriceLabel}>{i18n.t('guide.pricePerPerson')}:</Text>
                  <Text style={styles.totalPriceValue}>{getPricePerPerson()} {guideDetails.currency}</Text>
                </View>
                {numberOfPeople > 1 && (
                  <Text style={styles.savingsText}>
                    {i18n.t('guide.shareTheCost')}
                  </Text>
                )}
              </View>
            </ScrollView>
            
            <Button 
              title={i18n.t('guide.confirmReservation')}
              style={styles.confirmButton}
              onPress={handleConfirmReservation}
              disabled={!selectedDate}
            />
          </View>
        </View>
      </Modal>

      {/* Contact Modal */}
      <Modal
        visible={showContactModal}
        transparent
        animationType="slide"
        onRequestClose={handleCloseContactModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {i18n.t('guide.contact')} {guideDetails.name}
              </Text>
              <TouchableOpacity onPress={handleCloseContactModal}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.contactOptions}>
              <TouchableOpacity style={styles.contactOption} onPress={handlePhoneCall}>
                <Ionicons name="call" size={24} color="#008060" />
                <Text style={styles.contactOptionText}>{i18n.t('guide.call')}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.contactOption} onPress={handleEmail}>
                <Ionicons name="mail" size={24} color="#008060" />
                <Text style={styles.contactOptionText}>{i18n.t('guide.email')}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.contactOption} onPress={handleWhatsApp}>
                <Ionicons name="logo-whatsapp" size={24} color="#008060" />
                <Text style={styles.contactOptionText}>{i18n.t('guide.whatsapp')}</Text>
              </TouchableOpacity>
            </View>
            
            <Button 
              title={i18n.t('common.close')}
              style={styles.closeButton}
              onPress={handleCloseContactModal}
            />
          </View>
        </View>
      </Modal>

      <DatePickerModal
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        pickerMode={pickerMode}
        setPickerMode={setPickerMode}
        startDate={selectedDate}
        endDate=""
        onDateSelect={handleDateSelect}
        formatDisplayDate={formatDisplayDate}
        color="#CE1126"
        type="specific"
      />

      <AuthModal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </SafeAreaView>
  );
};

// Main component with CopilotProvider
const GuideDetailScreen: React.FC = () => {
  return (
    <CopilotProvider
      stepNumberComponent={() => null}
      tooltipStyle={styles.tooltip}
      backdropColor="rgba(0, 0, 0, 0.7)"
      animationDuration={300}
      overlay="svg"
      stopOnOutsideClick={true}
      labels={{
        skip: i18n.t('copilot.navigation.skip'),
        previous: i18n.t('copilot.navigation.previous'),
        next: i18n.t('copilot.navigation.next'),
        finish: i18n.t('copilot.navigation.finish')
      }}
      arrowSize={8}
      arrowColor="#FFF7F7"
    >
      <GuideDetailScreenContent />
    </CopilotProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF7F7',
  },
  scrollView: {
    flex: 1,
  },
  headerContainer: {
    paddingTop: Platform.OS === 'ios' ? 0 : 40,
    paddingHorizontal: 16,
  },
  imageSection: {
    position: 'relative',
    width: '100%',
    height: 240,
    backgroundColor: '#FFF7F7',
  },
  image: {
    width: width,
    height: 240,
  },
  saveButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    opacity: 0.8,
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.7,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4C4C4CBF',
    borderColor: '#666',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  savedButton: {
    opacity: 1,
    backgroundColor: '#888888',
    borderColor: '#fff',
  },
  pagination: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  activePaginationDot: {
    backgroundColor: '#fff',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  content: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  headerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    marginLeft: 6,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  featuredBadge: {
    backgroundColor: '#E53935',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  featuredText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  priceSection: {
    marginBottom: 16,
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
  },
  priceSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  priceOptions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  priceOption: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  priceOptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceOptionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  priceOptionValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#CE1126',
    marginBottom: 4,
  },
  priceOptionSubtext: {
    fontSize: 12,
    color: '#666',
  },
  maxTouristsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 8,
    borderRadius: 6,
  },
  maxTouristsText: {
    marginLeft: 6,
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  metaInfo: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  metaText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    marginTop: 16,
    color: '#000',
  },
  languagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  languageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  languageText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#008060',
    fontWeight: '500',
  },
  specialtiesContainer: {
    marginBottom: 8,
  },
  specialtyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  specialtyText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  certificationsContainer: {
    marginBottom: 16,
  },
  certificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  certificationText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  infoContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  footerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactIconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FCE4E4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bookButton: {
    flex: 1,
    backgroundColor: '#CE1126',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  modalScroll: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dateText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#999',
    flex: 1,
  },
  dateTextSelected: {
    color: '#333',
    fontWeight: '500',
  },
  tourTypeSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  tourTypeOption: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  tourTypeOptionActive: {
    backgroundColor: '#CE1126',
    borderColor: '#CE1126',
  },
  tourTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
  },
  tourTypeTextActive: {
    color: '#fff',
  },
  tourTypePrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#CE1126',
    marginTop: 4,
  },
  tourTypePriceActive: {
    color: '#fff',
  },
  peopleSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  peopleButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FCE4E4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  peopleCountContainer: {
    alignItems: 'center',
    marginHorizontal: 24,
  },
  peopleCount: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
  },
  peopleMax: {
    fontSize: 14,
    color: '#666',
    marginTop: -4,
  },
  priceSummary: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  priceSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceSummaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  priceSummaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  priceSummaryDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 12,
  },
  totalPriceLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  totalPriceValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#CE1126',
  },
  savingsText: {
    fontSize: 12,
    color: '#008060',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  confirmButton: {
    backgroundColor: '#CE1126',
  },
  contactOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  contactOption: {
    alignItems: 'center',
    padding: 12,
  },
  contactOptionText: {
    marginTop: 8,
    fontSize: 14,
    color: '#333',
  },
  closeButton: {
    marginTop: 8,
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
});

export default GuideDetailScreen;

