import { Ionicons } from '@expo/vector-icons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchTours } from '../store/tourSlice';
import ScreenHeader from '../components/ScreenHeader';
import BottomNavBar from '../containers/BottomNavBar';
import TourListContainer from '../containers/TourListContainer';
import { RootStackParamList } from '../types/navigation';

const ToursScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.tour);

  useEffect(() => {
    dispatch(fetchTours());
  }, [dispatch]);

  const handleBack = () => {
    // Handle back navigation if needed
  };

  const handleAddTour = () => {
    navigation.navigate('AddNewTour');
  };

  const handleNavigation = (routeName: string) => {
    // Use a type assertion to tell TypeScript that routeName is a valid key
    // @ts-ignore - We're handling navigation in a generic way
    navigation.navigate(routeName);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <ScreenHeader title="Tours" onBack={handleBack} />
      </View>
      
      <View style={styles.content}>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddTour}
        >
          <Ionicons name="add" size={25} color="#FFFFFF" style={{ backgroundColor: '#AE1913', borderRadius: 25, padding: 4}} />
          <Text style={styles.addButtonText}>Add new Tour</Text>
        </TouchableOpacity>

        <TourListContainer />
      </View>

      <BottomNavBar activeRoute="Tours" onNavigate={handleNavigation} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF7F7',
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7F7',
    borderWidth: 2,
    borderColor: '#AE1913',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 50,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  addButtonText: {
    color: '#AE1913',
    marginLeft: 6,
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ToursScreen; 