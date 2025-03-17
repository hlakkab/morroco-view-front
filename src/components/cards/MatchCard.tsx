import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { Match } from "../../types/match";

interface MatchCardProps {
  match: Match;
  handleCardPress?: () => void;
  handleSaveMatch?: () => void;
}

const MatchCard: React.FC<MatchCardProps> = ({
  match,
  handleCardPress,
  handleSaveMatch
}) => {
  const isSaved = match.saved


  const flag = (country: string) => {
    country = country
      .toLowerCase()
      .replace(/\s+/g, '-');

    return `https://www.countryflags.com/wp-content/uploads/${country}-flag-png-large.png`	
  }

  const date = new Date(match.date);
  // convert date to MMM DD, YYYY,  HH:MM
  const formattedDate = date.toLocaleDateString('en-US', 
    { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric'}
  );

  return (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={handleCardPress}
      activeOpacity={0.8}
      disabled={!handleCardPress}
    >
      {/* Images des équipes avec VS au milieu */}
      <View style={styles.teamsImageContainer}>
        
        <Image source={{ uri: flag(match.homeTeam) }} style={styles.teamFlag} />
        <Text style={styles.vsText}>VS</Text>
        <Image source={{ uri: flag(match.awayTeam) }} style={styles.teamFlag} />
          
      </View>

      {/* Détails du match */}
      <View style={styles.cardContent}>
        <View style={styles.tagsRow}>
          <View style={styles.mainTagContainer}>
            <Ionicons name="football-outline" size={14} color="#0000FF" />
            <Text style={styles.mainTagText}> Match </Text>
          </View>

          
        </View>

        <Text style={styles.cardTitle}>{match.homeTeam} Vs. {match.awayTeam}</Text>

        <Text style={styles.cardSubtitle}>{formattedDate}</Text>
      </View>

      {/* Bouton de sauvegarde */}
      <TouchableOpacity
        style={styles.actionButton}
        onPress={handleSaveMatch}
        disabled={!handleSaveMatch}
      >
        <View style={[
          styles.actionIconContainer,
          isSaved && styles.savedIconContainer
        ]}>
          <FontAwesome
            name={isSaved ? "bookmark" : "bookmark-o"}
            size={18}
            color={isSaved ? "#888888" : "#000"}
          />
        </View>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    paddingRight: 6,
    paddingVertical: 10,
  },
  teamsImageContainer: {
    width: 120,
    height: 70,
    borderRadius: 8,
    backgroundColor: "#F6FAFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginRight: 10,
  },
  teamFlag: {
    width: 36,
    height: 24,
    borderRadius: 5,
  },
  vsText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#555",
  },
  matchImage: {
    width: 100,
    height: 70,
    borderRadius: 8,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  mainTagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6FAFF',
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  mainTagText: {
    fontSize: 10,
    color: '#0000FF',
    fontWeight: '500',
    marginLeft: 4,
  },
  secondaryTagText: {
    fontSize: 10,
    color: '#888',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  priceContainer: {
  },
  priceText: {
    fontSize: 12,
    color: '#888',
  },
  priceValue: {
    color: '#E53935',
    fontWeight: '600',
  },
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  actionIconContainer: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  savedIconContainer: {
    backgroundColor: '#E6E6E6',
    borderColor: '#E6E6E6',
  },
});

export default MatchCard;