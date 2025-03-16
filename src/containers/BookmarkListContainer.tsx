import { Ionicons } from '@expo/vector-icons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import HotelPickupSvg from '../assets/serviceIcons/car-img.svg';
import CardItem from '../components/cards/CardItem';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Bookmark } from '../types/bookmark';
import { useAppDispatch } from '../store/hooks';
import { removeBookmark } from '../store/bookmarkSlice';
import PickupCard from '../components/cards/PickupCard';
import { HotelPickup } from '../types/transport';
import MatchCard from '../components/cards/MatchCard';

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

  const handleSaveBookmark = (id: string) => {
    dispatch(removeBookmark(id));
  };

  const handleCardPress = (item: Bookmark) => {
    
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
            
            if (item.type === 'PICKUP') {
              const pickup = { 
                ...item.object,
                images: item.images
              };
              
              return (
                <PickupCard
                  item={pickup}
                />
              )
            }

            if (item.type === 'MATCH') {
              
              return (
                <MatchCard
                  match={item.object}
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