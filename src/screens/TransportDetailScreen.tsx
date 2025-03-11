import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, FlatList, Image, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import Button from '../components/Button';
import ScreenHeader from '../components/ScreenHeader';
import ReservationPopup from '../containers/ReservationPopup';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchPickupDetails, clearPickupDetails } from '../store/hotelPickupDetailsSlice';

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
  const { id, title } = route.params as RouteParams;
  const dispatch = useAppDispatch();
  const { currentPickup, loading, error } = useAppSelector((state) => state.hotelPickupDetails);
  
  const [isSaved, setIsSaved] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showReservation, setShowReservation] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    dispatch(fetchPickupDetails(id)).unwrap();
    return () => {
      dispatch(clearPickupDetails());
    };
  }, [dispatch, id]);

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

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!currentPickup) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>No pickup details found</Text>
      </View>
    );
  }

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
            <Text style={styles.transportType}>
              {currentPickup.private ? 'Private Pickup' : 'Shared Pickup'}
            </Text>
          </View>

          <Text style={styles.sectionTitle}>Specifications</Text>
          
          <View style={styles.specificationsContainer}>
            <View style={styles.specItem}>
              <Ionicons name="people-outline" size={20} color="#666" />
              <Text style={styles.specText}>{currentPickup.nbSeats} seats</Text>
            </View>
            
            <View style={styles.specItem}>
              <Ionicons name="briefcase-outline" size={20} color="#666" />
              <Text style={styles.specText}>{currentPickup.bagCapacity} Large bags</Text>
            </View>
            
            <View style={styles.specItem}>
              <Ionicons name="car-outline" size={20} color="#666" />
              <Text style={styles.specText}>{currentPickup.nbDoors} Doors</Text>
            </View>
            
            <View style={styles.specItem}>
              <Ionicons name="snow-outline" size={20} color="#666" />
              <Text style={styles.specText}>
                {currentPickup.airConditioning ? 'Air conditioning' : 'No air conditioning'}
              </Text>
            </View>
            
            <View style={styles.specItem}>
              <Ionicons name="time-outline" size={20} color="#666" />
              <Text style={styles.specText}>60 min</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.aboutText}>{currentPickup.about}</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button 
          title="Reserve Pickup" 
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
          title={currentPickup.title}
          price={currentPickup.price}
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
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
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
  },
  reserveButton: {
    backgroundColor: '#CE1126',
  },
});

export default TransportDetailScreen; 