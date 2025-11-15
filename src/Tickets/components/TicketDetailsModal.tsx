import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import React, { useEffect } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  ActivityIndicator
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ticket, PickupTicketObject, PickupTicketDetailObject, MatchTicketObject } from '../types/ticket';
import { AppDispatch, RootState } from '../../store/store';
import { fetchTicketById, clearSelectedTicket, clearDetailError } from '../store/ticketSlice';
import { getFlagUrl } from '../../utils/flagResolver';

interface TicketDetailsModalProps {
  visible: boolean;
  ticket: Ticket;
  onClose: () => void;
}

const TicketDetailsModal: React.FC<TicketDetailsModalProps> = ({
  visible,
  ticket,
  onClose
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { selectedTicket, loadingDetail, errorDetail } = useSelector((state: RootState) => state.ticket);
  
  // Fetch ticket details when modal opens
  useEffect(() => {
    if (visible && ticket.id) {
      dispatch(fetchTicketById(ticket.id));
    } else if (!visible) {
      dispatch(clearSelectedTicket());
    }
  }, [visible, ticket.id, dispatch]);

  // Use fetched ticket details if available, otherwise use passed ticket
  const displayTicket = selectedTicket || ticket;

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

  // Helper function to safely format dates
  const safeFormatDate = (dateString: string | undefined | null, formatString: string, fallback: string = 'N/A'): string => {
    if (!dateString) return fallback;
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return fallback;
      }
      return format(date, formatString);
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return fallback;
    }
  };

  const formattedCreatedAt = safeFormatDate(displayTicket.createdAt, 'MMM dd, yyyy h:mm a', 'N/A');
  const formattedUpdatedAt = safeFormatDate(displayTicket.updatedAt, 'MMM dd, yyyy h:mm a', 'N/A');

  const renderMatchDetails = () => {
    const match = displayTicket.object as MatchTicketObject;
    const formattedDate = safeFormatDate(match?.date, 'EEEE, MMMM dd, yyyy', 'Date not available');
    const formattedTime = safeFormatDate(match?.date, 'h:mm a', 'Time not available');

    return (
      <>
        {/* Match Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Match Information</Text>
          
          <View style={styles.teamsContainer}>
            {match?.homeTeam && (
              <View style={styles.teamContainer}>
                <Image
                  source={{ uri: getFlagUrl(match.homeTeam) }}
                  style={styles.flag}
                />
                <Text style={styles.teamName}>{match.homeTeam}</Text>
              </View>
            )}
            
            <Text style={styles.vsText}>VS</Text>
            
            {match?.awayTeam && (
              <View style={styles.teamContainer}>
                <Image
                  source={{ uri: getFlagUrl(match.awayTeam) }}
                  style={styles.flag}
                />
                <Text style={styles.teamName}>{match.awayTeam}</Text>
              </View>
            )}
          </View>

          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Ionicons name="calendar-outline" size={16} color="#c1272d" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Date</Text>
                <Text style={styles.detailValue} numberOfLines={2}>{formattedDate}</Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <Ionicons name="time-outline" size={16} color="#c1272d" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Time</Text>
                <Text style={styles.detailValue}>{formattedTime}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Stadium Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Stadium Information</Text>
          
          <View style={styles.detailsGrid}>
            {match?.spot && (
              <>
                <View style={styles.detailItem}>
                  <Ionicons name="location-outline" size={16} color="#c1272d" />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Stadium</Text>
                    <Text style={styles.detailValue} numberOfLines={2}>{match.spot.name || 'N/A'}</Text>
                  </View>
                </View>

                <View style={styles.detailItem}>
                  <Ionicons name="business-outline" size={16} color="#c1272d" />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>City</Text>
                    <Text style={styles.detailValue}>{match.spot.city || 'N/A'}</Text>
                  </View>
                </View>

                {match.spot.description && (
                  <View style={styles.detailItem}>
                    <Ionicons name="information-circle-outline" size={16} color="#c1272d" />
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Description</Text>
                      <Text style={styles.detailValue} numberOfLines={3}>{match.spot.description}</Text>
                    </View>
                  </View>
                )}

                {match.spot.address && (
                  <View style={styles.detailItem}>
                    <Ionicons name="map-outline" size={16} color="#c1272d" />
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Address</Text>
                      <Text style={styles.detailValue} numberOfLines={2}>{match.spot.address}</Text>
                    </View>
                  </View>
                )}

                {match.spot.code && (
                  <View style={styles.detailItem}>
                    <Ionicons name="barcode-outline" size={16} color="#c1272d" />
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Code</Text>
                      <Text style={styles.detailValue}>{match.spot.code}</Text>
                    </View>
                  </View>
                )}
              </>
            )}
          </View>
        </View>
      </>
    );
  };

  const renderPickupDetails = () => {
    const objectData = displayTicket.object as any;
    
    // Check if it's the detail endpoint structure (has pickup and reservation)
    const isDetailStructure = objectData?.pickup && objectData?.reservation;
    
    if (isDetailStructure) {
      // Detail endpoint structure
      const detailData = objectData as PickupTicketDetailObject;
      const { pickup, reservation } = detailData;
      
      const formattedDate = safeFormatDate(reservation?.date, 'EEEE, MMMM dd, yyyy', 'Date not available');
      const formattedTime = reservation?.time || 'N/A';

      return (
        <>
          {/* Pickup Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pickup Information</Text>
            
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Ionicons name="car-outline" size={16} color="#c1272d" />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Service</Text>
                  <Text style={styles.detailValue} numberOfLines={2}>{pickup?.title || 'N/A'}</Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <Ionicons name="location-outline" size={16} color="#c1272d" />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>City</Text>
                  <Text style={styles.detailValue}>{pickup?.city || 'N/A'}</Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <Ionicons name="cash-outline" size={16} color="#c1272d" />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Price</Text>
                  <Text style={styles.detailValue}>{pickup?.price ? pickup.price.toFixed(2) : (displayTicket.price ? displayTicket.price.toFixed(2) : '0.00')} DH</Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <Ionicons name="people-outline" size={16} color="#c1272d" />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Type</Text>
                  <Text style={styles.detailValue}>{pickup?.isPrivate ? 'Private' : 'Shared'}</Text>
                </View>
              </View>

              {pickup?.model && (
                <View style={styles.detailItem}>
                  <Ionicons name="car-sport-outline" size={16} color="#c1272d" />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Model</Text>
                    <Text style={styles.detailValue}>{pickup.model}</Text>
                  </View>
                </View>
              )}

              {pickup?.immId && (
                <View style={styles.detailItem}>
                  <Ionicons name="document-text-outline" size={16} color="#c1272d" />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>License Plate</Text>
                    <Text style={styles.detailValue}>{pickup.immId}</Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Reservation Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reservation Information</Text>
            
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Ionicons name="calendar-outline" size={16} color="#c1272d" />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Date</Text>
                  <Text style={styles.detailValue} numberOfLines={2}>{formattedDate}</Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <Ionicons name="time-outline" size={16} color="#c1272d" />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Time</Text>
                  <Text style={styles.detailValue}>{formattedTime}</Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <Ionicons name="location-outline" size={16} color="#c1272d" />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Destination City</Text>
                  <Text style={styles.detailValue}>{reservation?.place?.city || 'N/A'}</Text>
                </View>
              </View>

              {reservation?.place?.destination && (
                <View style={styles.detailItem}>
                  <Ionicons name="map-outline" size={16} color="#c1272d" />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Coordinates</Text>
                    <Text style={styles.detailValue} numberOfLines={1}>
                      {reservation.place.destination[0].toFixed(4)}, {reservation.place.destination[1].toFixed(4)}
                    </Text>
                  </View>
                </View>
              )}

              {reservation?.id && (
                <View style={styles.detailItemFullWidth}>
                  <Ionicons name="document-outline" size={16} color="#c1272d" />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Reservation ID</Text>
                    <Text style={styles.detailValue} numberOfLines={1}>{reservation.id}</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        </>
      );
    } else {
      // List endpoint structure (simplified)
      const listData = objectData as PickupTicketObject;
      const formattedDate = safeFormatDate(listData?.date, 'EEEE, MMMM dd, yyyy', 'Date not available');
      const formattedTime = safeFormatDate(listData?.date, 'h:mm a', 'Time not available');

      return (
        <>
          {/* Pickup Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pickup Information</Text>
            
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Ionicons name="car-outline" size={16} color="#c1272d" />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Service</Text>
                  <Text style={styles.detailValue} numberOfLines={2}>{listData?.title || 'N/A'}</Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <Ionicons name="location-outline" size={16} color="#c1272d" />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>City</Text>
                  <Text style={styles.detailValue}>{listData?.city || 'N/A'}</Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <Ionicons name="calendar-outline" size={16} color="#c1272d" />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Date</Text>
                  <Text style={styles.detailValue} numberOfLines={2}>{formattedDate}</Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <Ionicons name="time-outline" size={16} color="#c1272d" />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Time</Text>
                  <Text style={styles.detailValue}>{formattedTime}</Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <Ionicons name="cash-outline" size={16} color="#c1272d" />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Price</Text>
                  <Text style={styles.detailValue}>{listData?.price ? listData.price.toFixed(2) : (displayTicket.price ? displayTicket.price.toFixed(2) : '0.00')} DH</Text>
                </View>
              </View>

              {listData?.location && (
                <View style={styles.detailItem}>
                  <Ionicons name="map-outline" size={16} color="#c1272d" />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Location</Text>
                    <Text style={styles.detailValue} numberOfLines={1}>
                      {listData.location[0].toFixed(4)}, {listData.location[1].toFixed(4)}
                    </Text>
                  </View>
                </View>
              )}

              {listData?.id && (
                <View style={styles.detailItemFullWidth}>
                  <Ionicons name="document-outline" size={16} color="#c1272d" />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Reservation ID</Text>
                    <Text style={styles.detailValue} numberOfLines={1}>{listData.id}</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        </>
      );
    }
  };

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
                  Ticket Details
                </Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={16} color="black" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {loadingDetail ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#c1272d" />
                <Text style={styles.loadingText}>Loading ticket details...</Text>
              </View>
            ) : errorDetail ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={50} color="#c1272d" />
                <Text style={styles.errorText}>{errorDetail}</Text>
              </View>
            ) : (
              <>
                {displayTicket.type === 'MATCH' ? renderMatchDetails() : displayTicket.type === 'PICKUP' ? renderPickupDetails() : null}
              </>
            )}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  headerContainer: {
    backgroundColor: 'white',
    width: '100%',
    paddingTop: 8,
    paddingBottom: 8,
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingBottom: 6,
  },
  dragHandle: {
    width: 100,
    height: 5,
    backgroundColor: '#D3D3D3',
    borderRadius: 2.5,
  },
  modalView: {
    backgroundColor: '#FFF7F7',
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
    paddingHorizontal: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
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
    padding: 12,
  },
  section: {
    marginBottom: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#c1272d',
    paddingBottom: 6,
  },
  teamsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 8,
    paddingVertical: 8,
    backgroundColor: '#f8f8f8',
    borderRadius: 6,
  },
  teamContainer: {
    alignItems: 'center',
    flex: 1,
  },
  flag: {
    width: 50,
    height: 35,
    borderRadius: 4,
    marginBottom: 6,
    borderWidth: 0.5,
    borderColor: '#ddd',
  },
  teamName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  vsText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#c1272d',
    marginHorizontal: 12,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '48%',
    marginBottom: 10,
    marginRight: '2%',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailItemFullWidth: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailContent: {
    flex: 1,
    marginLeft: 8,
  },
  detailLabel: {
    fontSize: 10,
    color: '#666',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  detailValue: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
    lineHeight: 18,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 50,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 50,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#c1272d',
    textAlign: 'center',
  },
});

export default TicketDetailsModal;

