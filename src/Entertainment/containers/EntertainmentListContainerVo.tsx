import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import CardItem from '../../components/cards/CardItem';
import SaveButton from '../../components/SaveButton';
import AuthModal from '../../components/AuthModal';
import Pagination from '../../components/Pagination';
import { setSelectedEntertainment, toggleEntertainmentBookmark } from '../store/entertainmentSlice';
import { useAppDispatch } from '../../store/hooks';
import i18n from '../../translations/i18n';
import { Entertainment, entertainmentHelpers } from '../types/Entertainment';
import { RootStackParamList } from '../../types/navigation';
import { useAuth } from '../../contexts/AuthContext';

interface EntertainmentListContainerProps {
  entertainments: Entertainment[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalElements: number;
  onPageChange: (page: number) => void;
}

const EntertainmentListContainerVo: React.FC<EntertainmentListContainerProps> = ({
  entertainments,
  loading,
  error,
  currentPage,
  totalPages,
  totalElements,
  onPageChange,
}) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleEntertainmentPress = (ent: Entertainment) => {
    dispatch(setSelectedEntertainment(ent));
    const productCode = ent.productCode || ent.code;
    const title = ent.title || ent.name;
    navigation.navigate('EntertainmentDetail', {
      productCode,
      title,
    });
  };

  const handleSaveEntertainment = async (ent: Entertainment) => {
    if (!(await isAuthenticated())) {
      setShowAuthModal(true);
      return;
    }
    
    dispatch(toggleEntertainmentBookmark(ent));
  };

  const renderStars = (entertainment: Entertainment) => {
    const { rating, fullStars, ratingCount } = entertainmentHelpers.getRatingInfo(entertainment);

    return (
      <View style={styles.starContainer}>
        {Array.from({ length: fullStars }).map((_, index) => (
          <FontAwesome key={`full-${index}`} name="star" size={20} color="#FFD700" />
        ))}
        {entertainment.hasHalfStar && <FontAwesome name="star-half-empty" size={20} color="#FFD700" />}
        <Text style={styles.ratingText}>
          {rating.toFixed(1)}
          {ratingCount > 0 && ` (${ratingCount})`}
        </Text>
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
        <>
          <FlatList
            data={entertainments}
            keyExtractor={(item) => item.id || item.productCode || item.code}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            renderItem={({ item }) => {
              const displayName = entertainmentHelpers.getDisplayName(item);
              const price = entertainmentHelpers.getFormattedPrice(item);
              const subtitle = price ? `From ${price} MAD` : item.address || '';
              const isPartner = item.isPartner === true;

              return (
                <View style={styles.CardEntertainmentContainer}>
                  <View style={[styles.cardWrapper, isPartner && styles.partnerCardWrapper]}>
                    {isPartner && (
                      <View style={styles.partnerBadge}>
                        <Ionicons name="star" size={10} color="#FFF" />
                        <Text style={styles.partnerBadgeText}>Partner</Text>
                      </View>
                    )}
                    <CardItem
                      imageUrl={entertainmentHelpers.getPrimaryImageUrl(item)}
                      title={displayName}
                      subtitle={subtitle}
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
                          borderRadius: 10,
                          marginBottom: 0,
                          overflow: 'hidden',
                          elevation: isPartner ? 6 : 3,
                          shadowColor: isPartner ? '#AE1913' : '#000',
                          shadowOffset: { width: 0, height: isPartner ? 4 : 2 },
                          shadowOpacity: isPartner ? 0.4 : 0.1,
                          shadowRadius: isPartner ? 8 : 4,
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
                          label: '',
                        }
                      ]}
                      onCardPress={() => handleEntertainmentPress(item)}
                      containerStyle={{ marginBottom: 16 }}
                    />
                  </View>
                  <SaveButton
                    onPress={() => handleSaveEntertainment(item)}
                    isSaved={item.saved}
                  />
                </View>
              );
            }}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
          {totalPages > 1 && (
            <Pagination
              totalItems={totalElements}
              itemsPerPage={entertainments.length || 10}
              currentPage={currentPage + 1} // Convert from 0-based to 1-based
              onPageChange={onPageChange}
            />
          )}
        </>
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
    position: 'relative',
  },
  separator: {
    height: 10,
  },
  cardWrapper: {
    position: 'relative',
  },
  partnerCardWrapper: {
    borderWidth: 3,
    borderColor: '#AE1913',
    borderRadius: 12,
    overflow: 'hidden',
  },
  partnerBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#AE1913',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
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
    borderColor: '#8B1410',
  },
  partnerBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: 3,
  },
});

export default EntertainmentListContainerVo;
