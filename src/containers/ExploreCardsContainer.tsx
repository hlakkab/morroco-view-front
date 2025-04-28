import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, ImageBackground, StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { useLanguage } from '../contexts/LanguageContext';
import i18n from '../translations/i18n';

// Example JPG imports - replace these with your actual paths
const monumentsImage = require('../assets/exploreBgImgs/monuments.jpg');
const restaurantImage = require('../assets/exploreBgImgs/restaurant.jpg');
const entertainmentImage = require('../assets/exploreBgImgs/entertainment.jpg');
const artisansImage = require('../assets/exploreBgImgs/artisans.jpg');

const { width } = Dimensions.get('window');

interface CategoryCardProps {
  title: string;
  translationKey: string;
  imageSrc: any; // Image source
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ title, translationKey, imageSrc, style, onPress }) => {
  return (
    <TouchableOpacity 
      style={[styles.categoryCard, style]} 
      onPress={onPress}
    >
      <ImageBackground
        source={imageSrc}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.2)']}
          style={styles.categoryGradient}
        >
          <Text style={styles.categoryText}>{i18n.t(`categories.${translationKey}`)}</Text>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );
};

interface ExploreCardsContainerProps {
  onCategoryPress: (category: string) => void;
}

const ExploreCardsContainer: React.FC<ExploreCardsContainerProps> = ({ onCategoryPress }) => {
  // Use language context to force re-render on language change
  const { currentLanguage } = useLanguage();

  return (
    <>
      <Text style={styles.sectionTitle}>{i18n.t('home.exploreMorocco')}</Text>
      
      {/* First Row */}
      <View style={styles.categoryRow}>
        <CategoryCard 
          title="Monuments" 
          translationKey="monuments"
          imageSrc={monumentsImage}
          onPress={() => onCategoryPress('Monuments')}
        />
        <CategoryCard 
          title="Restaurant" 
          translationKey="restaurant"
          imageSrc={restaurantImage}
          style={styles.restaurantCard} 
          onPress={() => onCategoryPress('Restaurant')}
        />
      </View>
      
      {/* Second Row */}
      <View style={styles.categoryRow}>
        <CategoryCard 
          title="Entertainment" 
          translationKey="entertainment"
          imageSrc={entertainmentImage}
          style={styles.entertainmentCard} 
          onPress={() => onCategoryPress('Entertainment')}
        />
        <CategoryCard 
          title="Artisans" 
          translationKey="artisans"
          imageSrc={artisansImage}
          style={styles.artisansCard} 
          onPress={() => onCategoryPress('Artisans')}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  categoryCard: {
    width: (width - 42) / 2,
    height: 100,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#E0E0E0', // Fallback color
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  categoryGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 15,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  restaurantCard: {
    backgroundColor: '#789395', // Fallback color for restaurant image
  },
  entertainmentCard: {
    backgroundColor: '#F5CBA7', // Fallback sunset color
  },
  artisansCard: {
    backgroundColor: '#AEC6CF', // Fallback color for artisans image
  },
});

export default ExploreCardsContainer;