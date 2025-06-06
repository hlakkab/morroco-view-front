import { Ionicons } from '@expo/vector-icons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { FlatList, Modal, StyleSheet, Text, View } from 'react-native';
import HotelPickupSvg from '../assets/serviceIcons/car-img.svg';
import ArtisanCard from '../components/cards/ArtisanCard';
import BrokerCard from '../components/cards/BrokerCard';
import CardItem from '../components/cards/CardItem';
import EntertainmentSmallCard from '../components/cards/EntertainmentSmallCard';
import MatchCard from '../components/cards/MatchCard';
import MonumentCard from '../components/cards/MonumentCard';
import PickupCard from '../components/cards/PickupCard';
import RestaurantCard from '../components/cards/RestaurantCard';
import MatchPopup from '../components/MatchPopup';
import { removeBookmark } from '../store/bookmarkSlice';
import { useAppDispatch } from '../store/hooks';
import { setCurrentMatch, setSelectedMatch } from '../store/matchSlice';
import i18n from '../translations/i18n';
import { Artisan } from '../types/Artisan';
import { Bookmark } from '../types/bookmark';
import { Match } from '../types/match';
import { RootStackParamList } from '../types/navigation';
import { HotelPickup } from '../types/transport';

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

  const handleArtisanPress = (artisan: Artisan) => {
    navigation.navigate('ArtisanDetail', artisan);
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

  // Get appropriate empty state message
  const getEmptyStateMessage = () => {
    if (!bookmarks || bookmarks.length === 0) {
      return i18n.t('bookmark.noBookmarksSaved');
    }
    return i18n.t('bookmark.noBookmarksMatch');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>{i18n.t('bookmark.loading')}</Text>
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
      <Text style={styles.sectionTitle}>{i18n.t('bookmark.yourBookmarks')}</Text>
      
      {bookmarks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="bookmark-outline" size={48} color="#ccc" />
          <Text style={styles.noPickupsText}>
            {getEmptyStateMessage()}
          </Text>
        </View>
      ) : (
        <View style={styles.content}>
        <FlatList
          data={bookmarks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
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

            if (item.type === 'ENTERTAINMENT') {
              return (
                <EntertainmentSmallCard
                  entertainment={{...item.object, saved: true}}
                  handleSaveEntertainment={handleSaveBookmark}
                  handleEntertainmentPress={handleCardPress}
                />
              )
            }

            if (item.type === 'ARTISAN') {
              return (
                <ArtisanCard
                  item={{...item.object, images: item.images, saved: true}}
                  handleSaveArtisan={handleSaveBookmark}
                  handleArtisanPress={handleArtisanPress}
                />
              )
            }

            return null
          }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={bookmarks.length > 0 ? styles.listContent : styles.emptyListContent}
        />
        </View>
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
    marginTop: 16,
    color: '#888',
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 24,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 24,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    marginBottom: 150,
  },
  content: {
    marginBottom: 100,
  },
  listContent: {
    paddingBottom: 16,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default BookmarkListContainer; 