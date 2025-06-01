import { Ionicons } from '@expo/vector-icons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { CopilotStep, walkthroughable } from 'react-native-copilot';
import BrokerCard from '../components/cards/BrokerCard';
import AuthModal from '../components/AuthModal';
import { useAuth } from '../contexts/AuthContext';
import { toggleBrokerBookmark } from '../store/exchangeBrokerSlice';
import { useAppDispatch } from '../store/hooks';
import i18n from '../translations/i18n';
import { Broker } from '../types/exchange-broker';
import { RootStackParamList } from '../types/navigation';

// Create walkthroughable components
const WalkthroughableView = walkthroughable(View);

interface BrokerListContainerProps {
  brokers: Broker[];
  loading: boolean;
  error: string | null;
}

const BrokerListContainer: React.FC<BrokerListContainerProps> = ({
  brokers,
  loading,
  error,
}) => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isAuthenticated } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleBrokerPress = (broker: Broker) => {
    // Navigate to broker detail screen
    navigation.navigate("BrokerDetail", { ...broker, location: broker.city });
  };

  const handleSaveBroker = (id: string) => {
    if (!isAuthenticated()) {
      setShowAuthModal(true);
      return;
    }
    
    const broker = brokers.find(b => b.id === id);
    if (broker) {
      dispatch(toggleBrokerBookmark(broker));
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>{i18n.t('broker.loading')}</Text>
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
        text={i18n.t('copilot.broker.browseBrokers')}
        order={3}
        name="brokerList"
      >
        <WalkthroughableView style={styles.brokerListHighlight}>
          {brokers.length > 0 ? (
            <FlatList
              data={brokers}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <BrokerCard item={item} handleSaveBroker={handleSaveBroker} handleBrokerPress={handleBrokerPress} />
              )}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>{i18n.t('exchange.noBrokersFound')}</Text>
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
  cardContainer: {
    marginBottom: 16,
  },
  brokerListHighlight: {
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

export default BrokerListContainer; 