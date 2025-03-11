import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

interface MatchCardProps {
  match: {
    id: string;
    status: string;
    team1Image: string;
    team2Image: string;
    teams: string;
    date: string;
  };
  onPress?: () => void;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <View style={styles.card}>
        <View style={styles.contentContainer}>
          {/* Image des équipes 
          <Image source={{ uri: match.image }} style={styles.matchImage} /> */}

<View style={styles.teamImagesContainer}>
  <Image source={{ uri: match.team1Image }} style={styles.teamImage} />
  <Text style={styles.vsText}>VS</Text>
  <Image source={{ uri: match.team2Image }} style={styles.teamImage} />
</View>


          {/* Détails du match */}
          <View style={styles.detailsContainer}>
            <View style={styles.statusContainer}>
              <Text style={styles.statusText}>{match.status}</Text>
            </View>
            <Text style={styles.teamsText}>{match.teams}</Text>
            <Text style={styles.matchDetails}>{match.date}</Text>
          </View>
          {/* Bouton de sauvegarde */}
          <TouchableOpacity style={styles.saveButton}>
            <FontAwesome name="bookmark-o" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};


const styles = StyleSheet.create({
  card: {
    width: 351,
    minHeight: 99,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    padding: 12,
    marginVertical: 6,
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  teamImage: {
    width: 101,
    height: 70,
    borderRadius: 10,
  },
  teamImagesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vsText: {
    marginHorizontal: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  detailsContainer: {
    flex: 1,
    justifyContent: "center",
    marginHorizontal: 8,
  },
  statusContainer: {
    backgroundColor: "#F6FAFF",
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 12,
    alignSelf: "flex-start",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#000",
  },
  teamsText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
    marginTop: 4,
  },
  matchDetails: {
    fontSize: 10,
    fontWeight: "300",
    color: "#000",
    marginTop: 5,
  },
  saveButton: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 17,
  },
});

export default MatchCard;