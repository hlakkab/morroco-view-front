import { Ionicons } from '@expo/vector-icons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { CopilotStep, walkthroughable } from 'react-native-copilot';
import BrokerCard from '../components/cards/BrokerCard';
import { toggleBrokerBookmark } from '../store/exchangeBrokerSlice';
import { useAppDispatch } from '../store/hooks';
import i18n from '../translations/i18n';
import { Broker } from '../types/exchange-broker';
import { RootStackParamList } from '../types/navigation';

// Create walkthroughable components
const WalkthroughableView = walkthroughable(View);

interface BrokerListContainerProps {
  brokers: Broker[];
}

const BrokerListContainer: React.FC<BrokerListContainerProps> = ({
  brokers
}) => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const handleBrokerPress = (broker: Broker) => {
    // Navigate to broker detail screen
    navigation.navigate("BrokerDetail", { ...broker, location: broker.city });
  };

  const handleSaveBroker = (id: string) => {
    const broker = brokers.find(b => b.id === id);
    if (broker) {
      dispatch(toggleBrokerBookmark(broker));
    }
  };

  return (
    <View style={styles.container}>
      <CopilotStep
        text="Browse and select a broker to view details and exchange rates"
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
  }
});

export default BrokerListContainer; 