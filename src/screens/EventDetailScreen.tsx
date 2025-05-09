import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Dimensions, Modal, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CopilotProvider, CopilotStep, useCopilot, walkthroughable } from 'react-native-copilot';
import AboutSection from '../components/AboutSection';
import Button from '../components/Button';
import ImageGallery from '../components/ImageGallery';
import LocationSection from '../components/LocationSection';
import ScreenHeader from '../components/ScreenHeader';
import i18n from '../translations/i18n';
import { Event } from '../types/Event';

const { width } = Dimensions.get('window');

// Create walkthroughable components
const WalkthroughableView = walkthroughable(View);

const EventDetailScreenContent: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as Event;
  const { start: startTour, copilotEvents, visible } = useCopilot();
  const [tourStarted, setTourStarted] = useState(false);
  
  const [isSaved, setIsSaved] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);

  // Get event details from route params
  const eventDetails = params;

  // Start the Copilot tour when the component mounts
  useEffect(() => {
    if (!tourStarted) {
      // Delay starting the tour until after the UI has rendered
      const timer = setTimeout(() => {
        startTour();
        setTourStarted(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [startTour, tourStarted]);

  // Handle Copilot events
  useEffect(() => {
    const handleStop = () => {
      console.log('Tour completed or stopped');
    };
    
    copilotEvents.on('stop', handleStop);
    
    return () => {
      copilotEvents.off('stop', handleStop);
    };
  }, [copilotEvents]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
  };

  const handleBuyTicket = () => {
    setShowTicketModal(true);
  };

  const handleCloseTicketModal = () => {
    setShowTicketModal(false);
  };

  // Add a button to manually start the tour
  const handleStartTour = () => {
    startTour();
  };

  // Format date range for display
  const formatDateRange = () => {
    if (!eventDetails.fromDate || !eventDetails.toDate) return '';
    
    const fromDate = new Date(eventDetails.fromDate);
    const toDate = new Date(eventDetails.toDate);
    
    const options: Intl.DateTimeFormatOptions = { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    };
    
    return `${fromDate.toLocaleDateString('en-US', options)} - ${toDate.toLocaleDateString('en-US', options)}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Manual tour button */}
      {!visible && (
        <TouchableOpacity style={styles.tourButton} onPress={handleStartTour}>
          <Ionicons name="information-circle-outline" size={20} color="#FFFFFF" />
          <Text style={styles.tourButtonText}>Tour Guide</Text>
        </TouchableOpacity>
      )}

      <View style={styles.headerContainer}>
        <ScreenHeader title={eventDetails.name} onBack={handleBack} />
      </View>

      <ScrollView style={styles.scrollView}>
        <CopilotStep
          text="Browse through event images and save your favorite events"
          order={1}
          name="imageGallery"
        >
          <WalkthroughableView style={styles.imageGalleryHighlight}>
            <ImageGallery 
              images={eventDetails.images || []}
              isSaved={isSaved}
              onSavePress={handleSave}
            />
          </WalkthroughableView>
        </CopilotStep>

        <View style={styles.content}>
          <CopilotStep
            text="View event type, dates, and website information"
            order={2}
            name="eventInfo"
          >
            <WalkthroughableView style={styles.eventInfoHighlight}>
              <View style={styles.eventTypeContainer}>
                <Text style={styles.eventType}>
                  {eventDetails.type}
                </Text>
              </View>

              <View style={styles.infoContainer}>
                <View style={styles.infoItem}>
                  <Ionicons name="calendar-outline" size={20} color="#666" />
                  <Text style={styles.infoText}>{formatDateRange()}</Text>
                </View>
                
                {eventDetails.entryFee && (
                  <View style={styles.infoItem}>
                    <Ionicons name="cash-outline" size={20} color="#666" />
                    <Text style={styles.infoText}>{i18n.t('eventDetail.entryFee', { fee: eventDetails.entryFee })}</Text>
                  </View>
                )}
                
                {eventDetails.website && (
                  <View style={styles.infoItem}>
                    <Ionicons name="globe-outline" size={20} color="#666" />
                    <Text style={styles.infoText}>{eventDetails.website}</Text>
                  </View>
                )}
                
                {eventDetails.organizer && (
                  <View style={styles.infoItem}>
                    <Ionicons name="people-outline" size={20} color="#666" />
                    <Text style={styles.infoText}>{i18n.t('eventDetail.organizer', { organizer: eventDetails.organizer })}</Text>
                  </View>
                )}
              </View>
            </WalkthroughableView>
          </CopilotStep>

          <CopilotStep
            text="Read more about this event"
            order={3}
            name="aboutSection"
          >
            <WalkthroughableView style={styles.aboutHighlight}>
              <AboutSection 
                title={i18n.t('eventDetail.about')} 
                text={eventDetails.description || i18n.t('eventDetail.noInfo')} 
              />
            </WalkthroughableView>
          </CopilotStep>

          <CopilotStep
            text="Find the event location and get directions"
            order={4}
            name="locationSection"
          >
            <WalkthroughableView style={styles.locationHighlight}>
              <LocationSection 
                address={eventDetails.address} 
                mapUrl={eventDetails.mapUrl || `https://maps.google.com/?q=${eventDetails.address}`}
              />
            </WalkthroughableView>
          </CopilotStep>
        </View>
      </ScrollView>

      <CopilotStep
        text="Click here to purchase tickets for the event"
        order={5}
        name="buyTickets"
      >
        <WalkthroughableView style={styles.ticketButtonHighlight}>
          <View style={styles.footer}>
            <Button 
              title={i18n.t('eventDetail.buyTickets')} 
              style={styles.ticketButton}
              icon={<Ionicons name="ticket" size={20} color="#fff" style={{ marginRight: 8 }} />}
              onPress={handleBuyTicket}
            />
          </View>
        </WalkthroughableView>
      </CopilotStep>

      <Modal
        visible={showTicketModal}
        transparent
        animationType="slide"
        onRequestClose={handleCloseTicketModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.titleContainer}>
                <Text style={styles.modalTitle} numberOfLines={1} ellipsizeMode="tail">
                  {i18n.t('eventDetail.ticketsFor', { name: eventDetails.name })}
                </Text>
              </View>
              <TouchableOpacity onPress={handleCloseTicketModal} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.ticketOptions}>
              <View style={styles.ticketOption}>
                <View style={styles.ticketDetails}>
                  <Text style={styles.ticketType}>{i18n.t('eventDetail.standardEntry')}</Text>
                  <Text style={styles.ticketPrice}>{eventDetails.entryFee || i18n.t('eventDetail.free')}</Text>
                </View>
                <TouchableOpacity style={styles.buyButton}>
                  <Text style={styles.buyButtonText}>{i18n.t('eventDetail.buy')}</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.ticketOption}>
                <View style={styles.ticketDetails}>
                  <Text style={styles.ticketType}>{i18n.t('eventDetail.vipAccess')}</Text>
                  <Text style={styles.ticketPrice}>300 MAD</Text>
                </View>
                <TouchableOpacity style={styles.buyButton}>
                  <Text style={styles.buyButtonText}>{i18n.t('eventDetail.buy')}</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.ticketOption}>
                <View style={styles.ticketDetails}>
                  <Text style={styles.ticketType}>{i18n.t('eventDetail.groupPass')}</Text>
                  <Text style={styles.ticketPrice}>500 MAD</Text>
                </View>
                <TouchableOpacity style={styles.buyButton}>
                  <Text style={styles.buyButtonText}>{i18n.t('eventDetail.buy')}</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <Button 
              title={i18n.t('eventDetail.close')} 
              style={styles.closeModalButton}
              onPress={handleCloseTicketModal}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// Main component with CopilotProvider
const EventDetailScreen: React.FC = () => {
  return (
    <CopilotProvider
      stepNumberComponent={() => null}
      tooltipStyle={styles.tooltip}
      backdropColor="rgba(0, 0, 0, 0.7)"
      animationDuration={300}
      overlay="svg"
      stopOnOutsideClick={true}
      labels={{
        skip: "Skip",
        previous: "Previous",
        next: "Next",
        finish: "Done"
      }}
    >
      <EventDetailScreenContent />
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
  content: {
    backgroundColor: '#fff',
    padding: 16,
  },
  eventTypeContainer: {
    backgroundColor: '#E8F5F0',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#008060',
  },
  eventType: {
    fontSize: 14,
    fontWeight: '500',
    color: '#008060',
  },
  infoContainer: {
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  footer: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  ticketButton: {
    backgroundColor: '#AE1913',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  ticketOptions: {
    marginBottom: 16,
  },
  ticketOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  ticketDetails: {
    flex: 1,
  },
  ticketType: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  ticketPrice: {
    fontSize: 14,
    color: '#666',
  },
  buyButton: {
    backgroundColor: '#AE1913',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  buyButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  closeModalButton: {
    backgroundColor: '#666',
  },
  tooltip: {
    backgroundColor: '#CE1126',
    borderRadius: 10,
  },
  imageGalleryHighlight: {
    width: '100%',
    overflow: 'hidden',
  },
  eventInfoHighlight: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: 12,
  },
  aboutHighlight: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: 12,
  },
  locationHighlight: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: 12,
  },
  ticketButtonHighlight: {
    width: '100%',
    overflow: 'hidden',
  },
  tourButton: {
    position: 'absolute',
    top: 50,
    right: 16,
    backgroundColor: '#FF6B6B',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tourButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 5,
  },
});

export default EventDetailScreen; 