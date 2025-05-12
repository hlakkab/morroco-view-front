import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { CopilotProvider, CopilotStep, useCopilot, walkthroughable } from 'react-native-copilot';
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

// Create walkthroughable components
const WalkthroughableView = walkthroughable(View);

// Content component with Copilot functionality
const TicketsScreenContent: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { tickets, loading, error } = useSelector((state: RootState) => state.ticket);
  const [searchQuery, setSearchQuery] = React.useState('');
  const { start: startTour, copilotEvents, visible } = useCopilot();
  const [tourStarted, setTourStarted] = useState(false);

  useEffect(() => {
    dispatch(fetchTickets());
  }, [dispatch]);

  // Start the Copilot tour when the component mounts
  useEffect(() => {
    if (!tourStarted) {
      const timer = setTimeout(() => {
        startTour();
        setTourStarted(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [startTour, tourStarted]);

  // Handle Copilot events
  useEffect(() => {
    const handleStop = () => {
      console.log('Tour completed or stopped');
    };
    
    copilotEvents.on('stop', handleStop);
    
    return () => {
      copilotEvents.off('stop', handleStop);
    };
  }, [copilotEvents]);

  // Add a button to manually start the tour
  const handleStartTour = () => {
    startTour();
  };

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
      {/* Manual tour button */}
      {!visible && (
        <TouchableOpacity style={styles.tourButton} onPress={handleStartTour}>
          <Ionicons name="information-circle-outline" size={20} color="#FFFFFF" />
          <Text style={styles.tourButtonText}>Tour Guide</Text>
        </TouchableOpacity>
      )}

      <View style={styles.headerContainer}>
        <ScreenHeader title={i18n.t('tickets.title')} onBack={() => navigation.goBack()} />
      </View>

      <CopilotStep
        text="Search for your tickets by team name, stadium, or ticket ID"
        order={1}
        name="search"
      >
        <WalkthroughableView style={styles.searchHighlight}>
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
        </WalkthroughableView>
      </CopilotStep>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#c1272d" />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <CopilotStep
          text="View and manage your match and transport tickets"
          order={2}
          name="ticketsList"
        >
          <WalkthroughableView style={styles.ticketsListHighlight}>
            <ScrollView style={styles.ticketsContainer}>
              {filteredTickets.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>{i18n.t('tickets.noTickets')}</Text>
                </View>
              ) : (
                filteredTickets.filter(ticket => ticket.type !== 'E_SIM').map(ticket => (
                  ticket.type === 'MATCH' 
                    ? <MatchTicketCard key={ticket.id} ticket={ticket} /> 
                    : <PickupTicketCard key={ticket.id} ticket={ticket} />
                ))
              )}
            </ScrollView>
          </WalkthroughableView>
        </CopilotStep>
      )}

      <BottomNavBar activeRoute="Tickets" onNavigate={
        (routeName: string) => navigation.navigate(routeName as never)
      } />
    </SafeAreaView>
  );
};

// Main component with CopilotProvider
const TicketsScreen: React.FC = () => {
  return (
    <CopilotProvider
      stepNumberComponent={() => null}
      tooltipStyle={styles.tooltip}
      backdropColor="rgba(0, 0, 0, 0.7)"
      animationDuration={300}
      overlay="svg"
      stopOnOutsideClick={true}
      labels={{
        skip: "Skip",
        previous: "Previous",
        next: "Next",
        finish: "Done"
      }}
    >
      <TicketsScreenContent />
    </CopilotProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF7F7',
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 0 : 40,
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
  tourButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 20 : 40,
    right: 16,
    backgroundColor: '#CE1126',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1000,
  },
  tourButtonText: {
    color: '#FFFFFF',
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '600',
  },
  tooltip: {
    backgroundColor: '#CE1126',
    borderRadius: 8,
    padding: 12,
  },
  searchHighlight: {
    marginBottom: 16,
  },
  ticketsListHighlight: {
    flex: 1,
  },
});

export default TicketsScreen;