import { Feather, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  Modal,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { CopilotProvider, CopilotStep, useCopilot, walkthroughable } from 'react-native-copilot';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import i18n from '../translations/i18n';
import { RootStackParamList, SavedItem } from '../types/navigation';
import { Destination, Tour } from '../types/tour';
import { getFlagUrl } from '../utils/flagResolver';
import { mapTourForDetailsModal } from '../utils/tourMapper';
import { setTourItems, setTourInfo } from '../store/tourSlice';

interface TourDetailsModalProps {
  visible: boolean;
  onClose: () => void;
}

const { width, height } = Dimensions.get('window');

const TOUR_FLAG = '@tourDetailModalSeen';

// Create walkthroughable components
const WalkthroughableView = walkthroughable(View);

const TourDetailsModalContent: React.FC<TourDetailsModalProps> = ({
  visible,
  onClose,
}) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const dispatch = useDispatch();
  const [selectedDay, setSelectedDay] = useState(1);
  const [showDayPicker, setShowDayPicker] = useState(false);
  const { currentTour } = useSelector((state: RootState) => state.tour);
  const { start: startTour, copilotEvents, visible: isCopilotVisible } = useCopilot();
  const [tourStarted, setTourStarted] = useState(false);
  const [hasSeenTour, setHasSeenTour] = useState<boolean | null>(null);

  // Check if tour has been seen before
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

  // Start tour automatically if not seen before
  useEffect(() => {
    if (hasSeenTour === false && !tourStarted && !isCopilotVisible && visible) {
      const timer = setTimeout(() => {
        startTour();
        setTourStarted(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [hasSeenTour, startTour, tourStarted, isCopilotVisible, visible]);

  // Save tour completion status
  useEffect(() => {
    const handleStop = async () => {
      try {
        await AsyncStorage.setItem(TOUR_FLAG, 'true');
        setHasSeenTour(true);
        setTourStarted(false);
      } catch (error) {
        console.error('Error saving tour status:', error);
      }
    };

    copilotEvents.on('stop', handleStop);
    return () => {
      copilotEvents.off('stop', handleStop);
    };
  }, [copilotEvents]);

  // Manual tour start handler
  const handleStartTour = () => {
    setTourStarted(true);
    startTour();
  };

  // Create animated value for drag gesture
  const pan = React.useRef(new Animated.ValueXY()).current;

  // Create pan responder for drag to dismiss
  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        // Only allow downward movement
        if (gestureState.dy > 0) {
          Animated.event([null, { dy: pan.y }], { useNativeDriver: false })(_, gestureState);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          // If dragged down more than 100 units, close the modal
          onClose();
        } else {
          // Otherwise, reset position
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false
          }).start();
        }
      }
    })
  ).current;

  // Reset pan when modal becomes visible
  React.useEffect(() => {
    if (visible) {
      pan.setValue({ x: 0, y: 0 });
    }
  }, [visible, pan]);

  // Generate an array of day numbers based on duration
  

  // Get type icon based on destination type
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'hotel':
        return <Ionicons name="bed" size={16} color="#E91E63" />;
      case 'restaurant':
        return <Ionicons name="restaurant" size={16} color="#4CAF50" />;
      case 'match':
        return <Ionicons name="football" size={16} color="#2196F3" />;
      case 'monument':
        return <Ionicons name="business" size={16} color="#FFA726" />;
      case 'entertainment':
        return <Ionicons name="musical-notes" size={16} color="#FF9800" />;
      default:
        return <Ionicons name="location" size={16} color="#9E9E9E" />;
    }
  };

  // Get real images for the destination types if no imageUrl is provided
  const getDefaultImageForType = (type: string) => {
    switch (type) {
      case 'hotel':
        return 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/223648290.jpg?k=d7042c5905373d5f217992f67cfb1a1a5a5559a0a2ad4b3ce7536e2848a1bc37&o=&hp=1';
      case 'restaurant':
        return 'https://media-cdn.tripadvisor.com/media/photo-p/1c/cc/51/db/koya.jpg';
      case 'match':
        return 'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg';
      case 'entertainment':
        return 'https://images.pexels.com/photos/4062561/pexels-photo-4062561.jpeg';
      default:
        return 'https://images.pexels.com/photos/346885/pexels-photo-346885.jpeg';
    }
  };

  // Handle navigating to timeline preview
  const handleViewTimeline = () => {
    if (!currentTour) return;
    
    const mappedData = mapTourForDetailsModal(currentTour, selectedDay);
    
    // Convert to the format expected by AddNewTourOrganizeScreen
    const selectedItemsByDay: Record<number, string[]> = {};
    const cities: Record<number, string> = {};
    const allSavedItems: SavedItem[] = [];

    Object.entries(mappedData.destinationsByDate).forEach(([date, dayDestinations], index) => {
      const dayNumber = index + 1;
      selectedItemsByDay[dayNumber] = dayDestinations.map(d => d.id);
      cities[dayNumber] = dayDestinations[0]?.city || 'Unknown';
      
      // Add items to savedItems with coordinates
      dayDestinations.forEach(dest => {
        allSavedItems.push({
          ...dest,
          coordinate: dest.coordinate || {
            latitude: Number(dest.coordinates?.split(',')[0]) || 0,
            longitude: Number(dest.coordinates?.split(',')[1]) || 0
          }
        });
      });
    });

    // First set the tour info (title and dates)
    dispatch(setTourInfo({
      title: currentTour.title,
      startDate: currentTour.from,
      endDate: currentTour.to
    }));

    // Then set the tour items
    dispatch(setTourItems({
      tourItems: allSavedItems,
      selectedItemsByDay,
      cities
    }));
    
    onClose();
    // Navigate to the organize screen with only viewMode param
    navigation.navigate('AddNewTourOrganize', { viewMode: true });
  };

  // Handle navigating to map view
  const handleViewMap = () => {
    if (!currentTour) return;
    
    const mappedData = mapTourForDetailsModal(currentTour, selectedDay);

    //console.log('mappedData', mappedData.destinationsByDate);
    
    onClose();
    navigation.navigate('TourMapScreen', mappedData);
  };

  // Select a day and close the picker
  const handleDaySelect = (day: number) => {
    setSelectedDay(day);
    setShowDayPicker(false);
  };

  // Filter destinations based on the selected day (in a real app, this would use day-specific data)
  const destinations = currentTour?.destinations as Destination[] || [];
  

  const dates = Array.from(new Set(destinations.map(d => d.date)));
  const days =  Array.from({ length: dates.length || 1 }, (_, i) => i + 1);

  const filteredDestinations = destinations.filter(d => d.date === dates[selectedDay - 1]);


  // Function to format date as "DD MMM"
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      day: 'numeric',
      month: 'short'
    });
  };

  // Function to format date range
  const formatDateRange = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return '';
    try {
      const start = new Date(startDate.replace(/\//g, '-'));
      const end = new Date(endDate.replace(/\//g, '-'));
      return `${formatDate(start)} - ${formatDate(end)}`;
    } catch (e) {
      console.error("Error formatting date range:", e);
      return `${startDate} - ${endDate}`;
    }
  };

  // Function to get date for a specific day
  const getDateForDay = (day: number) => {
    if (!currentTour?.from) return '';
    const date = new Date(currentTour.from.replace(/\//g, '-'));
    date.setDate(date.getDate() + (day - 1));
    return formatDate(date);
  };

  // Render destination item in list
  const renderDestinationItem = ({ item }: { item: Destination }) => {
    const renderMatchContent = () => {
      const teams = item.title.split(' vs ');
      if (teams.length !== 2) return null;
      
      return (
        <View style={styles.matchContainer}>
          <Image source={{ uri: getFlagUrl(teams[0]) }} style={styles.teamFlag} />
          <Text style={styles.vsText}>VS</Text>
          <Image source={{ uri: getFlagUrl(teams[1]) }} style={styles.teamFlag} />
        </View>
      );
    };

    return (
      <View style={styles.destinationItem}>
        <View style={styles.destinationImageContainer}>
          {item.type === 'match' ? (
            renderMatchContent()
          ) : (item.image || getDefaultImageForType(item.type)) ? (
            <Image 
              source={{ uri: item.image || getDefaultImageForType(item.type) }} 
              style={styles.destinationImage} 
            />
          ) : (
            <View style={[styles.destinationImagePlaceholder, { backgroundColor: '#F5F5F5' }]}>
              {getTypeIcon(item.type)}
            </View>
          )}
        </View>
        <View style={styles.destinationInfo}>
          <View style={styles.destinationTypeContainer}>
            {getTypeIcon(item.type)}
            <Text style={styles.destinationType}>
              {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
            </Text>
          </View>
          <Text style={styles.destinationTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.destinationCity}>{item.city}</Text>
        </View>
      </View>
    );
  };

  // Render each day option in the dropdown
  const renderDayOption = ({ item }: { item: number }) => (
    <TouchableOpacity 
      style={styles.dayOption}
      onPress={() => handleDaySelect(item)}
    >
      <Text style={styles.dayOptionText}>{getDateForDay(item)}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <Animated.View
          style={[
            styles.modalView,
            { transform: [{ translateY: pan.y }] }
          ]}
        >
          {/* White header with drag handle */}
          <View style={styles.headerContainer} {...panResponder.panHandlers}>
            <View style={styles.dragHandleContainer}>
              <View style={styles.dragHandle} />
            </View>

            <View style={styles.modalHeader}>
              <View style={styles.titleContainer}>
                <Text style={styles.modalTitle} numberOfLines={1} ellipsizeMode="tail">
                  {currentTour?.title || ''}
                </Text>
              </View>
              <View style={styles.headerButtons}>
                {!isCopilotVisible && (
                  <TouchableOpacity style={styles.tourButton} onPress={handleStartTour}>
                    <Ionicons name="information-circle-outline" size={16} color="#FFF" />
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close" size={16} color="black" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.modalContent}>
            {/* Tour info */}
            <CopilotStep
              text={i18n.t('copilot.tourInfo').replace('{destinations}', destinations.length.toString()).replace('{days}', days.length.toString())}
              order={1}
              name="tourInfo"
            >
              <WalkthroughableView style={styles.tourInfoContainer}>
                <View style={styles.tourInfoItem}>
                  <Feather name="map-pin" size={16} color="#E53935" style={styles.infoIcon} />
                  <Text style={styles.infoText}>{destinations.length} {i18n.t('tours.destinations')}</Text>
                </View>
                <View style={styles.tourInfoDivider} />
                <View style={styles.tourInfoItem}>
                  <Feather name="calendar" size={16} color="#E53935" style={styles.infoIcon} />
                  <Text style={styles.infoText}>{days.length} {days.length === 1 ? i18n.t('tours.day') : i18n.t('tours.days')}</Text>
                </View>
                <View style={styles.tourInfoDivider} />
                <View style={styles.tourInfoItem}>
                  <Feather name="clock" size={16} color="#E53935" style={styles.infoIcon} />
                  <Text style={styles.infoText}>
                    {formatDateRange(currentTour?.from || '', currentTour?.to || '')}
                  </Text>
                </View>
              </WalkthroughableView>
            </CopilotStep>

            {/* Day selector header */}
            <CopilotStep
              text={i18n.t('copilot.daySelector')}
              order={2}
              name="daySelector"
            >
              <WalkthroughableView style={styles.destinationsHeader}>
                <Text style={styles.sectionTitle}>{i18n.t('tours.selectedDestinations')}</Text>
                
                {/* Day Selector Dropdown */}
                <View style={styles.dayDropdownContainer}>
                  <TouchableOpacity 
                    style={styles.dayDropdown}
                    onPress={() => setShowDayPicker(!showDayPicker)}
                  >
                    <Text style={styles.dayDropdownText}>{getDateForDay(selectedDay)}</Text>
                    <Feather 
                      name={showDayPicker ? "chevron-up" : "chevron-down"} 
                      size={16} 
                      color="#666" 
                    />
                  </TouchableOpacity>
                  
                  {/* Day Picker Dropdown */}
                  {showDayPicker && (
                    <View style={styles.dayPickerContainer}>
                      <FlatList
                        data={days}
                        renderItem={renderDayOption}
                        keyExtractor={(item) => `day-${item}`}
                        style={styles.dayPickerList}
                      />
                    </View>
                  )}
                </View>
              </WalkthroughableView>
            </CopilotStep>

            {/* Destinations list */}
            <CopilotStep
              text={i18n.t('copilot.destinations')}
              order={3}
              name="destinations"
            >
              <WalkthroughableView style={{ flex: 1 }}>
                <FlatList
                  data={filteredDestinations}
                  renderItem={renderDestinationItem}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={styles.destinationsList}
                  showsVerticalScrollIndicator={false}
                  ListEmptyComponent={
                    <View style={styles.emptyListContainer}>
                      <Ionicons name="location-outline" size={48} color="#E0E0E0" />
                      <Text style={styles.emptyListText}>{i18n.t('tours.noDestinationsForDay')}</Text>
                    </View>
                  }
                />
              </WalkthroughableView>
            </CopilotStep>

            {/* Preview buttons */}
            <CopilotStep
              text={i18n.t('copilot.viewMapButton')}
              order={4}
              name="viewMap"
            >
              <WalkthroughableView>
                <TouchableOpacity
                  style={styles.mapButton}
                  onPress={handleViewMap}
                >
                  <Feather name="map" size={20} style={styles.buttonIcon} />
                  <Text style={styles.mapButtonText}>{i18n.t('tours.viewOnMap')}</Text>
                </TouchableOpacity>
              </WalkthroughableView>
            </CopilotStep>

            <CopilotStep
              text={i18n.t('copilot.viewTimelineButton')}
              order={5}
              name="viewTimeline"
            >
              <WalkthroughableView>
                <TouchableOpacity
                  style={styles.previewButton}
                  onPress={handleViewTimeline}
                >
                  <Text style={styles.previewButtonText}>{i18n.t('tours.previewTimeline')}</Text>
                </TouchableOpacity>
              </WalkthroughableView>
            </CopilotStep>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

// Main component with CopilotProvider
const TourDetailsModal: React.FC<TourDetailsModalProps> = (props) => {
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
      androidStatusBarVisible={true}
    >
      <TourDetailsModalContent {...props} />
    </CopilotProvider>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  headerContainer: {
    backgroundColor: 'white',
    width: '100%',
    paddingTop: 12,
    paddingBottom: 12,
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingBottom: 10,
  },
  dragHandle: {
    width: 100,
    height: 5,
    backgroundColor: '#D3D3D3',
    borderRadius: 2.5,
  },
  modalView: {
    backgroundColor: '#FFF7F7',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '100%',
    height: height * 0.8, // Take up 80% of screen height
  },
  modalHeader: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  titleContainer: {
    flex: 1,
    marginRight: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D3D3D3',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  modalContent: {
    flex: 1,
    width: '100%',
    padding: 20,
  },
  tourInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tourInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tourInfoDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E0E0E0',
  },
  infoIcon: {
    marginRight: 6,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  destinationsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  dayDropdownContainer: {
    position: 'relative',
  },
  dayDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dayDropdownText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginRight: 8,
  },
  dayPickerContainer: {
    position: 'absolute',
    top: 40,
    right: 0,
    width: 120,
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
  },
  dayPickerList: {
    maxHeight: 200,
  },
  dayOption: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dayOptionText: {
    fontSize: 14,
    color: '#666',
  },
  destinationsList: {
    paddingBottom: 16,
  },
  destinationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  destinationImageContainer: {
    width: 100,
    height: 75,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 12,
  },
  destinationImage: {
    width: '100%',
    height: '100%',
  },
  destinationImagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  destinationInfo: {
    flex: 1,
  },
  destinationTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  destinationType: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  destinationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  destinationCity: {
    fontSize: 12,
    color: '#666',
  },
  emptyListContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyListText: {
    fontSize: 14,
    color: '#999',
    marginTop: 12,
  },
  previewButton: {
    backgroundColor: '#E53935',
    paddingVertical: 14,
    borderRadius: 50,
    alignItems: 'center',
    marginTop: 8,
  },
  previewButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  mapButton: {
    borderRadius: 50,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  mapButtonText: {
    color: '#AE1913',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 8,
    color: '#AE1913',
  },
  matchContainer: {
    width: 100,
    height: 75,
    borderRadius: 8,
    backgroundColor: "#F6FAFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginRight: 10,

  },
  teamFlag: {
    width: 32,
    height: 24,
    borderRadius: 5,
  },
  vsText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#555",
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tourButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF6B6B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
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
});

export default TourDetailsModal; 