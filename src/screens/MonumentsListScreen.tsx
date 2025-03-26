import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import ScreenHeader from '../components/ScreenHeader';
import SearchBar from '../components/SearchBar';
import MonumentsListContainer, { Monument } from '../containers/MonumentsListContainer';
import FilterPopup, {FilterOption} from "../components/FilterPopup";

// Sample data for monuments
const SAMPLE_MONUMENTS: Monument[] = [
  {
    id: '1',
    name: 'Koutoubia Mosque',
    location: 'Marrakech, Medina',
    isFeatured: true,
    imageUrl: 'https://images.unsplash.com/photo-1548018560-c7196548e84d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    visitingHours: 'Monday to Sunday: 9:00 AM - 6:00 PM (Non-Muslims cannot enter the mosque)',
    entryFee: 'Free (exterior only)',
    website: 'www.visitmorocco.com/koutoubia',
    about: 'The Koutoubia Mosque is the largest mosque in Marrakech, Morocco. The minaret, 77 metres (253 ft) in height, includes a spire and orbs. It was completed under the reign of the Berber Almohad Caliph Yaqub al-Mansur (1184-1199) and has inspired other buildings such as the Giralda of Seville and the Hassan Tower of Rabat.'
  },
  {
    id: '2',
    name: 'Bahia Palace',
    location: 'Marrakech, Medina',
    isFeatured: true,
    imageUrl: 'https://images.unsplash.com/photo-1548013146-72479768bada?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    visitingHours: 'Monday to Sunday: 9:00 AM - 5:00 PM',
    entryFee: '70 MAD',
    website: 'www.visitmorocco.com/bahia-palace',
    about: 'The Bahia Palace is a palace and a set of gardens located in Marrakech, Morocco. It was built in the late 19th century, intended to be the greatest palace of its time. The name means "brilliance". As in other buildings of the period in Morocco, it was intended to capture the essence of the Islamic and Moroccan style.'
  },
  {
    id: '3',
    name: 'Majorelle Garden',
    location: 'Marrakech, Gueliz',
    isFeatured: false,
    imageUrl: 'https://images.unsplash.com/photo-1535540878297-f4439276f513?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    visitingHours: 'Monday to Sunday: 8:00 AM - 6:00 PM',
    entryFee: '70 MAD',
    website: 'www.jardinmajorelle.com',
    about: 'The Majorelle Garden is a botanical garden and artist\'s landscape garden in Marrakech, Morocco. It was created by the French Orientalist artist Jacques Majorelle over almost forty years, starting in 1923, and features a Cubist villa designed by the French architect Paul Sinoir in the 1930s. The property was the residence of the artist and his wife from 1923 until their divorce in the 1950s. In the 1980s, the property was purchased by the fashion designers Yves Saint-Laurent and Pierre Bergé who worked to restore it.'
  },
  {
    id: '4',
    name: 'Saadian Tombs',
    location: 'Marrakech, Kasbah',
    isFeatured: false,
    imageUrl: 'https://images.unsplash.com/photo-1597212720158-c391f259f48e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    visitingHours: 'Monday to Sunday: 9:00 AM - 5:00 PM',
    entryFee: '70 MAD',
    website: 'www.visitmorocco.com/saadian-tombs',
    about: 'The Saadian Tombs are a historic royal necropolis in Marrakech, Morocco, located on the south side of the Kasbah Mosque. They date to the time of the Saadian dynasty and particularly to the reign of Ahmad al-Mansur. The tombs were discovered in 1917 and were restored by the Beaux-arts service. The mausoleum comprises the interments of about sixty members of the Saadian dynasty that originated in the valley of the Draa River.'
  },
  {
    id: '5',
    name: 'El Badi Palace',
    location: 'Marrakech, Kasbah',
    isFeatured: false,
    imageUrl: 'https://images.unsplash.com/photo-1585670210693-e70aa10ee0e4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    visitingHours: 'Monday to Sunday: 9:00 AM - 5:00 PM',
    entryFee: '70 MAD',
    website: 'www.visitmorocco.com/el-badi-palace',
    about: 'El Badi Palace is a ruined palace located in Marrakech, Morocco. It was commissioned by the Saadian sultan Ahmad al-Mansur after his success against the Portuguese at the Battle of the Three Kings in 1578. The palace took twenty five years to build, with construction finally completed around 1593 and was a lavish display of the best craftsmanship of the Saadian period.'
  },
];

