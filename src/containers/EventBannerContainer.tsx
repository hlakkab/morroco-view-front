import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import CafCupSvg from '../assets/img/caf-cup-img.svg';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator'; 

// Import the JPG as a require statement instead of importing it as a component
const stadiumImage = require('../assets/img/stadum-img.jpg');

const { width } = Dimensions.get('window');


interface EventBannerContainerProps {
  onExplore: () => void;
}

const EventBannerContainer: React.FC<EventBannerContainerProps> = ({ onExplore }) => {

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();


  return (
    <TouchableOpacity style={styles.banner} onPress={() => navigation.navigate('ExploreMatches')}>
      {/* Use ImageBackground component for the JPG image */}
      <ImageBackground 
        source={stadiumImage} 
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0)']}
          style={styles.bannerGradient}
        >
          <View style={styles.bannerLogoContainer}>
            <CafCupSvg width={80} height={80} />
          </View>
          
          <View style={styles.bannerBottomRow}>
            <View style={styles.titleContainer}>
              <Text style={styles.bannerTitle}>Africa Cup Of Nations</Text>
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.exploreButton} onPress={() => navigation.navigate('ExploreMatches')}>
                <Text style={styles.exploreButtonText}>Explore Matches</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  banner: {
    height: 200,
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 20,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  bannerGradient: {
    flex: 1,
    padding: 14,
    justifyContent: 'space-between',
  },
  bannerLogoContainer: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  bannerBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  titleContainer: {
    width: '50%',
    paddingRight: 8,
  },
  buttonContainer: {
    width: '50%',
    alignItems: 'flex-end',
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 23,
    fontWeight: 'bold',
  },
  exploreButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  exploreButtonText: {
    color: '#AE1913',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default EventBannerContainer;