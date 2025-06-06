import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import CardItem from '../components/cards/CardItem';
import SaveButton from '../components/SaveButton';
import AuthModal from '../components/AuthModal';
import { setSelectedEntertainment, toggleEntertainmentBookmark } from '../store/entertainmentSlice';
import { useAppDispatch } from '../store/hooks';
import i18n from '../translations/i18n';
import { Entertainment, entertainmentHelpers } from '../types/Entertainment';
import { RootStackParamList } from '../types/navigation';
import { useAuth } from '../contexts/AuthContext';

interface EntertainmentListContainerProps {
  entertainments: Entertainment[];
  loading: boolean;
  error: string | null;
}

const EntertainmentListContainerVo: React.FC<EntertainmentListContainerProps> = ({
  entertainments,
  loading,
  error,
}) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleEntertainmentPress = (ent: Entertainment) => {
    dispatch(setSelectedEntertainment(ent));
    navigation.navigate('EntertainmentDetail', {
      productCode: ent.productCode,
      title: ent.title,
    });
  };

  const handleSaveEntertainment = (ent: Entertainment) => {
    if (!isAuthenticated()) {
      setShowAuthModal(true);
      return;
    }
    
    dispatch(toggleEntertainmentBookmark(ent));
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

  // Get appropriate message for empty state
  const getEmptyStateMessage = () => {
    if (!entertainments || entertainments.length === 0) {
      return i18n.t('entertainment.noEntertainmentAvailable');
    }
    return i18n.t('entertainment.noEntertainmentFilters');
  };

  if (loading) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{i18n.t('entertainment.loading')}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{error}</Text>
      </View>
    );
  }

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
                    label: `(${item.reviews.totalReviews} ${item.reviews.totalReviews === 1 ? i18n.t('entertainment.review') : i18n.t('entertainment.reviews')})`,
                  },
                ]}
                onCardPress={() => handleEntertainmentPress(item)}
                containerStyle={{ marginBottom: 16 }}
              />
              <SaveButton
                onPress={() => handleSaveEntertainment(item)}
                isSaved={item.saved}
              />
            </View>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <FontAwesome name="search" size={48} color="#ccc" />
          <Text style={styles.emptyText}>{getEmptyStateMessage()}</Text>
        </View>
      )}

      <AuthModal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
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
    marginBottom: 100,
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
