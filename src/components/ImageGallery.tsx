import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import { Dimensions, FlatList, Image, StyleSheet, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

interface ImageGalleryProps {
  images: string[];
  isSaved: boolean;
  onSavePress: () => void;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, isSaved, onSavePress }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleScroll = (event: any) => {
    const slideIndex = Math.floor(event.nativeEvent.contentOffset.x / width);
    setCurrentImageIndex(slideIndex);
  };

  return (
    <View style={styles.imageSection}>
      <FlatList
        ref={flatListRef}
        data={images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <Image 
            source={{ uri: item }} 
            style={styles.image} 
            resizeMode="cover"
          />
        )}
      />
      
      <TouchableOpacity 
        style={[styles.saveButton, isSaved && styles.savedButton, {borderColor: isSaved ? "white" : "#666"}]} 
        onPress={onSavePress}
      >
        <Ionicons 
          name={isSaved ? "bookmark" : "bookmark-outline"} 
          size={24} 
          color={isSaved ? "white" : "#666" }
        />
      </TouchableOpacity>
      
      <View style={styles.paginationContainer}>
        <View style={styles.pagination}>
          {images.map((_, index) => (
            <View 
              key={index} 
              style={[
                styles.paginationDot, 
                index === currentImageIndex && styles.activePaginationDot
              ]} 
            />
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  imageSection: {
    position: 'relative',
    width: '100%',
    height: 240,
    backgroundColor: '#FFF7F7',
  },
  image: {
    width: width,
    height: 240,
  },
  saveButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    opacity: 0.8,
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.7,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4C4C4CBF',
    borderColor: '#666',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  savedButton: {
    opacity: 1,
    backgroundColor: '#888888',
    borderColor: '#fff',
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 16,
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

export default ImageGallery; 