// Declare the list of cities
const CITIES = ['Marrakech', 'Rabat', 'Agadir', 'Casablanca', 'Fes', 'Tanger'];

// Update the ALL_LOCATIONS to use the CITIES array
const ALL_LOCATIONS = ['All Locations', ...CITIES];

const MonumentsListScreen: React.FC = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(ALL_LOCATIONS[0]);
  // État pour stocker les monuments filtrés
  const [filteredMonuments, setFilteredMonuments] = useState<Monument[]>(SAMPLE_MONUMENTS);
  // État pour contrôler la visibilité du popup
  const [filterPopupVisible, setFilterPopupVisible] = useState(false);
  // État pour stocker les options de filtre
  const [filterOptions, setFilterOptions] = useState<FilterOption[]>([
    // Définir ici vos options de filtre pour les monuments
    { id: 'marrakech', label: 'Marrakech', selected: false, category: 'city' },
    { id: 'medina', label: 'Medina', selected: false, category: 'area' },
    { id: 'kasbah', label: 'Kasbah', selected: false, category: 'area' },
    { id: 'gueliz', label: 'Gueliz', selected: false, category: 'area' },
    // Ajoutez d'autres filtres selon vos besoins
  ]);

  // Filter monuments based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredMonuments(SAMPLE_MONUMENTS);
    } else {
      const lowercaseQuery = searchQuery.toLowerCase();
      setFilteredMonuments(
        SAMPLE_MONUMENTS.filter(monument => 
          monument.name.toLowerCase().includes(lowercaseQuery) || 
          monument.location.toLowerCase().includes(lowercaseQuery)
        )
      );
    }
  }, [searchQuery]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  // Fonction pour ouvrir le popup de filtre
  const openFilterPopup = () => {
    setFilterPopupVisible(true);
  };

// Fonction pour appliquer les filtres
  const handleApplyFilters = (selectedOptions: FilterOption[]) => {
    setFilterOptions(selectedOptions);

    // Filtrer les monuments selon les options sélectionnées
    const selectedFilters = selectedOptions.filter(option => option.selected);

    if (selectedFilters.length === 0) {
      // Si aucun filtre n'est sélectionné, afficher tous les monuments
      setFilteredMonuments(SAMPLE_MONUMENTS);
    } else {
      // Filtrer selon les options sélectionnées
      const filtered = SAMPLE_MONUMENTS.filter(monument => {
        // Vérifier si le monument correspond à au moins un des filtres sélectionnés
        return selectedFilters.some(filter => {
          if (filter.category === 'city') {
            return monument.location.includes(filter.label);
          } else if (filter.category === 'area') {
            return monument.location.includes(filter.label);
          }
          // Ajoutez d'autres conditions selon vos besoins
          return false;
        });
      });

      setFilteredMonuments(filtered);
    }
  };






  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Historical Monuments" onBack={handleBack} />
      
      <View style={styles.content}>
        <SearchBar 
          placeholder="Search for monuments..."
          onChangeText={handleSearch}
          onFilterPress={openFilterPopup}
          value={searchQuery}
        />
        
        <MonumentsListContainer 
          monuments={filteredMonuments}
          locations={ALL_LOCATIONS}
          selectedLocation={selectedLocation}
          onSelectLocation={setSelectedLocation}
        />
        {/* Popup de filtre */}
        <FilterPopup
            visible={filterPopupVisible}
            onClose={() => setFilterPopupVisible(false)}
            filterOptions={filterOptions}
            onApplyFilters={handleApplyFilters}
            title="Filtrer les monuments"
        />

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF7F7',
    padding: 16,
  },
  content: {
    flex: 1,
  },
});

export default MonumentsListScreen; 