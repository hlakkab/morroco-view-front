import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import MatchTicketCard from '../components/cards/MatchTicketCard';
import PickupTicketCard from '../components/cards/PickupTicketCard';
import ScreenHeader from '../components/ScreenHeader';
import BottomNavBar from '../containers/BottomNavBar';
import { AppDispatch, RootState } from '../store/store';
import { fetchTickets } from '../store/ticketSlice';
import i18n from '../translations/i18n';
import { Match } from '../types/match';
import { Ticket } from '../types/ticket';
import { HotelPickup } from '../types/transport';

const TicketsScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { tickets, loading, error } = useSelector((state: RootState) => state.ticket);
  const [searchQuery, setSearchQuery] = React.useState('');

  useEffect(() => {
    dispatch(fetchTickets());
  }, [dispatch]);

  const filteredTickets = tickets.filter(ticket => {
    if (!searchQuery) return true;
    
    const lowerCaseQuery = searchQuery.toLowerCase();
    
    if (ticket.type === 'MATCH') {
      const match = ticket.object as Match;
      return (
        match.homeTeam.toLowerCase().includes(lowerCaseQuery) ||
        match.awayTeam.toLowerCase().includes(lowerCaseQuery) ||
        match.spot.name.toLowerCase().includes(lowerCaseQuery) ||
        ticket.id.toLowerCase().includes(lowerCaseQuery)
      );
    } else if (ticket.type === 'PICKUP') {
      const pickup = ticket.object as HotelPickup;
      return (
        pickup.title.toLowerCase().includes(lowerCaseQuery) ||
        pickup.city.toLowerCase().includes(lowerCaseQuery) ||
        ticket.id.toLowerCase().includes(lowerCaseQuery)
      );
    }
    
    return false;
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
      <ScreenHeader title={i18n.t('tickets.title')} onBack={() => navigation.goBack()} />
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={i18n.t('tickets.searchPlaceholder')}
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#c1272d" />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <ScrollView style={styles.ticketsContainer}>
          {filteredTickets.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{i18n.t('tickets.noTickets')}</Text>
            </View>
          ) : (
            filteredTickets.map(ticket => (
              ticket.type === 'MATCH' 
                ? <MatchTicketCard key={ticket.id} ticket={ticket} /> 
                : <PickupTicketCard key={ticket.id} ticket={ticket} />
            ))
          )}
        </ScrollView>
      )}

      <BottomNavBar activeRoute="Tickets" onNavigate={
        (routeName: string) => navigation.navigate(routeName as never)
      } />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF7F7',
  },
  headerContainer: {
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    borderRadius: 25,
    height: 50,
    borderWidth: 1,
    borderColor: '#eee',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  ticketsContainer: {
    flex: 1,
    paddingHorizontal: 15,
    marginBottom: 80,
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
    padding: 20,
  },
  errorText: {
    color: '#c1272d',
    fontSize: 16,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default TicketsScreen;