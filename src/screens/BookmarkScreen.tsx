import { NavigationProp, useNavigation } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { Alert, SafeAreaView, StyleSheet, View } from 'react-native';
import ScreenHeader from '../components/ScreenHeader';
import BookmarkListContainer from '../containers/BookmarkListContainer';
import BottomNavBar from '../containers/BottomNavBar';
import { RootStackParamList } from '../types/navigation';
import { fetchBookmarks } from '../store/bookmarkSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';

const BookmarkScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();
  const { bookmarks, loading, error } = useAppSelector((state) => state.bookmark);

  useEffect(() => {
    dispatch(fetchBookmarks());
  }, [dispatch]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleNavigation = (routeName: string) => {
    // Use a type assertion to tell TypeScript that routeName is a valid key
    // @ts-ignore - We're handling navigation in a generic way
    navigation.navigate(routeName);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Bookmarks" onBack={handleBack} />
      <View style={styles.content}>
        <BookmarkListContainer 
          bookmarks={bookmarks}
          loading={loading}
          error={error}
        />
      </View>

      <BottomNavBar activeRoute="Bookmark" onNavigate={handleNavigation} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF7F7',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
});

export default BookmarkScreen; 