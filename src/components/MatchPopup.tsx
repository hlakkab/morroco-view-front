import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import Fontisto from '@expo/vector-icons/Fontisto';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import StadiumIconPopup from '../assets/img/stadium_icon_popup.svg';
import CloseButton from '../assets/img/CloseButton.svg';
import TextWithMore from './AboutSection';
import LocationSection from './LocationSection';

export interface MatchPopupProps {
  match?: {
    id: string;
    teams: string;
    team1Image: string;
    team2Image: string;
    status: string;
    date: string;
  } | undefined;
  onClose: () => void;
}

const MatchPopup: React.FC<MatchPopupProps> = ({ match, onClose }) => {
  // Valeurs par défaut si aucune donnée n'est passée
  const defaultMatch = {
    teams: "Morocco Vs Comores",
    team1Image: "https://upload.wikimedia.org/wikipedia/commons/6/67/Flag_of_Morocco_hexagram.svg",
    team2Image: "https://cdn.britannica.com/27/4227-050-00DBD10A/Flag-South-Africa.jpg",
    status: "En cours",
    date: "Mon, 10/03 at 9:00 PM",
  };

  const currentMatch = match || defaultMatch;

  return (
    <View style={styles.popup}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Label de status */}
        <View style={styles.statusLabel}>
          <Text style={styles.statusLabelText}>Entertainment</Text>
        </View>

        {/* Titre du match */}
        <Text style={styles.matchTitle}>{currentMatch.teams}</Text>

        

        {/* Grand conteneur regroupant l'image et les détails */}
        <View style={styles.grandContainer}>
         {/* <Image source={{ uri: currentMatch.image }} style={styles.teamImage} /> */}

         <View style={styles.teamImagesContainer}>
  <Image source={{ uri: currentMatch.team1Image }} style={styles.teamImage} />
  <Text style={styles.vsText}>VS</Text>
  <Image source={{ uri: currentMatch.team2Image }} style={styles.teamImage} />
</View>

          <View style={styles.detailRow}>

            <View style={styles.detailItem}>
              <View style={{ flexDirection: "row", alignItems: "center" , justifyContent: "space-between", marginRight: 43}}>
              <Fontisto style={{ marginRight: 4 }} name="date" size={10} color="#656565" />
              <Text style={styles.detailTitle}>Date</Text>
              </View>
              <Text style={styles.detailValue}>Mon,10/03</Text>
            </View>

            <View style={styles.separator}></View>

            <View style={styles.detailItemSmall}>
              <View style={{ flexDirection: "row", alignItems: "center" , justifyContent: "space-between", marginRight: 43}}>
              <MaterialCommunityIcons style={{ marginRight: 4 }} name="clock-outline" size={15} color="#656565" />
              <Text style={styles.detailTitle}>Time</Text>
              </View>
              <Text style={styles.detailValue}>9:00 PM</Text>
            </View>
            
            <View style={styles.separator}></View>

            <View style={styles.detailItem}>
              <View style={{ flexDirection: "row", alignItems: "center" , justifyContent: "space-between", marginRight: 43}}>
              <StadiumIconPopup style={{ marginRight: 4 }} width={15} height={15} />   
              <Text style={styles.detailTitle}>Stadium</Text>
              </View>
              <Text style={styles.detailValue}>Stade Adrar</Text>
            </View>
            
          </View>
        </View>

        {/*
        <Text style={styles.aboutText}>
          Bakery Breakfast Lunch in Marrakesh downtown. Gueliz. Fine French and Moroccan
          pastries since 1997... View More
        </Text>
        */}
        
        {/* About Section */}
        <Text style={styles.aboutTitle}>About</Text>
        <TextWithMore 
          text="Bakery Breakfast Lunch in Marrakesh downtown. Gueliz. Fine French and Moroccan pastries since 1997... Bakery Breakfast Lunch in Marrakesh downtown. Gueliz. Fine French and Moroccan pastries since 1997...Bakery Breakfast Lunch in Marrakesh downtown. Gueliz. Fine French and Moroccan pastries since 1997...Gueliz. Fine French and Moroccan pastries since 1997..."
          style={styles.aboutText} 
        />

        <LocationSection 
          address="175, Rue Mohamed El Begal, Marrakech 40000 Morocco" 
        />


        {/* Location Section 
        
        <View style={styles.locationSection}>
           <Text style={styles.locationTitle}>Location</Text>
           <View style={styles.locationContainer}>
             <Image source={require('../assets/img/map_img.png')} style={styles.mapImage} />
             <Text style={styles.addressText}>
                175, Rue Mohamed El Begal, Marrakech 40000 Morocco
             </Text>
           </View>
        </View>
        */}


        

       
        </ScrollView>
         {/* Bottom Section: Boutons Add to Tour & Buy Tickets */}
         <View style={styles.bottomContainer}>
          <TouchableOpacity> {/*style={styles.addToTourButton}*/}
            <Text style={styles.addToTourText}>Add to Tour</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buyTicketsButton}>
            <Text style={styles.buyTicketsText}>Buy Tickets</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        {/*  <SimpleLineIcons name="close" size={38} color="#000000" c /> */}
        <CloseButton />
        </TouchableOpacity>
        </View>
  );
};

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
  scrollContainer: {
    padding: 16,
  },
  matchTitle: {
    width: 355,
    height: 31,
    marginTop: 70,
    marginLeft: 5,
    fontFamily: 'Raleway',
    fontWeight: '700',
    fontSize: 24,
    lineHeight: 31,
    color: '#000000',
  },
  statusLabel: {
    width: 100, 
    height: 17,
    top: 38,
    marginTop: 2,
    marginLeft: 5,
    borderRadius: 10,
    paddingVertical: 2,
    paddingHorizontal: 9,
    backgroundColor: '#F6FAFF',
  },
  statusLabelText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0000FF',
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
  teamImage: {
    width: 215,
    height: 149,
    borderRadius: 10,
    resizeMode: 'cover',
  },

  teamImagesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  vsText: {
    marginHorizontal: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 287,
    height: 49.5,
    marginTop: 20,
    alignItems: 'center',
    paddingHorizontal: 10,
  
  },
  detailItem: {
    width: 85,
    height: 42,
    alignItems: 'center',
   // justifyContent: 'center',
  },
  detailItemSmall: {
    width: 53,
    height: 39,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailTitle: {
    color: '#656565',
   fontFamily: 'Raleway',
    width: 31,
    height: 19,
    //fontSize: 10,
    fontWeight: 'bold',
    
  },
  detailValue: {
    fontFamily: 'Raleway',
    width: 89,
    height: 18,
    //fontSize: 10,
    fontWeight: '500',
    color: '#272727',
  },
  aboutTitle: {
    width: 322,
    height: 30,
    marginTop: 20,
    marginLeft: 6,
    fontFamily: 'Raleway',
    fontWeight: '700',
    fontSize: 24,
    lineHeight: 31,
    color: '#000000',
  },
  aboutText: {
    width: 322,
    marginTop: 10,
    marginLeft: 6,
    fontFamily: 'Raleway',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 18,
    color: '#000000',
  }, 

/*  
  locationSection: {
    marginTop: 20,
    marginLeft: 6,
  },
  locationTitle: {
    fontFamily: 'Raleway',
    fontWeight: '700',
    fontSize: 24,
    lineHeight: 31,
    color: '#000000',
  },
  locationContainer: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  mapImage: {
    width: 169,
    height: 95,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  addressText: {
    top: -25,
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#333',
  },
*/
  bottomContainer: {
    borderRadius: 11,
    width: 415,
    height: 159,
    marginTop: 15,
    //marginLeft: 18,
  //  backgroundColor: '#FFFFFF',
    alignItems: 'center',
    //justifyContent: 'center',
  },
  /*addToTourButton: {
    width: 87,
    height: 19,
    backgroundColor: '#CE1126',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    marginBottom: 10,
  },*/
  addToTourText: {
    //width: 100,
    marginTop: -5,
    height: 40,
    color: '#CE1126',
    fontSize: 17,
    fontWeight: '400',
  },
  buyTicketsButton: {
    marginTop: -15,
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
  separator: {
    width: 1,            
    height: 50,           
    backgroundColor: '#AAAAAA', 
    marginRight: 40,
    alignContent: 'center',
    //alignSelf: 'center',    
  },
  /*
  closeButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },*/
});

export default MatchPopup;
