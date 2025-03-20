import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useRef, useState } from 'react';
import { Dimensions, FlatList, Image, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AboutSection from '../components/AboutSection';        
import Button from '../components/Button';
import LocationSection from '../components/LocationSection';
import ScreenHeader from '../components/ScreenHeader';
import { Broker } from '../types/exchange-broker';

// Enhanced interface to align with transport card data structure
interface RouteParams {
  id: string;
  name: string;
  imageUrl?: string;
  location: string;
  rating?: number;
  isFeatured?: boolean;
  exchangeRates?: {
    buy: number;
    sell: number;
  };
  services?: string[];
  operatingHours?: string;
  contactNumber?: string;
  website?: string;
  about?: string;
}

// Sample broker office images for testing
const BROKER_IMAGES = [
  'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2940&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1556745753-b2904692b3cd?q=80&w=2866&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1556745757-8d76bdb6984b?q=80&w=2866&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2940&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=2940&auto=format&fit=crop',
];

// Enhanced sample broker details


const { width } = Dimensions.get('window');

const BrokerDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  const [isSaved, setIsSaved] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showContactModal, setShowContactModal] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Get broker details from sample data or route params
  const brokerDetails = route.params as Broker;

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
  };

  const handleScroll = (event: any) => {
    const slideIndex = Math.floor(event.nativeEvent.contentOffset.x / width);
    setCurrentImageIndex(slideIndex);
  };

  const handleContactPress = () => {
    setShowContactModal(true);
  };

  const handleCloseContactModal = () => {
    setShowContactModal(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <ScreenHeader title={brokerDetails.name} onBack={handleBack} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.imageSection}>
          <FlatList
            ref={flatListRef}
            data={BROKER_IMAGES}
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
          
          <View style={styles.paginationContainer}>
            <View style={styles.pagination}>
              {BROKER_IMAGES.map((_, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.paginationDot, 
                    index === currentImageIndex && styles.activePaginationDot
                  ]} 
                />
              ))}
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.brokerTypeContainer}>
            <Text style={styles.brokerType}>
              {brokerDetails.isFeatured ? 'Featured Broker' : 'Broker'}
            </Text>
          </View>

          <Text style={styles.sectionTitle}>Services</Text>
          
          <View style={styles.servicesContainer}>
            {brokerDetails.services?.map((service: string, index: number) => (
              <View key={index} style={styles.serviceItem}>
                <Ionicons name="checkmark-circle-outline" size={20} color="#008060" />
                <Text style={styles.serviceText}>{service}</Text>
              </View>
            ))}
          </View>

          <View style={styles.infoContainer}>
            <View style={styles.infoItem}>
              <Ionicons name="time-outline" size={20} color="#666" />
              <Text style={styles.infoText}>{brokerDetails.operatingHours}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Ionicons name="call-outline" size={20} color="#666" />
              <Text style={styles.infoText}>{brokerDetails.phoneNumber}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Ionicons name="globe-outline" size={20} color="#666" />
              <Text style={styles.infoText}>{brokerDetails.website}</Text>
            </View>
          </View>

          <AboutSection 
            title="About" 
            text={brokerDetails.description || 'No information available for this broker.'} 
          />

          <LocationSection address={brokerDetails.address} />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button 
          title="Contact Broker" 
          style={styles.contactButton}
          icon={<Ionicons name="call" size={20} color="#fff" style={{ marginRight: 8 }} />}
          onPress={handleContactPress}
        />
      </View>

      <Modal
        visible={showContactModal}
        transparent
        animationType="slide"
        onRequestClose={handleCloseContactModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Contact {brokerDetails.name}</Text>
              <TouchableOpacity onPress={handleCloseContactModal}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.contactOptions}>
              <TouchableOpacity style={styles.contactOption}>
                <Ionicons name="call" size={24} color="#008060" />
                <Text style={styles.contactOptionText}>Call</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.contactOption}>
                <Ionicons name="mail" size={24} color="#008060" />
                <Text style={styles.contactOptionText}>Email</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.contactOption}>
                <Ionicons name="logo-whatsapp" size={24} color="#008060" />
                <Text style={styles.contactOptionText}>WhatsApp</Text>
              </TouchableOpacity>
            </View>
            
            <Button 
              title="Close" 
              style={styles.closeButton}
              onPress={handleCloseContactModal}
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
  paginationContainer: {
    position: 'absolute',
    bottom: 16,
    width: '100%',
    alignItems: 'center',
  },
  pagination: {
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
  brokerTypeContainer: {
    backgroundColor: '#E8F5F0',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#008060',
  },
  brokerType: {
    color: '#008060',
    fontWeight: '600',
    fontSize: 14,
    
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  ratesContainer: {
    marginBottom: 16,
  },
  ratesTable: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 8,
  },
  rateRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  rateHeader: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f5f5f5',
    fontWeight: '600',
    textAlign: 'center',
    borderRightWidth: 1,
    borderRightColor: '#ddd',
  },
  rateCell: {
    flex: 1,
    padding: 10,
    textAlign: 'center',
    borderRightWidth: 1,
    borderRightColor: '#ddd',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
    color: '#000',
  },
  servicesContainer: {
    marginBottom: 16,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
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
    backgroundColor: '#FFF7F7',
    // borderTopWidth: 1,
    // borderTopColor: '#eee',
  },
  contactButton: {
    backgroundColor: '#008060',
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
});

export default BrokerDetailScreen; 