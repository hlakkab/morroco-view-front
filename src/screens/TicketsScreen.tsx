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
import AsyncStorage from '@react-native-async-storage/async-storage';
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

const TOUR_FLAG = '@ticketsTourSeen';

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
  const [hasSeenTour, setHasSeenTour] = useState<boolean | null>(null);

  useEffect(() => {
    dispatch(fetchTickets());
  }, [dispatch]);

  // ─── 1. Lire si le tour a déjà été vu ─────────────────
  useEffect(() => {
    AsyncStorage.getItem(TOUR_FLAG)
      .then(value => {
        console.log('Tour seen status:', value);
        setHasSeenTour(value === 'true');
      })
      .catch(error => {
        console.error('Error reading tour status:', error);
        setHasSeenTour(false);
      });
  }, []);

  // ─── 2. Démarrage automatique une seule fois ──────────
  useEffect(() => {
    console.log('Tour conditions:', {
      hasSeenTour,
      loading,
      tourStarted,
      visible
    });

    if (hasSeenTour === false && !loading && !tourStarted && !visible) {
      console.log('Starting tour automatically...');
      const timer = setTimeout(() => {
        startTour();
        setTourStarted(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [hasSeenTour, loading, startTour, tourStarted, visible]);

  // ─── 3. Enregistrer la fin ou le skip du tour ────────
  useEffect(() => {
    const handleStop = async () => {
      console.log('Tour stopped, saving status...');
      try {
        await AsyncStorage.setItem(TOUR_FLAG, 'true');
        setHasSeenTour(true);
        setTourStarted(false);
        console.log('Tour status saved successfully');
      } catch (error) {
        console.error('Error saving tour status:', error);
      }
    };

    const handleStepChange = (step: any) => {
      console.log('Step changed to:', step);
    };

    copilotEvents.on('stop', handleStop);
    copilotEvents.on('stepChange', handleStepChange);

    return () => {
      copilotEvents.off('stop', handleStop);
      copilotEvents.off('stepChange', handleStepChange);
    };
  }, [copilotEvents]);

  // Add reset function for manual testing
  const handleResetTour = async () => {
    try {
      console.log('Manually resetting tour status...');
      await AsyncStorage.removeItem(TOUR_FLAG);
      setHasSeenTour(false);
      setTourStarted(false);
      console.log('Tour status reset successfully');
      // Start the tour immediately after reset
      startTour();
    } catch (error) {
      console.error('Error resetting tour:', error);
    }
  };

  // Add a button to manually start the tour
  const handleStartTour = () => {
    setTourStarted(true);
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
      <View style={styles.headerContainer}>
        <ScreenHeader 
          title={i18n.t('tickets.title')} 
          onBack={() => navigation.goBack()}
          showTour={!visible}
          onTourPress={handleStartTour}
          showReset={__DEV__}
          onResetPress={handleResetTour}
        />
      </View>

      <CopilotStep
        text={i18n.t('copilot.tickets.search')}
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
          text={i18n.t('copilot.tickets.viewTickets')}
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
        skip: i18n.t('copilot.navigation.skip'),
        previous: i18n.t('copilot.navigation.previous'),
        next: i18n.t('copilot.navigation.next'),
        finish: i18n.t('copilot.navigation.finish')
      }}
      arrowSize={8}
      arrowColor="#FFF7F7"
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
  tooltip: {
    backgroundColor: '#F7F7F7',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#333',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    borderWidth: 4,
    borderColor: '#CE1126',
    width: '85%',
  },
  tourButton: {
    position: 'absolute',
    top: 50,
    right: 16,
    backgroundColor: '#008060',
    borderRadius: 25,
    paddingVertical: 8,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tourButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  searchHighlight: {
    marginBottom: 16,
  },
  ticketsListHighlight: {
    flex: 1,
  },
});

export default TicketsScreen;