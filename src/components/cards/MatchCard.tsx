import { FontAwesome, Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useLanguage } from "../../contexts/LanguageContext";
import i18n from "../../translations/i18n";
import { Match } from "../../types/match";
import { getFlagUrl } from "../../utils/flagResolver";

interface MatchCardProps {
  match: Match;
  handleCardPress?: () => void;
  handleSaveMatch: (id: string) => void;
}

const MatchCard: React.FC<MatchCardProps> = ({
  match,
  handleCardPress,
  handleSaveMatch,
}) => {
  const isSaved = match.saved
  const { currentLanguage } = useLanguage();

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
      
      <View style={styles.teamsImageContainer}>
        
        <Image source={{ uri: getFlagUrl(match.homeTeam) }} style={styles.teamFlag} />
        <Text style={styles.vsText}>{i18n.t('matches.vs')}</Text>
        <Image source={{ uri: getFlagUrl(match.awayTeam) }} style={styles.teamFlag} />
          
      </View>


      <View style={styles.cardContent}>
        <View style={styles.tagsRow}>
          <View style={styles.mainTagContainer}>
            <Ionicons name="football-outline" size={14} color="#0000FF" />
            <Text style={styles.mainTagText}> {i18n.t('matches.match')} </Text>
          </View>

          
        </View>

        <Text style={styles.cardTitle}>{match.homeTeam} Vs. {match.awayTeam}</Text>

        <Text style={styles.cardSubtitle}>{formattedDate}</Text>
      </View>

      {/* Bouton de sauvegarde */}
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => handleSaveMatch(match.id)}
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
   //paddingVertical: 10,
  },
  teamsImageContainer: {
    width: 120,
    height: 100,
    borderRadius: 8,
    backgroundColor: "#F6FAFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginRight: 10,
    paddingHorizontal:6,
  },
  teamFlag: {
    width: 36,
    height: 26,
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