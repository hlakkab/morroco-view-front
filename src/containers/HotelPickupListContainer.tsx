import { Ionicons } from '@expo/vector-icons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CopilotStep, walkthroughable } from 'react-native-copilot';
import HotelPickupSvg from '../assets/serviceIcons/car-img.svg';
import CardItem from '../components/cards/CardItem';
import PickupCard from '../components/cards/PickupCard';
import FilterSelector from '../components/FilterSelector';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from '../components/AuthModal';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  setSelectedCity,
  toggleHotelPickupBookmark,
  togglePickupDirection,
} from '../store/hotelPickupSlice';
import i18n from '../translations/i18n';
import { RootStackParamList } from '../types/navigation';
import { HotelPickup } from '../types/transport';

// Create walkthroughable components
const WalkthroughableView = walkthroughable(View);

interface HotelPickupListContainerProps {
  pickups: HotelPickup[];
  cities: string[];
  selectedCity: string;
  onSelectCity: (city: string) => void;
  isLoading: boolean;
}

const HotelPickupListContainer: React.FC<
    HotelPickupListContainerProps
> = ({
       pickups,
       cities,
       selectedCity,
       onSelectCity,
       isLoading,
     }) => {
  const [selectedCityState, setSelectedCityState] = useState(selectedCity);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAuth();
  const bookmarks = useAppSelector((state) => state.bookmark.bookmarks);
  const { currentLanguage } = useLanguage();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const pickupDirection = useAppSelector(
      (state) => state.hotelPickup.pickupDirection
  );

  const handleSavePickup = (pickup: HotelPickup) => {
    if (!isAuthenticated()) {
      setShowAuthModal(true);
      return;
    }
    dispatch(toggleHotelPickupBookmark(pickup));
  };
  const handleCardPress = (item: HotelPickup) => {
    navigation.navigate('TransportDetail', {
      id: item.id,
      title: item.title,
      imageUrl: item.images[0] || '',
      price: item.price,
      isPrivate: item.private,
    });
  };
  const handleToggleDirection = () => {
    dispatch(togglePickupDirection());
  };

  // Animation pour le switch
  const scaleAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loopAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
    );

    loopAnimation.start();

    return () => {
      loopAnimation.stop(); // <-- Arrête proprement l'animation quand le composant est démonté ou mis à jour
    };
  }, [pickupDirection]); // <-- Ajout de cette dépendance pour relancer l'animation lors du changement


  // Composant du bouton animé
  const SwitchButton: React.FC = () => (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
            style={[styles.switchButton, styles.buttonShadow]}
            onPress={handleToggleDirection}
        >
          <Ionicons name="arrow-forward" size={17} color="#fff"  />
        </TouchableOpacity>
      </Animated.View>
  );

  // Préparer les options de ville pour le filtre
  const orderedCities = [
    selectedCity,
    ...cities.filter((city) => city !== selectedCity),
  ];
  const cityOptions = orderedCities.map((city) => ({
    id: city,
    label: city,
    icon: (
        <Ionicons
            name="location-outline"
            size={16}
            color={selectedCity === city ? '#fff' : '#888'}
            style={{ marginRight: 4 }}
        />
    ),
  }));

  return (
      <View style={styles.container}>
        <View style={styles.filtersContainer}>
          <View style={styles.filterFromSection}>
            <CopilotStep
              text={i18n.t('copilot.filterHotelsByCity')}
              order={2}
              name="citySelector"
            >
              <WalkthroughableView style={styles.cityHighlight}>
                <FilterSelector
                    title={i18n.t('pickup.city')}
                    options={cityOptions}
                    selectedOptionId={selectedCity}
                    onSelectOption={(option) => {
                      setSelectedCityState((_prev) => {
                        onSelectCity(option);
                        return option;
                      });
                    }}
                    containerStyle={styles.filterContainer}
                />
              </WalkthroughableView>
            </CopilotStep>
          </View>

          <View style={styles.directionContainer}>
            <CopilotStep
              text={i18n.t('copilot.selectDirectionType')}
              order={3}
              name="directionToggle"
            >
              <WalkthroughableView style={styles.directionHighlight}>
                <View style={styles.directionControlsWrapper}>
                  <Text style={styles.chooseDirectionText}>
                    {i18n.t('pickup.chooseDirection', { defaultValue: 'Choose Direction :' })}
                  </Text>
                  <View style={styles.directionControls}>
                    {pickupDirection === 'a2h' ? (
                        // Airport → Hotel
                        <>
                          <View style={styles.endpointWithLabel}>
                            <View style={[styles.directionEndpoint, styles.activeEndpoint]}>
                              <Ionicons name="airplane" size={20} color="#CE1126" />
                            </View>
                            <Text style={styles.endpointLabel}>
                              {i18n.t('pickup.airport')}
                            </Text>
                          </View>

                          <View style={styles.directionMiddle}>
                            <SwitchButton />
                            <Text style={styles.toLabel}>
                              {i18n.t('pickup.toDirection')}
                            </Text>
                          </View>

                          <View style={styles.endpointWithLabel}>
                            <View style={styles.directionEndpoint}>
                              <Ionicons name="home" size={20} color="#777" />
                            </View>
                            <Text style={styles.endpointLabel}>
                              {i18n.t('pickup.hotel')}
                            </Text>
                          </View>
                        </>
                    ) : (
                        // Hotel → Airport
                        <>
                          <View style={styles.endpointWithLabel}>
                            <View style={[styles.directionEndpoint, styles.activeEndpoint]}>
                              <Ionicons name="home" size={20} color="#CE1126" />
                            </View>
                            <Text style={styles.endpointLabel}>
                              {i18n.t('pickup.hotel')}
                            </Text>
                          </View>

                          <View style={styles.directionMiddle}>
                            <SwitchButton />
                            <Text style={styles.toLabel}>
                              {i18n.t('pickup.toDirection')}
                            </Text>
                          </View>

                          <View style={styles.endpointWithLabel}>
                            <View style={styles.directionEndpoint}>
                              <Ionicons name="airplane" size={20} color="#777" />
                            </View>
                            <Text style={styles.endpointLabel}>
                              {i18n.t('pickup.airport')}
                            </Text>
                          </View>
                        </>
                    )}
                  </View>
                </View>
              </WalkthroughableView>
            </CopilotStep>
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          {i18n.t('pickup.availablePickups')}
        </Text>

        {pickups.length === 0 ? (
            <View style={styles.noPickupsContainer}>
              <Ionicons name="search-outline" size={48} color="#ccc" />
              <Text style={styles.noPickupsText}>
                {i18n.t('pickup.noPickupsAvailable')}
              </Text>
            </View>
        ) : (
            <CopilotStep
              text={i18n.t('copilot.browsePickups')}
              order={4}
              name="pickupList"
            >
              <WalkthroughableView style={styles.pickupListHighlight}>
                <FlatList
                    data={pickups}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <PickupCard
                            item={item}
                            handleSavePickup={handleSavePickup}
                            handleCardPress={handleCardPress}
                        />
                    )}
                    showsVerticalScrollIndicator={false}
                />
              </WalkthroughableView>
            </CopilotStep>
        )}

        <AuthModal
          visible={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          type="auth"
        />
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filterFromSection: {
    backgroundColor: '#FCEBEC',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  filterContainer: {
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
    color: '#666',
  },
  noPickupsText: {
    textAlign: 'center',
    color: '#888',
    fontSize: 16,
  },
  noPickupsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 150,
  },
  directionContainer: {
    marginTop: 8,
    alignItems: 'center',
  },
  directionControlsWrapper: {
    backgroundColor: '#FCEBEC',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    width: '100%',
  },
  chooseDirectionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    marginBottom: 10,
  },
  directionControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  endpointWithLabel: {
    alignItems: 'center',
    width: 80,
  },
  directionEndpoint: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
    backgroundColor: '#f5f5f5',
    marginBottom: 6,
  },
  activeEndpoint: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  directionMiddle: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  switchButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
    backgroundColor: '#CE1126',
    marginBottom: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  buttonShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  endpointLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  toLabel: {
    fontSize: 12,
    color: '#666',
  },
  cityHighlight: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: 12,
  },
  directionHighlight: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: 12,
  },
  pickupListHighlight: {
    flex: 1,
    width: '100%',
    overflow: 'hidden',
  },
});

export default HotelPickupListContainer;
