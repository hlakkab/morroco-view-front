import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Platform, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CopilotProvider, CopilotStep, useCopilot, walkthroughable } from 'react-native-copilot';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AboutSection from '../components/AboutSection';
import ImageGallery from '../components/ImageGallery';
import LocationSection from '../components/LocationSection';
import ScreenHeader from '../components/ScreenHeader';
import { toggleArtisanBookmark } from '../store/artisanSlice';
import { useAppDispatch } from '../store/hooks';
import i18n from '../translations/i18n';
import { Artisan } from '../types/Artisan';
import { getRandomArtisanImages } from '../utils/imageUtils';

const TOUR_FLAG = '@artisanDetailTourSeen';

// Default artisan souk images if none are provided
const DEFAULT_SOUK_IMAGES = getRandomArtisanImages(3);

// Create walkthroughable components
const WalkthroughableView = walkthroughable(View);

// Content component with Copilot functionality
const ArtisanDetailScreenContent: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as Artisan;
  const dispatch = useAppDispatch();
  const { start: startTour, copilotEvents, visible } = useCopilot();
  const [tourStarted, setTourStarted] = useState(false);
  const [hasSeenTour, setHasSeenTour] = useState<boolean | null>(null);

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

  // ─── 1. Lire si le tour a déjà été vu ─────────────────
  useEffect(() => {
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

  // ─── 2. Démarrage automatique une seule fois ──────────
  useEffect(() => {
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

  // ─── 3. Enregistrer la fin ou le skip du tour ────────
  useEffect(() => {
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <ScreenHeader 
          title={artisanDetails.name} 
          onBack={handleBack}
          showTour={!visible}
          onTourPress={handleStartTour}
        />
      </View>

      <ScrollView style={styles.scrollView}>
        <CopilotStep
          text={i18n.t('copilot.browseImages')}
          order={1}
          name="gallery"
        >
          <WalkthroughableView style={styles.walkthroughContainer}>
            <ImageGallery 
              images={artisanDetails.images && artisanDetails.images.length > 0 
                ? artisanDetails.images 
                : DEFAULT_SOUK_IMAGES}
              isSaved={saved}
              onSavePress={handleSave}
            />
          </WalkthroughableView>
        </CopilotStep>

        <View style={styles.content}>
          <CopilotStep
            text={i18n.t('copilot.viewArtisanInfo')}
            order={2}
            name="info"
          >
            <WalkthroughableView style={styles.walkthroughContainer}>
              <View style={styles.artisanTypeContainer}>
                <Text style={styles.artisanType}>
                  {artisanDetails.type} {i18n.t('artisans.souk')}
                </Text>
              </View>

              <View style={styles.infoContainer}>
                <View style={styles.infoItem}>
                  <Ionicons name="time-outline" size={20} color="#666" />
                  <Text style={styles.infoText}>
                    {artisanDetails.visitingHours || i18n.t('artisans.visitingHours')}
                  </Text>
                </View>
                
                <View style={styles.infoItem}>
                  <Ionicons name="cash-outline" size={20} color="#666" />
                  <Text style={styles.infoText}>{i18n.t('artisans.entryFee')}</Text>
                </View>
                
                {artisanDetails.specialties && artisanDetails.specialties.length > 0 && (
                  <View style={styles.infoItem}>
                    <Ionicons name="star-outline" size={20} color="#666" />
                    <Text style={styles.infoText}>
                      {i18n.t('artisans.knownFor')} {artisanDetails.specialties.join(', ')}
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
            </WalkthroughableView>
          </CopilotStep>

          <CopilotStep
            text={i18n.t('copilot.learnArtisanHistory')}
            order={3}
            name="about"
          >
            <WalkthroughableView style={styles.walkthroughContainer}>
              <AboutSection 
                title={i18n.t('artisans.about')} 
                text={artisanDetails.description || i18n.t('artisans.noInformation')} 
              />
            </WalkthroughableView>
          </CopilotStep>

          <CopilotStep
            text={i18n.t('copilot.findArtisanLocation')}
            order={4}
            name="location"
          >
            <WalkthroughableView style={styles.walkthroughContainer}>
              <LocationSection 
                address={artisanDetails.address} 
                mapUrl={`https://maps.google.com/?q=${encodeURIComponent(artisanDetails.address)}`}
                title={i18n.t('artisans.location')}
              />
            </WalkthroughableView>
          </CopilotStep>

          <CopilotStep
            text={i18n.t('copilot.getVisitTips')}
            order={5}
            name="tips"
          >
            <WalkthroughableView style={styles.walkthroughContainer}>
              <View style={styles.tipsContainer}>
                <Text style={styles.tipsTitle}>{i18n.t('artisans.visitorTips')}</Text>
                <View style={styles.tipItem}>
                  <Ionicons name="chatbubble-outline" size={20} color="#CE1126" />
                  <Text style={styles.tipText}>{i18n.t('artisans.bargainingTip')}</Text>
                </View>
                <View style={styles.tipItem}>
                  <Ionicons name="wallet-outline" size={20} color="#CE1126" />
                  <Text style={styles.tipText}>{i18n.t('artisans.cashTip')}</Text>
                </View>
                <View style={styles.tipItem}>
                  <Ionicons name="camera-outline" size={20} color="#CE1126" />
                  <Text style={styles.tipText}>{i18n.t('artisans.photoTip')}</Text>
                </View>
              </View>
            </WalkthroughableView>
          </CopilotStep>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Main component with CopilotProvider
const ArtisanDetailScreen: React.FC = () => {
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
      arrowSize={8}
      arrowColor="#FFF7F7"
    >
      <ArtisanDetailScreenContent />
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
  walkthroughContainer: {
    width: '100%',
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
  }
});

export default ArtisanDetailScreen; 