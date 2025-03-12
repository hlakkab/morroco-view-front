import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { Match } from "../types/match";

interface MatchCardProps {
  match: Match;
  onPress?: () => void;
  onSavePress?: () => void;
}

const MatchCard: React.FC<MatchCardProps> = ({
  match,
  onPress,
  onSavePress
}) => {
  const isSaved = match.isSaved || false;

  return (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={!onPress}
    >
      {/* Images des équipes avec VS au milieu */}
      <View style={styles.teamsImageContainer}>
        {(match.homeTeam && match.awayTeam) ? (
          <>
            <Image source={{ uri: match.homeTeam.flag }} style={styles.teamFlag} />
            <Text style={styles.vsText}>VS</Text>
            <Image source={{ uri: match.awayTeam.flag }} style={styles.teamFlag} />
          </>
        ) : (match.team1Image && match.team2Image) ? (
          <>
            <Image source={{ uri: match.team1Image }} style={styles.teamFlag} />
            <Text style={styles.vsText}>VS</Text>
            <Image source={{ uri: match.team2Image }} style={styles.teamFlag} />
          </>
        ) : (
          <Image source={{ uri: match.image }} style={styles.matchImage} />
        )}
      </View>

      {/* Détails du match */}
      <View style={styles.cardContent}>
        <View style={styles.tagsRow}>
          <View style={styles.mainTagContainer}>
            <Ionicons name="football-outline" size={12} color="#0000FF" />
            <Text style={styles.mainTagText}>{match.status}</Text>
          </View>

          {match.location && (
            <Text style={styles.secondaryTagText}>
              {typeof match.location === 'string'
                ? match.location
                : match.location.address.split(',')[0]} {/* Affiche seulement la première partie de l'adresse */}
            </Text>
          )}
        </View>

        <Text style={styles.cardTitle}>{match.teams}</Text>

        <Text style={styles.cardSubtitle}>{match.date}</Text>
      </View>

      {/* Bouton de sauvegarde */}
      <TouchableOpacity
        style={styles.actionButton}
        onPress={onSavePress}
        disabled={!onSavePress}
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
    padding: 12,
  },
  teamsImageContainer: {
    width: 100,
    height: 70,
    borderRadius: 8,
    backgroundColor: "#F6FAFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginRight: 10,
  },
  teamFlag: {
    width: 35,
    height: 25,
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