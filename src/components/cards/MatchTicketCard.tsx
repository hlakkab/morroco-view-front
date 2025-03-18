import React, { FC, useState } from "react";
import { format } from "date-fns";
import { Match } from "../../types/match";
import { Ticket } from "../../types/ticket";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import QRCodeModal from "../QRCodeModal";

type MatchTicketCardProps = {
  ticket: Ticket
}

const MatchTicketCard: FC<MatchTicketCardProps> = ({ ticket }) => {
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const match = ticket.object as Match;
  const date = new Date(match.date);
  const month = format(date, 'MMM').toUpperCase();
  const day = format(date, 'dd');
  const time = format(date, 'h:mma');

  const flag = (team: string) => {
    team = team.toLowerCase().replace(/ /g, '-');
    return `https://www.countryflags.com/wp-content/uploads/${team}-flag-png-large.png`;
  };

  const handleShowQRCode = () => {
    setQrModalVisible(true);
  };

  const handleCloseQRModal = () => {
    setQrModalVisible(false);
  };

  return (
    <>
      <View style={styles.ticketCard} key={ticket.id}>
        <View style={styles.dateContainer}>
          <Text style={styles.monthText}>{month}</Text>
          <Text style={styles.dayText}>{day}</Text>
          <Text style={styles.timeText}>Start at{'\n'}{time}</Text>
        </View>

        <View style={styles.matchContainer}>

          <View style={styles.matchInfo}>
            <View style={styles.teamsContainer}>
              <View style={styles.flagContainer}>
                <Image
                  source={{ uri: flag(match.homeTeam) }}
                  style={styles.flag} />
              </View>

              <Text style={styles.vsText}>Vs.</Text>

              <View style={styles.flagContainer}>
                <Image
                  source={{ uri: flag(match.awayTeam) }}
                  style={styles.flag} />
              </View>
            </View>

          </View>

          <Text style={styles.matchText}>{match.homeTeam} Vs. {match.awayTeam}</Text>

          <View style={styles.stadiumInfo}>
            <Text style={styles.stadiumLabel}>Stadium</Text>
            <Text style={styles.stadiumName}>{match.spot.name}</Text>
          </View>

          <TouchableOpacity style={styles.qrButton} onPress={handleShowQRCode}>
            <Text style={styles.qrButtonText}>Show QR Code</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* QR Code Modal */}
      <QRCodeModal
        visible={qrModalVisible}
        title={`${match.homeTeam} Vs. ${match.awayTeam}`}
        onClose={handleCloseQRModal}
        data={ticket.id}
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
  matchInfo: {
    flex: 1,
    gap: 15,
    flexDirection: 'row',
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
  teamsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 3,
  },
  flagContainer: {
    width:  45,
    height: 30,
    borderRadius: 3,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: '#ddd',
  },
  flag: {
    width: '100%',
    height: '100%',
  },
  vsText: {
    marginHorizontal: 10,
    fontSize: 16,
    color: '#666',
    fontWeight: 'bold',
  },
  matchText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  stadiumInfo: {
    marginTop: 5,
  },
  stadiumLabel: {
    fontSize: 12,
    color: '#666',
  },
  stadiumName: {
    fontSize: 14,
    color: '#006847',
    fontWeight: 'bold',
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

export default MatchTicketCard;