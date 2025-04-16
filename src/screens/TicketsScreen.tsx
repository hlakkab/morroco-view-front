import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../components/ScreenHeader';
import { useNavigation } from '@react-navigation/native';
import BottomNavBar from '../containers/BottomNavBar';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { fetchTickets } from '../store/ticketSlice';
import { Ticket } from '../types/ticket';
import { Match } from '../types/match';
import { HotelPickup } from '../types/transport';
import MatchTicketCard from '../components/cards/MatchTicketCard';
import PickupTicketCard from '../components/cards/PickupTicketCard';

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
      <ScreenHeader title="Tickets" onBack={() => navigation.goBack()} />
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="search by a reference, match"
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
              <Text style={styles.emptyText}>No tickets found</Text>
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