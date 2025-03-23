import { Ionicons } from '@expo/vector-icons';
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface TourFlowHeaderProps {
  title: string;
}

const TourFlowHeader: React.FC<TourFlowHeaderProps> = ({ title }) => {
  const navigation = useNavigation();
  const route = useRoute();

  const handleBack = () => {
    // Get the current route name
    const currentRouteName = route.name;

    if (currentRouteName === 'Tours') {
      // If we're on the Tours screen, just go back using the regular navigation
      navigation.goBack();
    } else {
      // For tour creation flow, reset navigation stack to Tours
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            { name: 'Home' }, // First go to Home
            { name: 'Tours' }, // Then go to Tours
          ],
        })
      );
    }
  };

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={handleBack} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 25,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    marginLeft: 10,
    marginRight: 25,
    fontFamily: 'Raleway', 
    fontWeight: '700',
    fontSize: 20,
    lineHeight: 26,  
    letterSpacing: 0,
    color: '#000000',
  },
});

export default TourFlowHeader; 