import Fontisto from '@expo/vector-icons/Fontisto';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Dimensions, Image, PanResponder, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import { CopilotProvider, CopilotStep, useCopilot, walkthroughable } from 'react-native-copilot';
import CloseButton from '../assets/img/CloseButton.svg';
import StadiumIconPopup from '../assets/img/stadium_icon_popup.svg';
import { useLanguage } from '../contexts/LanguageContext';
import { RootState } from '../store';
import { useAppDispatch } from '../store/hooks';
import { buyTicket, resetTicketPurchaseStatus, toggleMatchBookmark } from '../store/matchSlice';
import i18n from '../translations/i18n';
import { Match } from '../types/match';
import { getFlagUrl } from '../utils/flagResolver';
import AboutSection from './AboutSection';
import ButtonFixe from "./ButtonFixe";
import LocationSection from './LocationSection';
import TicketPurchaseStatus from './TicketPurchaseStatus';

export interface MatchPopupProps {
  onClose: () => void;
}

// Create walkthroughable components
const WalkthroughableView = walkthroughable(View);

const MatchPopupContent: React.FC<MatchPopupProps> = ({ onClose }) => {
  const dispatch = useAppDispatch();
  const { currentLanguage } = useLanguage();
  const { currentMatch, ticketPurchaseStatus, ticketPurchaseError } 
    = useSelector((state: RootState) => state.match);
  const { start: startTour, copilotEvents, visible: tourVisible } = useCopilot();
  const [tourStarted, setTourStarted] = useState(false);

  // Reset ticket purchase status when component unmounts
  useEffect(() => {
    return () => {
      dispatch(resetTicketPurchaseStatus());
    };
  }, [dispatch]);

  // Handle successful ticket purchase
  useEffect(() => {
    if (ticketPurchaseStatus === 'succeeded') {
      Alert.alert('Success', 'Ticket purchased successfully!');
      dispatch(resetTicketPurchaseStatus());
    } else if (ticketPurchaseStatus === 'failed' && ticketPurchaseError) {
      Alert.alert('Error', ticketPurchaseError);
      dispatch(resetTicketPurchaseStatus());
    }
  }, [ticketPurchaseStatus, ticketPurchaseError, dispatch]);

  // Créer une valeur animée pour le geste de glissement
  const pan = React.useRef(new Animated.ValueXY()).current;

  // Créer un pan responder pour le "drag to dismiss"
  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        // Permettre uniquement un mouvement vers le bas
        if (gestureState.dy > 0) {
          Animated.event([null, { dy: pan.y }], { useNativeDriver: false })(_, gestureState);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          // Si glissé de plus de 100 unités vers le bas, fermer le modal
          onClose();
        } else {
          // Sinon, réinitialiser la position
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false
          }).start();
        }
      }
    })
  ).current;

  // Start the tour automatically when the component mounts
  useEffect(() => {
    if (!tourStarted) {
      const timer = setTimeout(() => {
        startTour();
        setTourStarted(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [startTour, tourStarted]);

  // Handle copilot events
  useEffect(() => {
    const handleStop = () => {
      console.log('Tour completed or stopped');
    };

    copilotEvents.on('stop', handleStop);
    return () => {
      copilotEvents.off('stop', handleStop);
    };
  }, [copilotEvents]);

  const handleSave = () => {
    if (currentMatch) {
      dispatch(toggleMatchBookmark(currentMatch));
    }
  };

  const handleBuyTicket = () => {
    if (currentMatch && currentMatch.id) {
      dispatch(buyTicket(currentMatch.id));
      onClose();
    } else {
      Alert.alert('Error', 'Cannot purchase ticket for this match');
    }
  };

  // Add a button to manually start the tour
  const handleStartTour = () => {
    startTour();
  };

  // If no current match is available, return null or a loading state
  if (!currentMatch) {
    return (
      <View style={styles.container}>
        <View style={styles.popup}>
          <ActivityIndicator size="large" color="#AE1913" />
        </View>
      </View>
    );
  }

  return (
    <Animated.View
      style={[styles.container, { transform: [{ translateY: pan.y }] }]}>
      <View style={[styles.popup]}>
        {/* Manual tour button */}
        {!tourVisible && (
          <TouchableOpacity style={styles.tourButton} onPress={handleStartTour}>
            <Ionicons name="information-circle-outline" size={20} color="#FFFFFF" />
            <Text style={styles.tourButtonText}>Tour Guide</Text>
          </TouchableOpacity>
        )}

        {/* Header blanc */}
        <View style={styles.headerSection}>
          {/* Drag handle */}
          <View style={styles.dragHandleContainer} {...panResponder.panHandlers}>
            <View style={styles.dragHandle} />
          </View>

          {/* Label de status */}
          <View style={styles.statusLabel}>
            <Ionicons name="football" size={15} color="#0000FF" />
            <Text style={styles.statusLabelText}> TBD</Text>
          </View>

          {/* Titre du match */}
          <Text style={styles.matchTitle}>{currentMatch.homeTeam} Vs. {currentMatch.awayTeam}</Text>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <CloseButton />
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
          bounces={true}
          nestedScrollEnabled={true}
        >
          <View style={styles.content}>
            <CopilotStep
              text="View match details including teams, date, time and venue"
              order={1}
              name="match-details"
            >
              <WalkthroughableView style={styles.grandContainer}>
                <TouchableOpacity
                  style={[styles.saveButton, currentMatch.saved && styles.savedButton]}
                  onPress={handleSave}
                >
                  <Ionicons
                    name={currentMatch.saved ? "bookmark" : "bookmark-outline"}
                    size={24}
                    color={currentMatch.saved ? "#888888" : "#000"}
                  />
                </TouchableOpacity>

                <View style={styles.teamsContainer}>
                  <View style={styles.teamContainer}>
                    <View style={styles.flagContainer}>
                      <Image
                        source={{ uri: getFlagUrl(currentMatch.homeTeam) }}
                        style={styles.flag}
                      />
                    </View>
                  </View>

                  <Text style={styles.vsText}>{i18n.t('matches.vs')}</Text>

                  <View style={styles.teamContainer}>
                    <View style={styles.flagContainer}>
                      <Image
                        source={{ uri: getFlagUrl(currentMatch.awayTeam) }}
                        style={styles.flag}
                      />
                    </View>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  {/* Date */}
                  <View style={styles.detailItem}>
                    <View style={styles.iconTitleContainer}>
                      <Fontisto name="date" size={16} color="#656565" />
                      <Text style={styles.detailTitle}>{i18n.t('matches.date')}</Text>
                    </View>
                    <Text style={styles.detailValue}>
                      {new Date(currentMatch.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </Text>
                  </View>

                  {/* Séparateur 1 */}
                  <View style={styles.separator}></View>

                  {/* Time */}
                  <View style={styles.detailItem}>
                    <View style={styles.iconTitleContainer}>
                      <MaterialCommunityIcons name="clock-outline" size={16} color="#656565" />
                      <Text style={styles.detailTitle}>{i18n.t('matches.time')}</Text>
                    </View>
                    <Text style={styles.detailValue}>
                      {currentMatch.date.includes("T")
                        ? new Date(currentMatch.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
                        : "21:00"}
                    </Text>
                  </View>

                  {/* Séparateur 2 */}
                  <View style={styles.separator}></View>

                  {/* Stadium */}
                  <View style={styles.detailItem}>
                    <View style={styles.iconTitleContainer}>
                      <StadiumIconPopup width={16} height={16} />
                      <Text style={styles.detailTitle}>{i18n.t('matches.stadium')}</Text>
                    </View>
                    <Text style={styles.detailValue}>{currentMatch.spot?.name || "Unknown"}</Text>
                  </View>
                </View>
              </WalkthroughableView>
            </CopilotStep>

            <CopilotStep
              text="Read about the match and its significance"
              order={2}
              name="about-section"
            >
              <WalkthroughableView>
                <AboutSection
                  text={currentMatch.about || "Bakery Breakfast Lunch in Marrakesh downtown. Gueliz. Fine French and Moroccan pastries since 1997..."}
                />
              </WalkthroughableView>
            </CopilotStep>

            <CopilotStep
              text="Find the match location and get directions"
              order={3}
              name="location-section"
            >
              <WalkthroughableView>
                <LocationSection
                  address={currentMatch.spot?.address || "175, Rue Mohamed El Begal, Marrakech 40000 Morocco"}
                  mapUrl={currentMatch.spot?.mapId}
                />
              </WalkthroughableView>
            </CopilotStep>

            <TicketPurchaseStatus
              status={ticketPurchaseStatus}
              error={ticketPurchaseError}
            />
          </View>
        </ScrollView>

        <CopilotStep
          text="Purchase tickets for the match"
          order={4}
          name="buy-tickets"
        >
          <WalkthroughableView>
            <ButtonFixe title={i18n.t('matches.buyTickets')} onPress={handleBuyTicket} />
          </WalkthroughableView>
        </CopilotStep>
      </View>
    </Animated.View>
  );
};

const MatchPopup: React.FC<MatchPopupProps> = (props) => {
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
      <MatchPopupContent {...props} />
    </CopilotProvider>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  popup: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    flexDirection: 'column',
  },
  content: {
    flex: 1,
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  // Nouveaux styles pour le drag handle
  divider: {
    height: 1,
    backgroundColor: '#eee',
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingTop: 12,
    width: '100%',
  },
  dragHandle: {
    width: 100,
    height: 5,
    backgroundColor: '#D3D3D3',
    borderRadius: 2.5,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  scrollView: {
   // flex: 1,
    width: '100%',
  },
  matchTitle: {

    fontFamily: 'Raleway',
    fontWeight: '700',
    fontSize: 24,
    color: '#000000',
  },
  statusLabel: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 20,
    paddingVertical: 2,
    paddingHorizontal: 5,
    backgroundColor: '#F6FAFF',
    marginBottom: 5
  },
  statusLabelText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0000FF',
    marginLeft: 5,
  },
  grandContainer: {
    backgroundColor: '#F6FAFF',
    alignItems: 'center',
    borderRadius: 11,
  },
  teamsContainer: {
    width: 215,
    height: 149,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
  },
  teamContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flagContainer: {
    width: 72,
    height: 52,
    borderRadius: 10,
    overflow: 'hidden',
  },
  flag: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  teamName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  vsText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  teamImage: {
    width: 215,
    height: 149,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  detailRow: {
    flexDirection: 'row',
    //   alignItems: 'center',
    backgroundColor: '#F8F9FF',
    marginBottom: 10
  },
  detailItem: {
    //alignItems: 'center',
    justifyContent: 'flex-start',
  },
  iconTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  iconTitleStadium: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginRight: 4,
  },
  iconTitleDate: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginRight: 24,
  },
  iconTitleTime: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginRight: 9,
  },
  separator: {
    width: 1,
    height: 60,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 8
  },
  detailTitle: {
    color: '#656565',
    fontFamily: 'Raleway',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  detailValue: {
    width: 100,
    fontFamily: 'Raleway',
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
  },

  bottomContainer: {
    borderRadius: 4,
    alignItems: 'center',
  },
  addToTourText: {
    marginTop: -5,
    height: 40,
    color: '#CE1126',
    fontSize: 17,
    fontWeight: '400',
  },
  buyTicketsButton: {
    marginTop: 8,
    width: '80%',
    paddingVertical: 15,
    borderRadius: 32,
    backgroundColor: '#AE1913',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 4px 20px 0px #AE191366',
  },
  disabledButton: {
    backgroundColor: '#D3D3D3',
    opacity: 0.7,
  },
  buyTicketsText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  headerSection: {
    paddingHorizontal: 20,
    backgroundColor: 'white',
    borderTopLeftRadius: 32, // Conserve l'arrondi du popup parent
    borderTopRightRadius: 32, // Conserve l'arrondi du popup parent
    paddingBottom: 15, // Ajoute un peu d'espace après le titre
    zIndex: 1, // S'assure que ce conteneur reste au-dessus du ScrollView
  },
  saveButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    //backgroundColor: 'white',
    opacity: 0.5,
    borderRadius: 20,
    borderWidth: 1.7,
    padding: 3,
    borderColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    //shadowColor: '#000',
    //shadowOffset: { width: 0, height: 2 },
    //shadowOpacity: 0.2,
    //shadowRadius: 4,
    //elevation: 4,
  },
  savedButton: {
    // backgroundColor: 'grey',
    backgroundColor: '#E6E6E6',
    borderColor: '#E6E6E6',
    opacity: 1,
  },
  tooltip: {
    backgroundColor: '#CE1126',
    borderRadius: 10,
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

export default MatchPopup;