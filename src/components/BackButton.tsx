import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator'; 
import AntDesign from '@expo/vector-icons/AntDesign';

const BackButton: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <TouchableOpacity
      style={styles.backButton}
      onPress={() => navigation.goBack()} 
    >
    <AntDesign name="left" size={24} color="black" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
});

export default BackButton;
