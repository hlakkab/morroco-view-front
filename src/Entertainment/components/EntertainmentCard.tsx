import React, { FC } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { Entertainment, entertainmentHelpers } from "../types/Entertainment";
import { useFirstImage } from '../../utils/useImages';
import { updateEntertainmentImage } from '../store/entertainmentSlice';

type EntertainmentCardProps = {
  item: Entertainment;
  onPress: (item: Entertainment) => void;
};

const EntertainmentCard: FC<EntertainmentCardProps> = ({ item, onPress }) => {
  // Get entertainment code/id for image fetching (same pattern as Monument)
  const entertainmentId = item.code || item.id;
  
  // Convert images to string[] format (handle both new and legacy formats)
  // For the hook, we need a simple string array, so extract from whatever format we have
  const imagesArray: string[] = (() => {
    if (!Array.isArray(item.images) || item.images.length === 0) {
      return [];
    }
    
    // New API format: array of strings
    if (typeof item.images[0] === 'string') {
      return item.images as string[];
    }
    
    // Legacy format: array of image objects with variants
    // Extract URLs from variants (same logic as helper but simplified)
    const urls: string[] = [];
    (item.images as any[]).forEach((img: any) => {
      if (img?.variants?.length > 0) {
        const sortedVariants = [...img.variants].sort((a: any, b: any) =>
          (b.width * b.height) - (a.width * a.height)
        );
        const idealVariant = sortedVariants.find((v: any) =>
          v.width >= 720 && v.width <= 1080
        ) || sortedVariants[0];
        if (idealVariant?.url) {
          urls.push(idealVariant.url);
        }
      }
    });
    return urls;
  })();
  
  // Use hook to track image loading state (same pattern as MonumentCard)
  const { imageUrl, loading } = useFirstImage(
    entertainmentId, 
    item.id, 
    imagesArray.length > 0 ? imagesArray : undefined,
    updateEntertainmentImage
  );
  
  // Use fetched image or existing image (same pattern as MonumentCard)
  const displayImage = imageUrl || (imagesArray.length > 0 ? imagesArray[0] : undefined);
  const hasImage = !!displayImage;
  
  // Get rating info (handles both new and legacy formats)
  const { rating, ratingCount } = entertainmentHelpers.getRatingInfo(item);
  const formattedRating = Number(rating.toFixed(1));
  
  // Get formatted price (handles both new and legacy formats)
  const formattedPrice = entertainmentHelpers.getFormattedPrice(item);
  
  // Get display name (handles both new and legacy formats)
  const displayName = entertainmentHelpers.getDisplayName(item);
  
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
      style={[styles.card, item.isPartner && styles.partnerCard]}
      onPress={() => onPress(item)}
    >
      {item.isPartner && (
        <>
          <View style={styles.partnerBadge}>
            <Ionicons name="star" size={12} color="#000" style={styles.partnerIcon} />
            <Text style={styles.partnerBadgeText}>Partner</Text>
          </View>
          <View style={styles.partnerOverlay} />
        </>
      )}
      <View style={styles.imageContainer}>
        {hasImage ? (
          <Image
            source={{ uri: displayImage }}
            style={styles.cardImage}
            resizeMode="cover"
          />
        ) : loading ? (
          <View style={styles.imagePlaceholder}>
            <ActivityIndicator size="large" color="#008060" />
            <Text style={styles.loadingText}>Loading image...</Text>
          </View>
        ) : (
          <View style={styles.imagePlaceholder}>
            <MaterialIcons name="local-activity" size={48} color="#ccc" />
          </View>
        )}
        {/* Show loading overlay if image exists but is still loading a new one */}
        {hasImage && loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color="#008060" />
          </View>
        )}
      </View>
      <View style={styles.cardContent}>
        <View style={styles.starRating}>
          {renderStars(formattedRating)}
          <Text style={styles.ratingText}>
            {`${formattedRating}${ratingCount > 0 ? ` (${ratingCount})` : ''}`}
          </Text>
          {item.isPartner && (
            <View style={styles.partnerTag}>
              <Ionicons name="star" size={10} color="#000" />
              <Text style={styles.partnerTagText}>Partner</Text>
            </View>
          )}
        </View>
        <Text style={[styles.cardTitle, item.isPartner && styles.partnerTitle]} numberOfLines={2}>{displayName}</Text>
        {/* from price element */}
        {formattedPrice && (
          <View style={styles.priceContainer}>
            <Text style={styles.priceText}>{`From ${formattedPrice} MAD`}</Text>
          </View>
        )}
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
  partnerCard: {
    borderWidth: 2.5,
    borderColor: '#FFD700',
    elevation: 6,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  partnerBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    zIndex: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFA500',
  },
  partnerIcon: {
    marginRight: 4,
  },
  partnerBadgeText: {
    color: '#000',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  partnerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 215, 0, 0.05)',
    zIndex: 1,
    pointerEvents: 'none',
  },
  cardImage: {
    width: '100%',
    height: 200,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 12,
    color: '#008060',
    fontWeight: '500',
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
  partnerTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginLeft: 8,
  },
  partnerTagText: {
    color: '#000',
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginLeft: 3,
    letterSpacing: 0.3,
  },
  partnerTitle: {
    color: '#1a1a1a',
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
