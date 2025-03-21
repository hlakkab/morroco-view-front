import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import CardItem from '../components/cards/CardItem';
import SaveButton from '../components/SaveButton';
import { Entertainment, entertainmentHelpers } from '../types/Entertainment';
import { RootStackParamList } from '../types/navigation';

interface EntertainmentListContainerProps {
  entertainments: Entertainment[];
}

const EntertainmentListContainerVo: React.FC<EntertainmentListContainerProps> = ({ entertainments }) => {
  const [savedEntertainments, setSavedEntertainments] = useState<Record<string, boolean>>({});
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Modification : On passe productCode et title à l'écran de détail pour permettre la récupération du détail complet
  const handleEntertainmentPress = (ent: Entertainment) => {
    navigation.navigate('EntertainmentDetail', {
      productCode: ent.productCode,
      title: ent.title,
    });
  };

  const handleSaveEntertainment = (id: string) => {
    setSavedEntertainments(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const renderStars = (entertainment: Entertainment) => {
    const { rating, fullStars } = entertainmentHelpers.getRatingInfo(entertainment);

    return (
      <View style={styles.starContainer}>
        {Array.from({ length: fullStars }).map((_, index) => (
          <FontAwesome key={`full-${index}`} name="star" size={20} color="#FFD700" />
        ))}
        {entertainment.hasHalfStar && <FontAwesome name="star-half-empty" size={20} color="#FFD700" />}
        <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {entertainments.length > 0 ? (
        <FlatList
          data={entertainments}
          keyExtractor={(item) => item.productCode}
          renderItem={({ item }) => (
            <View style={styles.CardEntertainmentContainer}>
              <CardItem
                imageUrl={entertainmentHelpers.getPrimaryImageUrl(item)}
                title={item.title}
                subtitle={`From $${entertainmentHelpers.getFormattedPrice(item)}`}
                customStyles={{
                  mainTag: {
                    marginTop: 10,
                    backgroundColor: '#F6FAFF',
                    borderWidth: 0,
                    borderColor: '#FFD700',
                    paddingHorizontal: 6,
                    paddingVertical: 3,
                    borderRadius: 16,
                  },
                  mainTagText: {
                    left: 2,
                    color: 'black',
                    fontWeight: '700',
                    fontSize: 14.5,
                  },
                  container: {
                    backgroundColor: 'white',
                    borderRadius: 12,
                    marginBottom: 16,
                    overflow: 'hidden',
                    elevation: 3,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    flexDirection: 'column',
                    paddingHorizontal: 0,
                    paddingVertical: 0,
                  },
                  image: {
                    width: '106%',
                    height: 200,
                    paddingBottom: 30,
                    left: 3,
                  },
                  content: {
                    padding: 16,
                    paddingTop: 8,
                    gap: 8,
                    paddingBottom: 8,
                  },
                  title: {
                    fontSize: 18,
                    fontWeight: 'bold',
                    marginBottom: 8,
                    color: '#000',
                  },
                  subtitle: {
                    fontSize: 14,
                    fontWeight: 'bold',
                    color: '#006400',
                  },
                }}
                tags={[
                  {
                    id: 'rating',
                    icon: renderStars(item),
                    label: `(${item.reviews.totalReviews} reviews)`,
                  },
                ]}
                onCardPress={() => handleEntertainmentPress(item)}
                containerStyle={{ marginBottom: 16 }}
              />
              <SaveButton
                onPress={() => handleSaveEntertainment(item.productCode)}
                isSaved={savedEntertainments[item.productCode]}
              />
            </View>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <FontAwesome name="search" size={48} color="#ccc" />
          <Text style={styles.emptyText}>No entertainments found.</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  starContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 6,
  },
  CardEntertainmentContainer: {
    
  },
});

export default EntertainmentListContainerVo;
