import React, { useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  Text,
  TouchableOpacity,
  Dimensions,
  FlatList,
  ViewToken
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import ScreenHeader from '../components/ScreenHeader';
import Button from '../components/Button';
import { RootStackParamList } from '../types/navigation';
import { Restaurant } from '../types/Restaurant';
import HeaderContainer from '../containers/HeaderContainer';
import AboutSection from '../components/AboutSection';
import LocationSection from '../components/LocationSection';
import ButtonFixe from '../components/ButtonFixe';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { toggleRestaurantBookmark } from '../store/restaurantSlice';

const { width, height } = Dimensions.get('window');



const RestaurantDetailScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const dispatch = useAppDispatch();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const { selectedRestaurant } = useAppSelector((state) => state.restaurant);


  const handleBack = () => {
    navigation.goBack();
  };

  const handleSave = () => {
    if (selectedRestaurant) {
      dispatch(toggleRestaurantBookmark(selectedRestaurant));
    }
  };


  const handleScroll = (event: any) => {
    const slideIndex = Math.floor(event.nativeEvent.contentOffset.x / width);
    setCurrentImageIndex(slideIndex);
  };

  const viewabilityConfig = {
    viewAreaCoveragePercentThreshold: 50, // Détecte quand une image est visible à 50% ou plus
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0) {
      // @ts-ignore
      setCurrentImageIndex(viewableItems[0].index);
    }
  }).current;


  const handleReservation = () => {
    console.log('Book a Reservation');
    // Implémentez la logique de réservation ici
  };

  return (
    <SafeAreaView style={styles.container}>

        <View style={styles.headerContainer}>
          <ScreenHeader title={selectedRestaurant!.name} />
        </View>
        
        

        <ScrollView style={styles.scrollView}>
          <View style={styles.imageContainer}>
            <View style={styles.imageSection}>
              <FlatList
                data={selectedRestaurant!.images}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                keyExtractor={(_, index) => index.toString()}
                renderItem={({ item }) => (
                  <Image source={{ uri: item }} style={styles.image} resizeMode="cover" />
                )}
              />

              <TouchableOpacity style={[styles.saveButton, selectedRestaurant!.saved && styles.savedButton]} onPress={handleSave}>
                <Ionicons
                  name={selectedRestaurant!.saved ? 'bookmark' : 'bookmark-outline'}
                  size={24}
                  color={selectedRestaurant!.saved ? '#fff' : '#000'}
                />
              </TouchableOpacity>

              <View style={styles.paginationContainer}>
                <View style={styles.pagination}>
                  {selectedRestaurant!.images?.map((_, index) => (
                    <View
                      key={index}
                      style={[styles.paginationDot, index === currentImageIndex && styles.activePaginationDot]}
                    />
                  ))}
                </View>
              </View>

            </View>
          </View>

          <View style={styles.content}>

            {/* Operating Hours Section */}
            <View style={styles.operatingHoursContainer}>
              <Ionicons name="time-outline" size={16} color="#137A08" />
              <Text style={styles.operatingHoursText}>
                Open until {selectedRestaurant!.endTime}              </Text>
            </View>

            {/* About Section */}
            <AboutSection
              text={selectedRestaurant!.description || "Bakery Breakfast Lunch in Marrakesh downtown. Gueliz. Fine French and Moroccan pastries since 1997...Bakery Breakfast Lunch in Marrakesh downtown. Gueliz. Fine French and Moroccan pastries since 1997...Bakery Breakfast Lunch in Marrakesh downtown. Gueliz. Fine French and Moroccan pastries since 1997...Bakery Breakfast Lunch in Marrakesh downtown. Gueliz. Fine French and Moroccan pastries since 1997...Bakery Breakfast Lunch in Marrakesh downtown. Gueliz. Fine French and Moroccan pastries since 1997...Bakery Breakfast Lunch in Marrakesh downtown. Gueliz. Fine French and Moroccan pastries since 1997...Bakery Breakfast Lunch in Marrakesh downtown. Gueliz. Fine French and Moroccan pastries since 1997..."}
            />

            {/* Location Section */}

            <LocationSection
              address={selectedRestaurant!.address || "175, Rue Mohamed El Begal, Marrakech 40000 Morocco"}
              mapUrl={`https://maps.app.goo.gl/${selectedRestaurant!.mapId}`}
            />
          </View>
        </ScrollView>

      <ButtonFixe title="Book a Reservation" onPress={handleReservation} />
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF7F7',
  },
  headerContainer: {
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  scrollView: {
    flex: 1,
  },

  imageSection: {
    position: 'relative',
    width: width,
    height: 240,
    backgroundColor: '#FFF7F7',
    overflow: 'hidden', // Pour s'assurer qu'aucun contenu ne déborde

  },
  image: {
    width: width,
    height: 240,
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
    elevation: 3,
  },
  savedButton: {
    backgroundColor: '#666',
  },
  content: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    paddingBlockEnd: '10%',
    borderTopRightRadius: 32,
    borderTopLeftRadius: 32,
  },
  operatingHoursContainer: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    marginBottom: 2,
    borderRadius: 30,
    backgroundColor: '#F0FFFA',
    paddingLeft: 10,
    paddingRight: -150,

  },
  operatingHoursText: {
    fontFamily: 'Raleway',
    marginLeft: 8,
    fontSize: 13,
    color: '#137A08',
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  aboutText: {
    fontSize: 16,
    color: '#666',
  },
  locationSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFF7F7',
  },
  imageContainer: {
    marginBottom: 20,
    backgroundColor: '#F6FAFF',
    width: 370,
    height: 234,
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: 20,
  },
  bottomContainer: {
    marginTop: 1,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    width: 415,
    height: 90,
    alignItems: 'center',
    alignSelf: 'center',
   backgroundColor: '#FFF7F7',
  },
  reservationButton: {
    marginTop: 12,
    width: 340,
    height: 53,
    borderRadius: 32,
    backgroundColor: '#AE1913',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 4px 20px 0px #AE191366',
  },
  reservationText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default RestaurantDetailScreen;
