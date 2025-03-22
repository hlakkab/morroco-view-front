import React, { Component, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ImageBackground, FlatList, Image} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import CafCupSvg   from '../assets/img/caf-cup-img.svg';
import GitexAfrica from '../assets/img/gitex-africa.svg';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator'; 
import { Ionicons } from '@expo/vector-icons';
import { Event } from '../types/Event';

// Import the JPG as a require statement instead of importing it as a component

const { width } = Dimensions.get('window');


interface EventBannerContainerProps {
  onExplore: () => void;
}

interface EventBannerProps extends Event {
  logo?: string;
  backgroundColor?: string;
}


const EventBanner: React.FC<EventBannerProps> = (props) => {

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { name, images, logo, backgroundColor, type} = props;

  const handlePress = () => {
    
    if(props.type !== 'FOOTBALL') {
      navigation.navigate('EventDetail', props);
    } else {
      navigation.navigate('ExploreMatches');
    }
  }


  return (
    <TouchableOpacity style={styles.banner} onPress={handlePress}>
      {/* Use ImageBackground component for the JPG image */}
      <ImageBackground 
        source={{ uri: images[0] }} 
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <LinearGradient
          dither={true}
          colors={['rgba(0, 0, 0, 0.8)', 'rgba(0, 0, 0, 0.1)', 'rgba(0, 0, 0, 0)']}
          locations={[0, 0.6, 1]}
          start={{ x: 1, y: 1 }}
          end={{ x: 1, y: 0 }}

          style={styles.bannerGradient}
        >
          <View style={styles.bannerLogoContainer}>
            <View style={{padding: 3, backgroundColor: backgroundColor, borderRadius: 5}}>
            {logo && <Image 
              source={{uri: logo}} 
              resizeMode='contain'
             
              width={90} height={60}
              style={{
                borderRadius: 2,
              }}
              />}              
            </View>
           
          </View>
          
          <View style={styles.bannerBottomRow}>
            <View style={styles.titleContainer}>
              <Text style={styles.bannerTitle}>{name}</Text>
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.exploreButton} onPress={handlePress}>
                <Text style={styles.exploreButtonText}>Explore {type === 'FOOTBALL' ? 'Matches' : 'Event'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );
};


const EventBannerContainer: React.FC<EventBannerContainerProps> = ({ onExplore }) => {

  const [currentIndex, setCurrentIndex] = useState(0);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();


  const handleScroll = (event: any) => {
    const slideIndex = Math.floor(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(slideIndex);
  };

  const events: EventBannerProps[] = [
    {
      id: '1',
      name: 'Africa Cup Of Nations', 
      images: ['https://img.olympics.com/images/image/private/t_s_pog_staticContent_hero_lg_2x/f_auto/primary/sv4zhez2lyydydg8a4tb'],
      logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4_bSL_Gik4jV8aO4LMxk0xqjIMPxiwR2APg&s',
      backgroundColor: '#00000000',
      type: 'FOOTBALL',
      description: 'The Africa Cup of Nations is a prestigious football tournament that showcases the best teams and players from across the continent. It is held every two years and attracts millions of viewers.',
      website: 'https://www.afcon.com',
      fromDate: '2024-01-01',
      toDate: '2024-01-31',
      location: 'Morocco',
      address: 'Morocco',
    
    },
    {
      id: '2',
      name: 'Gitex Africa Morocco', 
      images: ['https://gitexafrica.com/Uploads//Posts/news/GITEX-Africa-News_07.jpg'],
      logo: 'https://www.internationalboost.com/wp-content/uploads/2023/07/logo-gitex-africa.png',
      backgroundColor: '#0dc2',
      type: 'EXPO',
      description: 'Gitex Africa Morocco is a leading technology event that brings together industry leaders, innovators, and experts to discuss the latest trends and advancements in the technology sector.',
      website: 'https://www.gitexafrica.com',
      fromDate: '2025-04-14',
      toDate: '2025-04-16',
      location: 'Morocco',
      address: 'Morocco',
 
    }
  ]

  return (
    <View style={styles.container}>
      <View style={styles.imageSection}>

        <FlatList
          data={events}
          renderItem={({ item }) => <EventBanner {...item} />}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          onScroll={handleScroll}
        />

        <View style={styles.paginationContainer}>
          <View style={styles.pagination}>
            {events.map((_, index) => (
              <View 
                key={index} 
                style={[
                  styles.paginationDot, 
                  index === currentIndex && styles.activePaginationDot
                ]} 
              />
            ))}
          </View>
        </View>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({

  container: {
    width: width,
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },

  imageSection: {
    
    position: 'relative',
    width: '100%',
    backgroundColor: '#FFF7F7',
  },
 
  banner: {
    height: 200,
    borderRadius: 15,
    overflow: 'visible',
  },
  backgroundImage: {
    width: width,
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

  paginationContainer: {
    position: 'absolute',
    bottom: 8,
    width: '100%',
    alignItems: 'center',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  activePaginationDot: {
    backgroundColor: '#fff',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});

export default EventBannerContainer;