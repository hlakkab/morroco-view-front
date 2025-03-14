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
      {/*{onBack && (
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
      )}*/}
      <BackButton />
      <Text style={styles.headerTitle}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 36,
  //  paddingHorizontal: 16,
    paddingBottom: 40,
  },
  /*backButton: {
    padding: 8,
  },*/
  headerTitle: {
   /* fontSize: 20,
    fontWeight: '600',
    marginLeft: 8,*/
    width: 205,
    height: 26,
    top: 15,
    left: 90,
    fontFamily: 'Raleway', 
    fontWeight: '700',
    fontSize: 20,
    lineHeight: 26,  
    letterSpacing: 0,
    color: '#000000',
  },
});

export default ScreenHeader;