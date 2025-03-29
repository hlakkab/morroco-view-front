import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import AboutSection from '../components/AboutSection';
import ImageGallery from '../components/ImageGallery';
import LocationSection from '../components/LocationSection';
import ScreenHeader from '../components/ScreenHeader';
import { toggleArtisanBookmark } from '../store/artisanSlice';
import { useAppDispatch } from '../store/hooks';
import { Artisan } from '../types/Artisan';
import { getRandomArtisanImages } from '../utils/imageUtils';

// Default artisan souk images if none are provided
const DEFAULT_SOUK_IMAGES = getRandomArtisanImages(3);

const ArtisanDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as Artisan;
  const dispatch = useAppDispatch();

  const [saved, setSaved] = useState(params.saved || false);

  // Get artisan details from route params
  const artisanDetails = { ...params, saved };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSave = () => {
    // Toggle saved state
    setSaved(!saved);
    
    dispatch(toggleArtisanBookmark(artisanDetails));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <ScreenHeader title={artisanDetails.name} onBack={handleBack} />
      </View>

      <ScrollView style={styles.scrollView}>
        <ImageGallery 
          images={artisanDetails.images && artisanDetails.images.length > 0 
            ? artisanDetails.images 
            : DEFAULT_SOUK_IMAGES}
          isSaved={saved}
          onSavePress={handleSave}
        />

        <View style={styles.content}>
          <View style={styles.artisanTypeContainer}>
            <Text style={styles.artisanType}>
              {artisanDetails.type} Souk
            </Text>
          </View>

          <View style={styles.infoContainer}>
            <View style={styles.infoItem}>
              <Ionicons name="time-outline" size={20} color="#666" />
              <Text style={styles.infoText}>
                {artisanDetails.visitingHours || 'Typically 9:00 - 19:00 (varies by shop)'}
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <Ionicons name="cash-outline" size={20} color="#666" />
              <Text style={styles.infoText}>Entry: Free</Text>
            </View>
            
            {artisanDetails.specialties && artisanDetails.specialties.length > 0 && (
              <View style={styles.infoItem}>
                <Ionicons name="star-outline" size={20} color="#666" />
                <Text style={styles.infoText}>
                  Known for: {artisanDetails.specialties.join(', ')}
                </Text>
              </View>
            )}
            
            {artisanDetails.website && (
              <View style={styles.infoItem}>
                <Ionicons name="globe-outline" size={20} color="#666" />
                <Text style={styles.infoText}>{artisanDetails.website}</Text>
              </View>
            )}
          </View>

          <AboutSection 
            title="About" 
            text={artisanDetails.description || 'No information available for this artisan souk.'} 
          />

          <LocationSection 
            address={artisanDetails.address} 
            mapUrl={`https://maps.google.com/?q=${encodeURIComponent(artisanDetails.address)}`}
          />

          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>Visitor Tips</Text>
            <View style={styles.tipItem}>
              <Ionicons name="chatbubble-outline" size={20} color="#CE1126" />
              <Text style={styles.tipText}>Bargaining is expected and part of the experience.</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="wallet-outline" size={20} color="#CE1126" />
              <Text style={styles.tipText}>Have cash ready, preferably small bills.</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="camera-outline" size={20} color="#CE1126" />
              <Text style={styles.tipText}>Ask before taking photos of artisans or their work.</Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
  artisanTypeContainer: {
    backgroundColor: '#E8F5F0',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#008060',
  },
  artisanType: {
    color: '#008060',
    fontWeight: '600',
    fontSize: 14,
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
  tipsContainer: {
    backgroundColor: '#FCEBEC',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
    marginBottom: 20,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  tipText: {
    marginLeft: 10,
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
});

export default ArtisanDetailScreen; 