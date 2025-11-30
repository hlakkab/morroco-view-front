import React, { FC, useState } from "react";
import { format } from "date-fns";
import { Ticket, EntertainmentTicketObject } from "../types/ticket";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import TicketDetailsModal from "./TicketDetailsModal";
import { Ionicons } from "@expo/vector-icons";

type EntertainmentTicketCardProps = {
  ticket: Ticket;
};

const EntertainmentTicketCard: FC<EntertainmentTicketCardProps> = ({ ticket }) => {
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);

  // Safety check: ensure ticket type is ENTERTAINMENT
  if (ticket.type !== "ENTERTAINMENT") {
    return null;
  }

  // Use empty object as fallback if object is missing
  const entertainmentData = (ticket.object || {}) as EntertainmentTicketObject;

  // Safe date parsing with fallback
  const safeFormatDate = (
    dateString: string | undefined | null,
    formatString: string,
    fallback: string = ""
  ): string => {
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

  // Combine date and time for reservation
  const reservationDate = entertainmentData?.reservation?.date;
  const reservationTime = entertainmentData?.reservation?.time;
  let combinedDateTime: Date | null = null;

  if (reservationDate && reservationTime) {
    try {
      // Parse time (format: "14:30:00" or "14:30")
      const timeParts = reservationTime.split(":");
      const hours = parseInt(timeParts[0], 10);
      const minutes = parseInt(timeParts[1], 10);

      // Parse date and set time
      const date = new Date(reservationDate);
      date.setHours(hours, minutes, 0, 0);
      combinedDateTime = date;
    } catch (error) {
      console.error("Error parsing reservation date/time:", error);
    }
  }

  const month = combinedDateTime
    ? safeFormatDate(combinedDateTime.toISOString(), "MMM", "---").toUpperCase()
    : safeFormatDate(reservationDate, "MMM", "---").toUpperCase();
  const day = combinedDateTime
    ? safeFormatDate(combinedDateTime.toISOString(), "dd", "--")
    : safeFormatDate(reservationDate, "dd", "--");
  const formattedTime = combinedDateTime
    ? safeFormatDate(combinedDateTime.toISOString(), "h:mm a", "Time not available")
    : reservationTime
    ? reservationTime.substring(0, 5)
    : "Time not available";

  const handleShowDetails = () => {
    setDetailsModalVisible(true);
  };

  const handleCloseDetailsModal = () => {
    setDetailsModalVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        style={styles.ticketCard}
        key={ticket.id}
        onPress={handleShowDetails}
        activeOpacity={0.7}
      >
        <View style={[styles.dateContainer, styles.entertainmentDateContainer]}>
          <Text style={styles.monthText}>{month}</Text>
          <Text style={styles.dayText}>{day}</Text>
          <Text style={styles.timeText}>{formattedTime}</Text>
        </View>

        <View style={styles.entertainmentContainer}>
          <View style={styles.entertainmentInfo}>
            <Text style={styles.entertainmentTitle}>
              {entertainmentData?.name || "Entertainment"}
            </Text>

            {entertainmentData?.city && (
              <Text style={styles.entertainmentAddress}>{entertainmentData.city}</Text>
            )}

            <View style={styles.priceContainer}>
              <Text style={styles.priceText}>
                {ticket.price % 1 === 0
                  ? ticket.price.toString()
                  : ticket.price.toFixed(2)}{" "}
                MAD
              </Text>
              <Text style={styles.entertainmentType}>Entertainment</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>

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
    backgroundColor: "#fff",
    borderRadius: 15,
    marginBottom: 15,
    flexDirection: "row",
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  dateContainer: {
    backgroundColor: "#fff",
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    width: 70,
    borderRightWidth: 3,
    borderStyle: "dashed",
    borderRightColor: "#f0f0f0",
  },
  entertainmentDateContainer: {
    backgroundColor: "#f8f8ff",
  },
  monthText: {
    color: "#AE1913",
    fontWeight: "bold",
    fontSize: 14,
  },
  dayText: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 5,
  },
  timeText: {
    fontSize: 12,
    textAlign: "center",
    color: "#666",
  },
  entertainmentContainer: {
    flex: 1,
    padding: 15,
  },
  entertainmentInfo: {
    marginVertical: 0,
  },
  entertainmentTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  entertainmentAddress: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
    marginBottom: 10,
  },
  priceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  priceText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#006847",
  },
  entertainmentType: {
    fontSize: 14,
    color: "#666",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
});

export default EntertainmentTicketCard;

