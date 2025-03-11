import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useRef, useState } from 'react';
import { Dimensions, FlatList, Image, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Button from '../components/Button';
import ScreenHeader from '../components/ScreenHeader';
import ReservationPopup from '../containers/ReservationPopup';

interface RouteParams {
  id: string;
  title: string;
  imageUrl: string;
  price: number;
  isPrivate: boolean;
}

// Sample car images for testing
const CAR_IMAGES = [
  'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=2940&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?q=80&w=2940&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2940&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=2940&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=2940&auto=format&fit=crop',
];

const { width } = Dimensions.get('window');

const TransportDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { title, imageUrl, price, isPrivate } = route.params as RouteParams;
  const [isSaved, setIsSaved] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showReservation, setShowReservation] = useState(false);
  const flatListRef = useRef<FlatList>(null);

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

  const handleReservePress = () => {
    setShowReservation(true);
  };

  const handleCloseReservation = () => {
    setShowReservation(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title={title} onBack={handleBack} />

      <ScrollView style={styles.scrollView}>
        <View style={styles.imageSection}>
          <FlatList
            ref={flatListRef}
            data={CAR_IMAGES}
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
            style={[styles.saveButton, isSaved && styles.savedButton]} 
            onPress={handleSave}
          >
            <Ionicons 
              name={isSaved ? "bookmark" : "bookmark-outline"} 
              size={24} 
              color={isSaved ? "#fff" : "#000"} 
            />
          </TouchableOpacity>
          
          <View style={styles.paginationContainer}>
            <View style={styles.pagination}>
              {CAR_IMAGES.map((_, index) => (
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
          <View style={styles.transportTypeContainer}>
            <Text style={styles.transportType}>{isPrivate ? 'Private Transport' : 'Shared Transport'}</Text>
          </View>

          <Text style={styles.sectionTitle}>Specifications</Text>
          
          <View style={styles.specificationsContainer}>
            <View style={styles.specItem}>
              <Ionicons name="people-outline" size={20} color="#666" />
              <Text style={styles.specText}>5 seats</Text>
            </View>
            
            <View style={styles.specItem}>
              <Ionicons name="briefcase-outline" size={20} color="#666" />
              <Text style={styles.specText}>2 Large bags</Text>
            </View>
            
            <View style={styles.specItem}>
              <Ionicons name="car-outline" size={20} color="#666" />
              <Text style={styles.specText}>4 Doors</Text>
            </View>
            
            <View style={styles.specItem}>
              <Ionicons name="snow-outline" size={20} color="#666" />
              <Text style={styles.specText}>Air conditioning</Text>
            </View>
            
            <View style={styles.specItem}>
              <Ionicons name="time-outline" size={20} color="#666" />
              <Text style={styles.specText}>15-60 minutes</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.aboutText}>
            Book your transfer between the airport and the center of Marrakech (hotel/Riad) or vice versa. This transfer service operates 24/7 seven days a week.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button 
          title="Reserve Transport" 
          style={styles.reserveButton}
          icon={<Ionicons name="car" size={20} color="#fff" style={{ marginRight: 8 }} />}
          onPress={handleReservePress}
        />
      </View>

      <Modal
        visible={showReservation}
        transparent
        animationType="slide"
        onRequestClose={handleCloseReservation}
      >
        <ReservationPopup 
          onClose={handleCloseReservation}
          title={title}
          price={price}
        />
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
    backgroundColor: 'white',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  savedButton: {
    backgroundColor: '#666',
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 16,
    width: '100%',
    alignItems: 'center',
  },
  pagination: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: 4,
  },
  activePaginationDot: {
    backgroundColor: '#fff',
  },
  content: {
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  transportTypeContainer: {
    marginBottom: 20,
    alignSelf: 'flex-start',
    backgroundColor: '#F0F0F0',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  transportType: {
    fontSize: 12,
    color: '#4D4D4D',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    color: '#000',
  },
  specificationsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 16,
  },
  specText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  aboutText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#666',
    marginBottom: 24,
  },
  footer: {
    padding: 16,
    // borderTopWidth: 1,
    // borderTopColor: '#f0f0f0',
  },
  reserveButton: {
    backgroundColor: '#CE1126',
  },
});

export default TransportDetailScreen; 