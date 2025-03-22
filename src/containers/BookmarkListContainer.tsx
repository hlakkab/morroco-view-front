import { Ionicons } from '@expo/vector-icons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
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

  const handleSaveBookmark = (id: string | {id: string}) => {
    if (typeof id === 'string') {
      dispatch(removeBookmark(id));
    } else {
      dispatch(removeBookmark(id.id));
    }
  };

  const handleCardPress = (item: object) => {
    
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
              return (
                <MatchCard
                  match={{...item.object, saved: true}}
                  handleSaveMatch={handleSaveBookmark}
                />
              )
            }

            if (item.type === 'MONEY_EXCHANGE') {
              return (
                <BrokerCard 
                  item={{...item.object, saved: true}}
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
  }
});

export default BookmarkListContainer; 