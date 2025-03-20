import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface AboutSectionProps {
  title?: string; // Titre optionnel
  text: string;
  style?: any; // Style pour le texte (rendu optionnel)
  titleStyle?: any; // Style pour le titre (rendu optionnel)
}

const AboutSection: React.FC<AboutSectionProps> = ({ 
  title = "About", // Valeur par défaut
  text, 
  style, 
  titleStyle 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showViewMore, setShowViewMore] = useState(false);
  const [truncatedText, setTruncatedText] = useState('');

  return (
    <View style={styles.aboutContainer}>
      {/* Afficher le titre s'il est fourni */}
      {title && (
        <Text style={[styles.aboutTitle, titleStyle]}>
          {title}
        </Text>
      )}
      
      <Text
        style={[styles.aboutText, style]}
        numberOfLines={isExpanded ? undefined : 3}
        onTextLayout={(e) => {
          if (e.nativeEvent.lines.length > 3 && !showViewMore) {
            setShowViewMore(true);
            // Get the text of the first 3 lines
            const thirdLineEnd = e.nativeEvent.lines[2]?.end || 0;
            if (thirdLineEnd > 0) {
              // Leave some space for "... View More"
              setTruncatedText(text.slice(0, thirdLineEnd - 10) + '...');
            }
          }
        }}
      >
        {isExpanded ? text : truncatedText || text}
      </Text>
      
      {/* Separate "View More/Less" button as its own Text component */}
      {showViewMore && (
        <Text 
          style={styles.viewMoreText}
          onPress={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'View Less' : 'View More'}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  aboutContainer: {
    marginBottom: 24,
  },
  aboutTitle: {
    height: 30,
    fontFamily: 'Raleway',
    fontWeight: '700',
    fontSize: 24,
    lineHeight: 31,
    color: '#000000',
    marginBottom: 16,
  },
  aboutText: {
    fontFamily: 'Raleway',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 18,
    color: '#000000',
    marginBottom:-5
  },
  viewMoreText: {
    fontFamily: 'Raleway',
    color: '#AE1913',
    marginTop: 0,
    marginLeft: 0,
    fontWeight: '500',
  }
});

export default AboutSection;