import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BackButton from './BackButton';
interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
}
 
const ScreenHeader: React.FC<ScreenHeaderProps> = ({ title, onBack }) => {
  return (
    <View style={styles.header}>
      <BackButton />
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
  headerTitle: {
    marginLeft: 10,
    marginRight: 25,
    fontFamily: 'Raleway', 
    fontWeight: '700',
    fontSize: 20,
    lineHeight: 26,  
    letterSpacing: 0,
    color: '#000000'
    ,

  },
});

export default ScreenHeader;