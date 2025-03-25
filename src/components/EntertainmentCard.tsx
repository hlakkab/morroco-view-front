import React, { FC } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { Entertainment, EntertainmentImage, ImageVariant } from "../types/Entertainment";

type EntertainmentCardProps = {
  item: Entertainment;
  onPress: (item: Entertainment) => void;
};

const EntertainmentCard: FC<EntertainmentCardProps> = ({ item, onPress }) => {
  const coverImage = item.images
    ?.find((img: EntertainmentImage) => img.isCover)
    ?.variants.find((variant: ImageVariant) => variant.width === 720)
    ?.url
    || (item.images && item.images.length > 0 ? item.images[0].variants[0]?.url : null);

  const rating = Number(item.reviews.combinedAverageRating.toFixed(1))
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <MaterialIcons key={i} name="star" size={20} color="#FFD700" style={styles.star} />
        );
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <MaterialIcons key={i} name="star-half" size={20} color="#FFD700" style={styles.star} />
        );
      } else {
        stars.push(
          <MaterialIcons key={i} name="star-outline" size={20} color="#D3D3D3" style={styles.star} />
        );
      }
    }
    return stars;
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(item)}
    >
      {coverImage && (
        <Image
          source={{ uri: coverImage }}
          style={styles.cardImage}
          resizeMode="cover"
        />
      )}
      <View style={styles.cardContent}>
        <View style={styles.starRating}>
          {renderStars(rating)}
          <Text style={styles.ratingText}>{`${rating} (${item.reviews.totalReviews})`}</Text>
        </View>
        <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
        {/* from price element */}
        <View style={styles.priceContainer}>
          <Text style={styles.priceText}>{`From ${item.pricing.summary.fromPrice}$`}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardImage: {
    width: '100%',
    height: 200,
  },
  cardContent: {
    padding: 16,
    flex: 1,
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',

  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
  },
  cardCode: {
    fontSize: 12,
    color: '#999',
  },
  starRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    marginRight: 1,
  },
  ratingText: {
    marginLeft: 10,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#006400', // dark green
  },
});

export default EntertainmentCard;
