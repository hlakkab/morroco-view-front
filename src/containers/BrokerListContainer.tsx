import { NavigationProp, useNavigation } from '@react-navigation/native';
import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import BrokerCard from '../components/cards/BrokerCard';
import { toggleBrokerBookmark } from '../store/exchangeBrokerSlice';
import { useAppDispatch } from '../store/hooks';
import { Broker } from '../types/exchange-broker';
import { RootStackParamList } from '../types/navigation';

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
      <FlatList
        data={brokers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <BrokerCard item={item} handleSaveBroker={handleSaveBroker} handleBrokerPress={handleBrokerPress} />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
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
  }
});

export default BrokerListContainer; 