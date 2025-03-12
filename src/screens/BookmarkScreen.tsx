import React, { useEffect } from 'react';
import { StyleSheet, View, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchBookmarks } from '../store/bookmarkSlice';
import BookmarkListContainer from '../containers/BookmarkListContainer';
import ScreenHeader from '../components/ScreenHeader';

const BookmarkScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { bookmarks, loading, error } = useAppSelector((state) => state.bookmark);

  useEffect(() => {
    dispatch(fetchBookmarks());
  }, [dispatch]);

  const handleBack = () => {
    navigation.goBack();
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