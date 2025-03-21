import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Animated, PanResponder, Dimensions, ActivityIndicator, Alert } from 'react-native';
import Fontisto from '@expo/vector-icons/Fontisto';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import StadiumIconPopup from '../assets/img/stadium_icon_popup.svg';
import CloseButton from '../assets/img/CloseButton.svg';
import AboutSection from './AboutSection';
import LocationSection from './LocationSection';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Match } from '../types/match';
import { useSelector } from 'react-redux';
import { buyTicket, resetTicketPurchaseStatus, toggleMatchBookmark } from '../store/matchSlice';
import { RootState } from '../store';
import { useAppDispatch } from '../store/hooks';
import TicketPurchaseStatus from './TicketPurchaseStatus';
import ButtonFixe from "./ButtonFixe";

export interface MatchPopupProps {
  match: Match;
  onClose: () => void;
}

const MatchPopup: React.FC<MatchPopupProps> = ({ match, onClose }) => {
  const dispatch = useAppDispatch();
  const { ticketPurchaseStatus, ticketPurchaseError, savedMatches } = useSelector((state: RootState) => state.match);

  const [isMatchSaved, setIsMatchSaved] = useState(false);


  // Check if the match is saved when component mounts or match changes
  useEffect(() => {
    if (match && savedMatches) {
      const matchIsSaved = savedMatches.some(savedMatch => savedMatch.id === match.id);
      setIsMatchSaved(matchIsSaved);
    }
  }, [match, savedMatches]);

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

  const handleSave = () => {
    if (match) {
      dispatch(toggleMatchBookmark(match));
      // No need to update local state as it will be updated via the useEffect when savedMatches changes
    }
  };

  const handleBuyTicket = () => {
    if (match && match.id) {
      dispatch(buyTicket(match.id));
    } else {
      Alert.alert('Error', 'Cannot purchase ticket for this match');
    }
  };


  // Utiliser une fonction pour récupérer les drapeaux depuis une source plus fiable
  const flag = (country: string) => {
    try {
      country = country
        .toLowerCase()
        .replace(/\s+/g, '-');

      // Approche plus robuste : utiliser une source locale si disponible
      // ou une API plus fiable si nécessaire
      return `https://www.countryflags.com/wp-content/uploads/${country}-flag-png-large.png`;
    } catch (error) {
      console.error('Erreur lors du chargement du drapeau:', error);
      // Retourner une URL de secours (placeholder)
      return 'https://via.placeholder.com/150';
    }
  };



  return (
    <Animated.View
      style={[styles.container, { transform: [{ translateY: pan.y }] }]}>
      <View style={[styles.popup]}>
        {/* Header blanc */}
        <View style={styles.headerSection}>
          {/* Drag handle */}
          <View style={styles.dragHandleContainer} {...panResponder.panHandlers}>
            <View style={styles.dragHandle} />
          </View>

          {/* Label de status */}
          <View style={styles.statusLabel}>
            <Ionicons name="football" size={15} color="#0000FF" />
            <Text style={styles.statusLabelText}>{match?.status || 'À venir'}
            </Text>
          </View>

          {/* Titre du match */}
          <Text style={styles.matchTitle}>{match.homeTeam} Vs. {match.awayTeam}</Text>

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
          {/* Grand conteneur regroupant l'image et les détails */}
          <View style={styles.content}>

            {/* conntainer */}
            <View style={styles.grandContainer}>
              <TouchableOpacity
                style={[styles.saveButton, match.saved && styles.savedButton]}
                onPress={handleSave}
              >
                <Ionicons
                  name={match.saved ? "bookmark" : "bookmark-outline"}
                  size={24}
                  color={match.saved ? "#888888" : "#000"}
                />
              </TouchableOpacity>



              {/* Affichage des images d'équipes avec VS au milieu */}
              <View style={styles.teamsContainer}>
                <>
                  <Image source={{ uri: flag(match.homeTeam) }} style={styles.teamFlag} />
                  <Text style={styles.vsText}>VS</Text>
                  <Image source={{ uri: flag(match.awayTeam) }} style={styles.teamFlag} />
                </>

              </View>

              <View style={styles.detailRow}>
                {/* Date */}
                <View style={styles.detailItem}>
                  <View style={styles.iconTitleContainer}>
                    <Fontisto name="date" size={16} color="#656565" />
                    <Text style={styles.detailTitle}>Date</Text>
                  </View>
                  <Text style={styles.detailValue}>{match.date.split(" ")[0]}</Text>
                </View>

                {/* Séparateur 1 */}
                <View style={styles.separator}></View>

                {/* Time */}
                <View style={styles.detailItem}>
                  <View style={styles.iconTitleContainer}>
                    <MaterialCommunityIcons name="clock-outline" size={16} color="#656565" />
                    <Text style={styles.detailTitle}>Time</Text>
                  </View>
                  <Text style={styles.detailValue}>
                    {match.date.includes(" ")
                      ? match.date.split(" ")[1]
                      : "9:00 PM"}
                  </Text>
                </View>

                {/* Séparateur 2 */}
                <View style={styles.separator}></View>

                {/* Stadium */}
                <View style={styles.detailItem}>
                  <View style={styles.iconTitleContainer}>
                    <StadiumIconPopup width={16} height={16} />
                    <Text style={styles.detailTitle}>Stadium</Text>
                  </View>
                  <Text style={styles.detailValue}>{match.spot?.name || "Unknown"}</Text>
                </View>
              </View>
            </View>

            {/* About Section */}
            <AboutSection
              text={match.about || "Bakery Breakfast Lunch in Marrakesh downtown. Gueliz. Fine French and Moroccan pastries since 1997...Bakery Breakfast Lunch in Marrakesh downtown. Gueliz. Fine French and Moroccan pastries since 1997...Bakery Breakfast Lunch in Marrakesh downtown. Gueliz. Fine French and Moroccan pastries since 1997...Bakery Breakfast Lunch in Marrakesh downtown. Gueliz. Fine French and Moroccan pastries since 1997...Bakery Breakfast Lunch in Marrakesh downtown. Gueliz. Fine French and Moroccan pastries since 1997..."}
            />

            {/* Location Section */}
            <LocationSection
              address={match.spot?.address || "175, Rue Mohamed El Begal, Marrakech 40000 Morocco"}
              mapUrl={match.spot?.coordinates}
            />

            {/* Ticket Purchase Status */}
            <TicketPurchaseStatus
              status={ticketPurchaseStatus}
              error={ticketPurchaseError}
            />
          </View>

        </ScrollView>

        {/* Bottom Section: Boutons Add to Tour & Buy Tickets */}
        {/*
        <View style={styles.bottomContainer}>
          <TouchableOpacity 
            style={[
              styles.buyTicketsButton, 
              ticketPurchaseStatus === 'loading' && styles.disabledButton
            ]}
            onPress={handleBuyTicket}
            disabled={ticketPurchaseStatus === 'loading'}
          >
            {ticketPurchaseStatus === 'loading' ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buyTicketsText}>
                Buy Tickets
              </Text>
            )}
          </TouchableOpacity>
        </View>*/}
        <ButtonFixe title={'Buy Tickets'} onPress={() => { }} />


      </View>
    </Animated.View>

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
  teamFlag: {
    width: 72,
    height: 52,
    borderRadius: 10,
    resizeMode: 'cover',
    alignItems: 'center',
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
});

export default MatchPopup;