import React, { FC } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Entertainment } from "../store/entertainmentSlice";

type EntertainmentCardProps = {
  item: Entertainment;
  onPress: (item: Entertainment) => void;
};

const EntertainmentCard: FC<EntertainmentCardProps> = ({ item, onPress }) => {
  const coverImage = item.images
    ?.find((img) => img.isCover)
    ?.variants.find((variant) => variant.width === 720)
    ?.url
    || (item.images && item.images.length > 0 ? item.images[0].variants[0]?.url : null);

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
        <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.cardDescription} numberOfLines={3}>{item.description}</Text>
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
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  cardCode: {
    fontSize: 12,
    color: '#999',
  },
});

export default EntertainmentCard;
