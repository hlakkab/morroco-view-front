import { Ionicons } from '@expo/vector-icons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, View, Modal } from 'react-native';
import HotelPickupSvg from '../assets/serviceIcons/car-img.svg';
import CardItem from '../components/cards/CardItem';
import { RootStackParamList } from '../types/navigation';
import { Bookmark } from '../types/bookmark';
import { useAppDispatch } from '../store/hooks';
import { removeBookmark } from '../store/bookmarkSlice';
import PickupCard from '../components/cards/PickupCard';
import { HotelPickup } from '../types/transport';
import MatchCard from '../components/cards/MatchCard';
import BrokerCard from '../components/cards/BrokerCard';
import RestaurantCard from '../components/cards/RestaurantCard';
import MonumentCard from '../components/cards/MonumentCard';
import MatchPopup from '../components/MatchPopup';
import { setCurrentMatch, setSelectedMatch } from '../store/matchSlice';
import { Match } from '../types/match';

interface BookmarkListContainerProps {
  bookmarks: Bookmark[];
  loading: boolean;
  error: string | null;
}

const BookmarkListContainer: React.FC<BookmarkListContainerProps> = ({
  bookmarks,
  loading,
  error
}) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();
  const [modalVisible, setModalVisible] = useState(false);

  const handleSaveBookmark = (id: string | {id: string}) => {
    if (typeof id === 'string') {
      dispatch(removeBookmark(id));
    } else {
      dispatch(removeBookmark(id.id));
    }
  };

  const handleCardPress = (item: object) => {
    // Add specific handling based on item type if needed
  };

  const handleMatchPress = (match: Match) => {
    dispatch(setSelectedMatch(match));
    dispatch(setCurrentMatch(match));
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    // Wait a bit for better animation
    setTimeout(() => {
      dispatch(setSelectedMatch(null));
      dispatch(setCurrentMatch(null));
    }, 300);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Your Bookmarks</Text>
      
      {bookmarks.length === 0 ? (
        <Text style={styles.noPickupsText}>
          No Bookmarks
        </Text>
      ) : (
        <FlatList
          data={bookmarks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {

            console.log(item.type);
            
            if (item.type === 'PICKUP') {
              const pickup = { 
                ...item.object,
                images: item.images,
                saved: true
              };
              
              return (
                <PickupCard
                  item={pickup}
                  handleSavePickup={handleSaveBookmark}
                />
              )
            }

            if (item.type === 'MATCH') {
              const match = {...item.object, images: item.images, saved: true};
              return (
                <MatchCard
                  match={match}
                  handleSaveMatch={handleSaveBookmark}
                  handleCardPress={() => handleMatchPress(match)}
                />
              )
            }

            if (item.type === 'MONEY_EXCHANGE') {
              return (
                <BrokerCard 
                  item={{...item.object, images: item.images, saved: true}}
                  handleSaveBroker={handleSaveBookmark}
                />
              )
            }


            if (item.type === 'RESTAURANT') {
              return (
                <RestaurantCard
                  item={{...item.object, images: item.images, saved: true}}
                  handleSaveRestaurant={handleSaveBookmark}
                  handleRestaurantPress={handleCardPress}
                />
              )
            }


            if (item.type === 'MONUMENT') {
              return (
                <MonumentCard
                  item={{...item.object, images: item.images, saved: true}}
                  handleSaveMonument={handleSaveBookmark}
                  handleMonumentPress={handleCardPress}
                />
              )
            }

            return null
          }}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <MatchPopup onClose={closeModal} />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 16,
    color: '#666',
  },
  noPickupsText: {
    textAlign: 'center',
    marginTop: 24,
    color: '#888',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default BookmarkListContainer; 