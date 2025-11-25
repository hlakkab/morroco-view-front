import React from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { CopilotProvider, CopilotStep, walkthroughable } from 'react-native-copilot';
import BottomNavBar from '../containers/BottomNavBar';
import EmergencyContactsButton from '../Emergency/containers/EmergencyContactsButton';
import EventBannerContainer from '../Event/containers/EventBannerContainer';
import ExploreCardsContainer from '../containers/ExploreCardsContainer';
import SearchBarContainer from '../containers/SearchBarContainer';
import ServiceCardsContainer from '../containers/ServiceCardsContainer';
import i18n from '../translations/i18n';
import AuthModal from '../components/AuthModal';
import { useHomeScreen } from '../hooks/useHomeScreen';

// Create walkthroughable components
const WalkthroughableView = walkthroughable(View);

const HomeScreenContent: React.FC = () => {
  const {
    scrollViewRef,
    visible,
    showTourButton,
    showAuthModal,
    setShowAuthModal,
    showFirstTimeModal,
    setShowFirstTimeModal,
    handleMatchesExplore,
    handleCategoryPress,
    handleEmergencyContacts,
    handleNavigation,
    handleStartTour,
    handleFirstTimeComplete,
  } = useHomeScreen();

  return (
    <View style={styles.mainContainer}>
      {/* Tour button commented out as requested */}
      {/*
      {!visible && (
        <TouchableOpacity style={styles.tourButton} onPress={handleStartTour}>
          <Ionicons name="information-circle-outline" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      )}
      */}

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar Section with fixed height */}
        <View style={styles.componentSearchContainer}>
          <CopilotStep
            text={i18n.t('copilot.exploreDestinations')}
            order={1}
            name="search"
          >
            <WalkthroughableView style={styles.searchHighlight}>
              <SearchBarContainer 
                showTour={!visible && showTourButton} 
                onTourPress={handleStartTour} 
              />
            </WalkthroughableView>
          </CopilotStep>
        </View>

        {/* Africa Cup Banner Section with fixed height */}
        <View style={styles.componentContainer}>
          <CopilotStep
            text={i18n.t('copilot.discoverEvents')}
            order={2}
            name="event"
          >
            <WalkthroughableView style={styles.bannerHighlight}>
              <EventBannerContainer onExplore={handleMatchesExplore} />
            </WalkthroughableView>
          </CopilotStep>
        </View>

        {/* Service Icons Section with fixed height */}
        <View style={styles.componentContainer}>
          <CopilotStep
            text={i18n.t('copilot.accessServices')}
            order={3}
            name="services"
          >
            <WalkthroughableView style={styles.servicesHighlight}>
              <ServiceCardsContainer onNavigate={handleNavigation} />
            </WalkthroughableView>
          </CopilotStep>
        </View>

        {/* Explore Morocco Section with fixed height */}
        <View style={styles.componentContainer}>
          <CopilotStep
            text={i18n.t('copilot.discoverCategories')}
            order={4}
            name="explore"
          >
            <WalkthroughableView style={styles.exploreHighlight}>
              <ExploreCardsContainer onCategoryPress={handleCategoryPress} />
            </WalkthroughableView>
          </CopilotStep>
        </View>

        {/* Emergency Contacts Button - Removed from tour */}
        <CopilotStep
          text={i18n.t('copilot.findEmergency')}
          order={5}
          name="emergency"
        >
          <WalkthroughableView style={styles.emergencyHighlight}>
            <View style={styles.emergencyActionsRow}>
              <EmergencyContactsButton onPress={handleEmergencyContacts} />
            
            </View>
          </WalkthroughableView>
        </CopilotStep>
        {/* Add padding at the bottom to ensure content is not hidden behind the nav bar */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      <BottomNavBar activeRoute="Home" onNavigate={handleNavigation} />

      {/* Bottom Navigation Bar */}
      {/* <CopilotStep
        text={i18n.t('copilot.navigateApp')}
        order={6}
        name="navbar"
      >
        <WalkthroughableView style={styles.navbarHighlight}>
          <BottomNavBar activeRoute="Home" onNavigate={handleNavigation} />
        </WalkthroughableView>
      </CopilotStep> */}

      <AuthModal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        type="auth"
      />

      <AuthModal
        visible={showFirstTimeModal}
        onClose={() => setShowFirstTimeModal(false)}
        type="firstTime"
        onFirstTimeComplete={handleFirstTimeComplete}
      />
    </View>
  );
};

const HomeScreen: React.FC = () => {
  return (
    <CopilotProvider
      stepNumberComponent={() => null}
      tooltipStyle={styles.tooltip}
      backdropColor="rgba(0, 0, 0, 0.7)"
      animationDuration={300}
      overlay="svg"
      stopOnOutsideClick={true}
      labels={{
        skip: i18n.t('common.skip'),
        previous: i18n.t('common.previous'),
        next: i18n.t('common.next'),
        finish: i18n.t('common.done')
      }}
      arrowSize={8}
      arrowColor="#FFF7F7"
      verticalOffset={0}
    >
      <HomeScreenContent />
    </CopilotProvider>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#FFF7F7',
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
    marginTop: 30
  },
  bottomPadding: {
    height: 100,
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
    backgroundColor: '#FF6B6B',
    borderRadius: 25,
    paddingVertical: 5,
    paddingHorizontal: 5,
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
    height: 65, 
    
  },
  bannerHighlight: {
    
    paddingBottom: 10

  },
  servicesHighlight: {
    
    paddingBottom: 10

  },
  exploreHighlight: {

  },
  componentSearchContainer: {
  },
  componentContainer: {
  },
  emergencyHighlight: {

  },
  emergencyActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentTestButton: {
    marginLeft: 12,
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  paymentTestText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  navbarHighlight: {

  },
});

export default HomeScreen;