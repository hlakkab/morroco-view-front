import { Ionicons } from '@expo/vector-icons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import HotelPickupSvg from '../assets/serviceIcons/car-img.svg';
import CardItem from '../components/CardItem';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Bookmark } from '../types/bookmark';
import { useAppDispatch } from '../store/hooks';
import { removeBookmark } from '../store/bookmarkSlice';

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
    navigation.navigate('TransportDetail', {
      id: item.id,
      title: item.title,
      imageUrl: item.image || ''
    });
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
          renderItem={({ item }) => (
            <CardItem
              imageUrl={item.image}
              svgImage={<HotelPickupSvg width={110} height={80} style={{ alignSelf: 'center', marginRight: 10 }} />}
              title={item.title}
              actionIcon={
                <Ionicons 
                  name="bookmark"
                  size={20} 
                  color="#666"
                />
              }
              isSaved={true}
              onActionPress={() => handleSaveBookmark(item.id)}
              onCardPress={() => handleCardPress(item)}
            />
          )}
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