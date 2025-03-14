import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, Image, Text, TouchableOpacity, Dimensions, FlatList } from 'react-native';
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
import SaveButton from '../components/SaveButtonPrf';
import ButtonFixe from '../components/ButtonFixe';

const { width } = Dimensions.get('window');

interface RouteParams extends Partial<Restaurant> {
  id: string;
  title: string;
}

const RestaurantDetailScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const params = route.params as RouteParams;

  const [isSaved, setIsSaved] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

  const handleReservation = () => {
    console.log('Book a Reservation');
    // Implémentez la logique de réservation ici
  };

  // Utilise les images fournies ou, à défaut, l'image principale
  const images: string[] =
    (params.images && params.images.length > 0 ? params.images : [params.image]) as string[];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* Header fixe 
        <View style={styles.headerFixed}>
        </View>
        */}
        <ScreenHeader title={params.title} />

        <ScrollView style={styles.scrollView}>
          <View style={styles.imageContainer}>
            <View style={styles.imageSection}>
              <FlatList
                data={images}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                keyExtractor={(_, index) => index.toString()}
                renderItem={({ item }) => (
                  <Image source={{ uri: item }} style={styles.image} resizeMode="cover" />
                )}
              />

              {/*<TouchableOpacity style={[styles.saveButton, isSaved && styles.savedButton]} onPress={handleSave}>
                <Ionicons
                  name={isSaved ? 'bookmark' : 'bookmark-outline'}
                  size={24}
                  color={isSaved ? '#fff' : '#000'}
                />
              </TouchableOpacity>*/}
              <SaveButton />


              <View style={styles.paginationContainer}>
                <View style={styles.pagination}>
                  {images.map((_, index) => (
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
                Open until {params.endTime}              </Text>
            </View>

            {/* About Section */}
            <AboutSection
              text={params.description || "Bakery Breakfast Lunch in Marrakesh downtown. Gueliz. Fine French and Moroccan pastries since 1997...Bakery Breakfast Lunch in Marrakesh downtown. Gueliz. Fine French and Moroccan pastries since 1997...Bakery Breakfast Lunch in Marrakesh downtown. Gueliz. Fine French and Moroccan pastries since 1997...Bakery Breakfast Lunch in Marrakesh downtown. Gueliz. Fine French and Moroccan pastries since 1997...Bakery Breakfast Lunch in Marrakesh downtown. Gueliz. Fine French and Moroccan pastries since 1997...Bakery Breakfast Lunch in Marrakesh downtown. Gueliz. Fine French and Moroccan pastries since 1997...Bakery Breakfast Lunch in Marrakesh downtown. Gueliz. Fine French and Moroccan pastries since 1997..."}
            />

            {/* Location Section */}

            <LocationSection
              address={params.address || "175, Rue Mohamed El Begal, Marrakech 40000 Morocco"}
              mapUrl={params.mapUrl}
            />
          </View>
        </ScrollView>

        {/* Bottom Section: Book a Reservation
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.reservationButton}>
          <Text style={styles.reservationText}>
          Book a Reservation
          </Text>
        </TouchableOpacity>
      </View>
      */}
      <ButtonFixe title="Book a Reservation" onPress={handleReservation} />

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF7F7',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFF7F7',
  },
  headerFixed: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
  //  backgroundColor: '#FFF7F7',
    zIndex: 10, // Assure que l'en-tête reste au-dessus
    // elevation: 3, // Pour Android
    shadowColor: '#000', // Pour iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    backgroundColor: 'red',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 1,
    paddingBottom: 20,
    //paddingTop: 100,
    //paddingTop: 100,
    //marginTop: -70,
  },
  imageSection: {
    position: 'relative',
    width: '100%',
    height: 240,
    backgroundColor: '#FFF7F7',
  },

  image: {

    width: 370,
    height: 234,
    alignItems: 'center',
    borderRadius: 30,
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
    flex: 1,
    width: '100%',
    backgroundColor: '#fff',
    padding: 16,
    paddingBlockEnd: '10%',
    marginTop: 10,
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
    marginTop: 30,
    //marginLeft: 10,
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: 30,
  },
  bottomContainer: {
    marginTop: 2,
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
