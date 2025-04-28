import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import { Dimensions, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AboutSection from '../components/AboutSection';
import Button from '../components/Button';
import ImageGallery from '../components/ImageGallery';
import LocationSection from '../components/LocationSection';
import ScreenHeader from '../components/ScreenHeader';
import i18n from '../translations/i18n';
import { Event } from '../types/Event';

const { width } = Dimensions.get('window');

const EventDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as Event;
  
  const [isSaved, setIsSaved] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);

  // Get event details from route params
  const eventDetails = params;

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
      <View style={styles.headerContainer}>
        <ScreenHeader title={eventDetails.name} onBack={handleBack} />
      </View>

      <ScrollView style={styles.scrollView}>
        <ImageGallery 
          images={eventDetails.images || []}
          isSaved={isSaved}
          onSavePress={handleSave}
        />

        <View style={styles.content}>
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

          <AboutSection 
            title={i18n.t('eventDetail.about')} 
            text={eventDetails.description || i18n.t('eventDetail.noInfo')} 
          />

          <LocationSection 
            address={eventDetails.address} 
            mapUrl={eventDetails.mapUrl || `https://maps.google.com/?q=${eventDetails.address}`}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button 
          title={i18n.t('eventDetail.buyTickets')} 
          style={styles.ticketButton}
          icon={<Ionicons name="ticket" size={20} color="#fff" style={{ marginRight: 8 }} />}
          onPress={handleBuyTicket}
        />
      </View>

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF7F7',
  },
  scrollView: {
    flex: 1,
  },
  headerContainer: {
    paddingTop: 16,
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
    paddingRight: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
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
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  ticketDetails: {
    flex: 1,
  },
  ticketType: {
    fontSize: 16,
    fontWeight: '500',
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
    borderRadius: 8,
  },
  buyButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  closeModalButton: {
    backgroundColor: '#AE1913',
  },
});

export default EventDetailScreen; 