import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Animated, PanResponder, Dimensions } from 'react-native';
import Fontisto from '@expo/vector-icons/Fontisto';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import StadiumIconPopup from '../assets/img/stadium_icon_popup.svg';
import CloseButton from '../assets/img/CloseButton.svg';
import AboutSection from './AboutSection';
import LocationSection from './LocationSection';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Match } from '../types/match';

export interface MatchPopupProps {
  match?: Match;
  onClose: () => void;
}

const MatchPopup: React.FC<MatchPopupProps> = ({ match, onClose }) => {

  const [isSaved, setIsSaved] = useState(false);

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
    setIsSaved(!isSaved);
  };


  // Valeurs par défaut si aucune donnée n'est passée
  const defaultMatch: Match = {
    id: 'default',
    teams: "Morocco Vs Comores",
    team1Image: "https://www.countryflags.com/wp-content/uploads/morocco-flag-png-large.png",
    team2Image: "https://www.countryflags.com/wp-content/uploads/comoros-flag-png-large.png",
    status: "Entertainment",
    date: "Mon, 10/03 at 9:00 PM",
    stadium: "Stade Adrar",
    about: "Bakery Breakfast Lunch in Marrakesh downtown. Gueliz. Fine French and Moroccan pastries since 1997...",
  };

  const currentMatch = match || defaultMatch;

  return (
    <Animated.View
      style={[
        styles.popup,
        { transform: [{ translateY: pan.y }] }
      ]}
    >

      {/* Header blanc */}
      <View style={styles.headerSection}>
        {/* Drag handle */}
        <View style={styles.dragHandleContainer} {...panResponder.panHandlers}>
          <View style={styles.dragHandle} />
        </View>

        {/* Label de status */}
        <View style={styles.statusLabel}>
          <Ionicons name="football" size={15} color="#0000FF" />
          <Text style={styles.statusLabelText}>{currentMatch.status}</Text>
        </View>

        {/* Titre du match */}
        <Text style={styles.matchTitle}>{currentMatch.teams}</Text>

        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <CloseButton />
        </TouchableOpacity>
      </View>



      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Grand conteneur regroupant l'image et les détails */}
        <View style={styles.grandContainer}>
          <TouchableOpacity
            style={[styles.saveButton, isSaved && styles.savedButton]}
            onPress={handleSave}
          >
            <Ionicons
              name={isSaved ? "bookmark" : "bookmark-outline"}
              size={24}
              color={isSaved ? "#888888" : "#000"}
            />
          </TouchableOpacity>



          {/* Affichage des images d'équipes avec VS au milieu */}
          <View style={styles.teamsContainer}>
            {(currentMatch.homeTeam && currentMatch.awayTeam) ? (
              <>
                <Image source={{ uri: currentMatch.homeTeam.flag }} style={styles.teamFlag} />
                <Text style={styles.vsText}>VS</Text>
                <Image source={{ uri: currentMatch.awayTeam.flag }} style={styles.teamFlag} />
              </>
            ) : (currentMatch.team1Image && currentMatch.team2Image) ? (
              <>
                <Image source={{ uri: currentMatch.team1Image }} style={styles.teamFlag} />
                <Text style={styles.vsText}>VS</Text>
                <Image source={{ uri: currentMatch.team2Image }} style={styles.teamFlag} />
              </>
            ) : (
              <Image source={{ uri: currentMatch.image }} style={styles.teamImage} />
            )}
          </View>

          <View style={styles.detailRow}>
            {/* Date */}
            <View style={styles.detailItem}>
              <View style={styles.iconTitleContainer}>
                <Fontisto name="date" size={16} color="#656565" />
                <Text style={styles.detailTitle}>Date</Text>
              </View>
              <Text style={styles.detailValue}>{currentMatch.date.split(" at")[0]}</Text>
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
                {currentMatch.date.includes(" at ")
                  ? currentMatch.date.split(" at ")[1]
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
              <Text style={styles.detailValue}>{currentMatch.stadium}</Text>
            </View>
          </View>
        </View>

        {/* About Section */}
        <AboutSection
          text={currentMatch.about || "Bakery Breakfast Lunch in Marrakesh downtown. Gueliz. Fine French and Moroccan pastries since 1997..."}
        />

        {/* Location Section */}

        <LocationSection
          address={currentMatch.location?.address || "175, Rue Mohamed El Begal, Marrakech 40000 Morocco"}
          mapUrl={currentMatch.location?.mapUrl}
        />
      </ScrollView>

      {/* Bottom Section: Boutons Add to Tour & Buy Tickets */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.buyTicketsButton}>
          <Text style={styles.buyTicketsText}>
            Buy Tickets
          </Text>
        </TouchableOpacity>
      </View>


    </Animated.View>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  popup: {
    width: 395,
    height: 802,
    top: 80,
    borderRadius: 32,
    backgroundColor: '#FFF7F7',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  // Nouveaux styles pour le drag handle
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
  scrollContainer: {
    padding: 16,
    paddingTop: 0,
    top: -15,
  },
  matchTitle: {
    width: 355,
    height: 31,
    marginTop: 35, // Ajusté pour tenir compte du drag handle
    marginLeft: 23,
    fontFamily: 'Raleway',
    fontWeight: '700',
    fontSize: 24,
    lineHeight: 31,
    color: '#000000',
  },
  statusLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    top: 20, // Ajusté pour tenir compte du drag handle
    marginLeft: 23,
    borderRadius: 20,
    paddingVertical: 2,
    paddingHorizontal: 5,
    backgroundColor: '#F6FAFF',
  },
  statusLabelText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0000FF',
    marginLeft: 5,
  },
  grandContainer: {
    backgroundColor: '#F6FAFF',
    width: 350,
    height: 234,
    marginTop: 20,
    marginLeft: 6,
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
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: '#F8F9FF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 5,
  },
  detailItem: {
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  iconTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
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
    height: 40,
    backgroundColor: '#E0E0E0',
  },
  detailTitle: {
    color: '#656565',
    fontFamily: 'Raleway',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  detailValue: {
    /* width: 100,
    // marginTop: 0,
     fontFamily: 'Raleway',
     fontSize: 14,
     fontWeight: '700',
     color: '#000000',
     textAlign: 'center',
     flexWrap: 'wrap',*/
    fontFamily: 'Raleway',
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    width: '100%', // Assure que le texte utilise toute la largeur disponible
  },

  bottomContainer: {
    borderRadius: 4,
    width: 415,
    height: 160,
    alignItems: 'center',
    // backgroundColor: 'blue',
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
    width: 340,
    height: 53,
    borderRadius: 32,
    backgroundColor: '#AE1913',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 4px 20px 0px #AE191366',
  },
  buyTicketsText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  closeButton: {
    position: 'absolute',
    top: 17,
    left: 346,
  },
  headerSection: {
    height: 130,
    backgroundColor: 'white',
    borderTopLeftRadius: 32, // Conserve l'arrondi du popup parent
    borderTopRightRadius: 32, // Conserve l'arrondi du popup parent
    paddingBottom: 15, // Ajoute un peu d'espace après le titre
    zIndex: 1, // S'assure que ce conteneur reste au-dessus du ScrollView
  },
  saveButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    //backgroundColor: 'white',
    opacity: 0.5,
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.7,
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
//Correcte without close button
