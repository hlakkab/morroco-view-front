import React, { FC, useState } from "react";
import { format } from "date-fns";
import { Ticket } from "../../Tickets/types/ticket";
import { HotelPickup } from "../types/transport";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import TicketDetailsModal from "../../Tickets/components/TicketDetailsModal";

type PickupTicketCardProps = {
    ticket: Ticket 
}

const PickupTicketCard: FC<PickupTicketCardProps> = ({ticket}) => {
    const [detailsModalVisible, setDetailsModalVisible] = useState(false);
    const pickup = ticket.object as HotelPickup & {date: string};
    // For demonstration purposes, using a placeholder date

    // Safe date parsing with fallback
    const safeFormatDate = (dateString: string | undefined | null, formatString: string, fallback: string = ''): string => {
        if (!dateString) return fallback;
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return fallback;
            }
            return format(date, formatString);
        } catch (error) {
            return fallback;
        }
    };

    const month = safeFormatDate(pickup.date, 'MMM', '---').toUpperCase();
    const day = safeFormatDate(pickup.date, 'dd', '--');

    const handleShowDetails = () => {
        setDetailsModalVisible(true);
    };

    const handleCloseDetailsModal = () => {
        setDetailsModalVisible(false);
    };

    return (
      <>
        <View style={styles.ticketCard} key={ticket.id}>
          <View style={[styles.dateContainer, styles.pickupDateContainer]}>
            <Text style={styles.monthText}>{month}</Text>
            <Text style={styles.dayText}>{day}</Text>
            <Text style={styles.timeText}>Hotel{'\n'}Pickup</Text>
          </View>

          <View style={styles.matchContainer}>
            
            <View style={styles.pickupInfo}>
              <Text style={styles.pickupTitle}>{pickup.title}</Text>
              <Text style={styles.pickupCity}>{pickup.city}</Text>
              
              <View style={styles.pickupDetails}>
                <Text style={styles.pickupPrice}>${pickup.price}</Text>
                <Text style={styles.pickupType}>{pickup.private ? 'Private' : 'Shared'}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.qrButton} onPress={handleShowDetails}>
              <Text style={styles.qrButtonText}>Show QR Code</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Ticket Details Modal */}
        <TicketDetailsModal
          visible={detailsModalVisible}
          ticket={ticket}
          onClose={handleCloseDetailsModal}
        />
      </>
    );
};

const styles = StyleSheet.create({
  ticketCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 15,
    flexDirection: 'row',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  dateContainer: {
    backgroundColor: '#fff',
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: 70,
    borderRightWidth: 3,
    borderStyle: 'dashed',
    borderRightColor: '#f0f0f0',
  },
  pickupDateContainer: {
    backgroundColor: '#f8f8ff',
  },
  monthText: {
    color: '#c1272d',
    fontWeight: 'bold',
    fontSize: 14,
  },
  dayText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  timeText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#666',
  },
  matchContainer: {
    flex: 1,
    padding: 15,
  },
  ticketId: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  pickupInfo: {
    marginVertical: 0,
  },
  pickupTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  pickupCity: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  pickupDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  pickupPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#006847',
  },
  pickupType: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  qrButton: {
    backgroundColor: '#c1272d',
    borderRadius: 5,
    padding: 8,
    alignItems: 'center',
    marginTop: 10,
    alignSelf: 'flex-end',
    width: 120,
  },
  qrButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default PickupTicketCard; 