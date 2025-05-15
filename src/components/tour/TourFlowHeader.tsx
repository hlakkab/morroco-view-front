import { AntDesign, Ionicons } from '@expo/vector-icons';
import { CommonActions, NavigationProp, ParamListBase, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { setTourInfo } from '../../store/tourSlice';
import { RootStackParamList } from '../../types/navigation';

interface TourFlowHeaderProps {
  title: string;
  showTour?: boolean;
  onTourPress?: () => void;
}

const TourFlowHeader: React.FC<TourFlowHeaderProps> = ({ 
  title, 
  showTour = false,
  onTourPress
}) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, keyof RootStackParamList>>();
  const dispatch = useDispatch();

  const handleBack = () => {
    // Get the current route name
    const currentRouteName = route.name;

    // Implement proper back navigation flow
    switch (currentRouteName) {
      case 'AddNewTour':
        // From AddNewTour go back to Tours
        navigation.navigate('Tours');
        break;
      case 'AddNewTourDestinations':
        // From AddNewTourDestinations go back to AddNewTour
        navigation.navigate('AddNewTour');
        break;
      case 'AddNewTourOrganize':
        // From AddNewTourOrganize go back to AddNewTourDestinations
        const params = route.params as { title?: string; startDate?: string; endDate?: string };
        navigation.navigate('AddNewTourDestinations', {
          title: params?.title || '',
          startDate: params?.startDate || '',
          endDate: params?.endDate || ''
        });
        break;
      default:
        // For other screens, use standard back navigation
        navigation.goBack();
    }
  };

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={handleBack} style={styles.backButton}>
        <AntDesign name="left" size={24} color="black" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
      {showTour && onTourPress && (
        <TouchableOpacity style={styles.tourButton} onPress={onTourPress}>
          <Ionicons name="information-circle-outline" size={20} color="#FFF" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 15,
  },
  backButton: {
    width: 42,
    height: 42,
    backgroundColor: 'white', 
    borderRadius: 42 / 2, 
    borderWidth: 2, 
    borderColor: '#D3D3D3', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    paddingHorizontal:6,
    marginLeft: 6,
    marginRight: 25,
    fontFamily: 'Raleway', 
    fontWeight: '700',
    fontSize: 18,
    lineHeight: 26,
    letterSpacing: 0,
    color: '#000000',
  },
  tourButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 25,
    paddingVertical: 5,
    paddingHorizontal: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default TourFlowHeader; 