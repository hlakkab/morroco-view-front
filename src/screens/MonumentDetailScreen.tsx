import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import { Dimensions, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AboutSection from '../components/AboutSection';
import Button from '../components/Button';
import ImageGallery from '../components/ImageGallery';
import LocationSection from '../components/LocationSection';
import ScreenHeader from '../components/ScreenHeader';
import { Monument } from '../types/Monument';
import { useAppDispatch } from '../store/hooks';
import { toggleMonumentBookmark } from '../store/monumentSlice';

// Sample monument images for the image gallery
const MONUMENT_IMAGES = [
  'https://images.unsplash.com/photo-1548013146-72479768bada?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
];

// Enhanced sample monument details
// const SAMPLE_MONUMENTS: Record<string, Monument> = {
//   '1': {
//     id: '1',
//     name: 'Koutoubia Mosque',
//     location: 'Marrakech, Medina',
//     isFeatured: true,
//     visitingHours: 'Monday to Sunday: 9:00 AM - 6:00 PM (Non-Muslims cannot enter the mosque)',
//     entryFee: 'Free (exterior only)',
//     website: 'www.visitmorocco.com/koutoubia',
//     about: 'The Koutoubia Mosque is the largest mosque in Marrakech, Morocco. The minaret, 77 metres (253 ft) in height, includes a spire and orbs. It was completed under the reign of the Berber Almohad Caliph Yaqub al-Mansur (1184-1199) and has inspired other buildings such as the Giralda of Seville and the Hassan Tower of Rabat.\n\nThe mosque is located about 200 meters west of Jemaa El Fnaa square. Its name comes from the Arabic al-Koutoubiyyin for "bookseller", as it was surrounded by the stalls of sellers of manuscripts. It is considered the most beautiful mosque in Western Muslim world and was the model for the construction of the Giralda in Seville and the Hassan Tower in Rabat.'
//   },
//   '2': {
//     id: '2',
//     name: 'Bahia Palace',
//     location: 'Marrakech, Medina',
//     isFeatured: true,
//     visitingHours: 'Monday to Sunday: 9:00 AM - 5:00 PM',
//     entryFee: '70 MAD',
//     website: 'www.visitmorocco.com/bahia-palace',
//     about: 'The Bahia Palace is a palace and a set of gardens located in Marrakech, Morocco. It was built in the late 19th century, intended to be the greatest palace of its time. The name means "brilliance". As in other buildings of the period in Morocco, it was intended to capture the essence of the Islamic and Moroccan style.\n\nThe palace was built in the late 19th century by Si Moussa, grand vizier of the sultan, for his personal use. Later, it was expanded and embellished by his son Abu "Bou" Ahmed, who served as the grand vizier of Sultan Moulay Abdelaziz between 1894 and 1900.'
//   },
//   '3': {
//     id: '3',
//     name: 'Majorelle Garden',
//     location: 'Marrakech, Gueliz',
//     isFeatured: false,
//     visitingHours: 'Monday to Sunday: 8:00 AM - 6:00 PM',
//     entryFee: '70 MAD',
//     website: 'www.jardinmajorelle.com',
//     about: 'The Majorelle Garden is a botanical garden and artist\'s landscape garden in Marrakech, Morocco. It was created by the French Orientalist artist Jacques Majorelle over almost forty years, starting in 1923, and features a Cubist villa designed by the French architect Paul Sinoir in the 1930s. The property was the residence of the artist and his wife from 1923 until their divorce in the 1950s. In the 1980s, the property was purchased by the fashion designers Yves Saint-Laurent and Pierre Bergé who worked to restore it.\n\nThe garden hosts more than 300 plant species from five continents. The garden has been open to the public since 1947. Since 2010, the garden has been owned by the Foundation Pierre Bergé – Yves Saint Laurent.'
//   },
//   '4': {
//     id: '4',
//     name: 'Saadian Tombs',
//     location: 'Marrakech, Kasbah',
//     isFeatured: false,
//     visitingHours: 'Monday to Sunday: 9:00 AM - 5:00 PM',
//     entryFee: '70 MAD',
//     website: 'www.visitmorocco.com/saadian-tombs',
//     about: 'The Saadian Tombs are a historic royal necropolis in Marrakech, Morocco, located on the south side of the Kasbah Mosque. They date to the time of the Saadian dynasty and particularly to the reign of Ahmad al-Mansur. The tombs were discovered in 1917 and were restored by the Beaux-arts service. The mausoleum comprises the interments of about sixty members of the Saadian dynasty that originated in the valley of the Draa River.\n\nThe principal mausoleum has three rooms and contains the graves of 66 Saadian princes and members of the royal household. The most prominent chamber contains the mihrab and is sumptuously decorated with zellige tilework, marble, and gold. This chamber contains the tomb of the son of the sultan\'s son, Ahmad al-Mansur.'
//   },
//   '5': {
//     id: '5',
//     name: 'El Badi Palace',
//     location: 'Marrakech, Kasbah',
//     isFeatured: false,
//     visitingHours: 'Monday to Sunday: 9:00 AM - 5:00 PM',
//     entryFee: '70 MAD',
//     website: 'www.visitmorocco.com/el-badi-palace',
//     about: 'El Badi Palace is a ruined palace located in Marrakech, Morocco. It was commissioned by the Saadian sultan Ahmad al-Mansur after his success against the Portuguese at the Battle of the Three Kings in 1578. The palace took twenty five years to build, with construction finally completed around 1593 and was a lavish display of the best craftsmanship of the Saadian period.\n\nThe name "El Badi" means "the incomparable" and today only the extensive ruins remain which give a sense of the scale of the original building. The building is thought to have consisted of 360 rooms, a courtyard and a pool. The palace was designed in a style influenced by the Alhambra in Granada, Spain.'
//   }
// };

const { width } = Dimensions.get('window');

const MonumentDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as Monument;
  const dispatch = useAppDispatch();


  const [saved, setSaved] = useState(params.saved || false);
  const [showTicketModal, setShowTicketModal] = useState(false);

  // Get monument details from sample data or route params
  const monumentDetails = { ...params, saved };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSave = () => {
    // Toggle saved state
    setSaved(!saved);
    

    dispatch(toggleMonumentBookmark(monumentDetails));
  };

  const handleBuyTicket = () => {
    setShowTicketModal(true);
  };

  const handleCloseTicketModal = () => {
    setShowTicketModal(false);
  };

  console.log(monumentDetails);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <ScreenHeader title={monumentDetails.name} onBack={handleBack} />
      </View>

      <ScrollView style={styles.scrollView}>
        <ImageGallery 
          images={monumentDetails.images || MONUMENT_IMAGES}
          isSaved={saved}
          onSavePress={handleSave}
        />

        <View style={styles.content}>
          <View style={styles.monumentTypeContainer}>
            <Text style={styles.monumentType}>
              {/* {monumentDetails.isFeatured ? 'Featured Monument' : 'Historical Monument'} */}
              {monumentDetails.type}
            </Text>
          </View>

          <View style={styles.infoContainer}>
            <View style={styles.infoItem}>
              <Ionicons name="time-outline" size={20} color="#666" />
              <Text style={styles.infoText}>{monumentDetails.startTime} - {monumentDetails.endTime}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Ionicons name="cash-outline" size={20} color="#666" />
              <Text style={styles.infoText}>Entry Fee: 50 DH</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Ionicons name="globe-outline" size={20} color="#666" />
              <Text style={styles.infoText}>{monumentDetails.website}</Text>
            </View>
          </View>

          <AboutSection 
            title="About" 
            text={monumentDetails.description || 'No information available for this monument.'} 
          />

          <LocationSection 
            address={monumentDetails.address} 
            mapUrl={monumentDetails.mapId}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button 
          title="Buy Tickets" 
          style={styles.ticketButton}
          icon={<Ionicons name="ticket" size={20} color="#fff" style={{ marginRight: 8 }} />}
          onPress={handleBuyTicket}
        />
      </View>

      <Modal
        visible={showTicketModal}
        transparent
        animationType="slide"
        onRequestClose={handleCloseTicketModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.titleContainer}>
                <Text style={styles.modalTitle} numberOfLines={1} ellipsizeMode="tail">
                  Tickets for {monumentDetails.name}
                </Text>
              </View>
              <TouchableOpacity onPress={handleCloseTicketModal} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.ticketOptions}>
              <View style={styles.ticketOption}>
                <View style={styles.ticketDetails}>
                  <Text style={styles.ticketType}>Standard Entry</Text>
                  <Text style={styles.ticketPrice}>{monumentDetails.entryFee}</Text>
                </View>
                <TouchableOpacity style={styles.buyButton}>
                  <Text style={styles.buyButtonText}>Buy</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.ticketOption}>
                <View style={styles.ticketDetails}>
                  <Text style={styles.ticketType}>Guided Tour</Text>
                  <Text style={styles.ticketPrice}>150 MAD</Text>
                </View>
                <TouchableOpacity style={styles.buyButton}>
                  <Text style={styles.buyButtonText}>Buy</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.ticketOption}>
                <View style={styles.ticketDetails}>
                  <Text style={styles.ticketType}>Skip the Line</Text>
                  <Text style={styles.ticketPrice}>200 MAD</Text>
                </View>
                <TouchableOpacity style={styles.buyButton}>
                  <Text style={styles.buyButtonText}>Buy</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <Button 
              title="Close" 
              style={styles.closeModalButton}
              onPress={handleCloseTicketModal}
            />
          </View>
        </View>
      </Modal>
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
  monumentTypeContainer: {
    backgroundColor: '#E8F5F0',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#008060',
  },
  monumentType: {
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
  footer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  ticketButton: {
    backgroundColor: '#008060',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  titleContainer: {
    flex: 1,
    marginRight: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  closeButton: {
    padding: 4,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  ticketOptions: {
    marginBottom: 24,
  },
  ticketOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  ticketDetails: {
    flex: 1,
  },
  ticketType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  ticketPrice: {
    fontSize: 14,
    color: '#CE1126',
    fontWeight: '500',
  },
  buyButton: {
    backgroundColor: '#008060',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  buyButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  closeModalButton: {
    marginTop: 8,
  },
});

export default MonumentDetailScreen; 