import { Ionicons } from '@expo/vector-icons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { CopilotStep, walkthroughable } from 'react-native-copilot';
import AuthModal from '../components/AuthModal';
import GuideCard from '../components/cards/GuideCard';
import { useAuth } from '../contexts/AuthContext';
import { toggleGuideBookmark } from '../store/guideSlice';
import { useAppDispatch } from '../store/hooks';
import i18n from '../translations/i18n';
import { Guide } from '../types/guide';
import { RootStackParamList } from '../types/navigation';

// Create walkthroughable components
const WalkthroughableView = walkthroughable(View);

interface GuideListContainerProps {
  guides: Guide[];
  loading: boolean;
  error: string | null;
}

const GuideListContainer: React.FC<GuideListContainerProps> = ({
  guides,
  loading,
  error,
}) => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isAuthenticated } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleGuidePress = (guide: Guide) => {
    // Navigate to guide detail screen
    navigation.navigate("GuideDetail", guide);
  };

  const handleSaveGuide = (id: string) => {
    if (!isAuthenticated()) {
      setShowAuthModal(true);
      return;
    }
    
    const guide = guides.find(g => g.id === id);
    if (guide) {
      dispatch(toggleGuideBookmark(guide));
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>{i18n.t('guide.loading')}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CopilotStep
        text={i18n.t('copilot.guide.browseGuides')}
        order={3}
        name="guideList"
      >
        <WalkthroughableView style={styles.guideListHighlight}>
          {guides.length > 0 ? (
            <FlatList
              data={guides}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <GuideCard 
                  item={item} 
                  handleSaveGuide={handleSaveGuide} 
                  handleGuidePress={handleGuidePress} 
                />
              )}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>{i18n.t('guide.noGuidesFound')}</Text>
            </View>
          )}
        </WalkthroughableView>
      </CopilotStep>

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
  guideListHighlight: {
    flex: 1,
    width: '100%',
    overflow: 'hidden',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    marginTop: 16,
  }
});

export default GuideListContainer;

