import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import i18n from '../translations/i18n';

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

  // Simple character-based truncation
  const maxLength = 150;
  const shouldTruncate = text.length > maxLength;
  const displayText = isExpanded ? text : (shouldTruncate ? text.slice(0, maxLength) + '...' : text);

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
        onTextLayout={(e) => {
          if (e.nativeEvent.lines.length > 3 && !showViewMore && !isExpanded) {
            setShowViewMore(true);
          }
        }}
      >
        {displayText}
      </Text>
      
      {/* Separate "View More/Less" button as its own Text component */}
      {(showViewMore || shouldTruncate) && (
        <Text 
          style={styles.viewMoreText}
          onPress={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? i18n.t('aboutSec.viewLess') : i18n.t('aboutSec.viewMore')}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  aboutContainer: {
    marginBottom: 10,
  },
  aboutTitle: {
    fontFamily: 'Raleway',
    fontWeight: '700',
    fontSize: 24,
    lineHeight: 31,
    color: '#000000',
    marginBottom: 5,
  },
  aboutText: {
    fontFamily: 'Raleway',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 18,
    color: '#000000',
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