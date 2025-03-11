import React, { useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';

interface TextWithMoreProps {
  text: string;
  style: any; // Style du texte
}

const TextWithMore: React.FC<TextWithMoreProps> = ({ text, style }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showViewMore, setShowViewMore] = useState(false);
  const [truncatedText, setTruncatedText] = useState('');

  // Problème principal: l'affichage du texte et du bouton "View More" dans le même composant Text
  // peut causer des problèmes de calcul de longueur

  return (
    <View>
      <Text
        style={style}
        numberOfLines={isExpanded ? undefined : 3}
        onTextLayout={(e) => {
          if (e.nativeEvent.lines.length > 3 && !showViewMore) {
            setShowViewMore(true);
            // Récupérer le texte des 4 premières lignes
            const fourthLineEnd = e.nativeEvent.lines[2]?.end || 0;
            if (fourthLineEnd > 0) {
              // Laisser un peu d'espace pour "... View More"
              setTruncatedText(text.slice(0, fourthLineEnd - 10) + '...');
            }
          }
        }}
      >
        {isExpanded ? text : truncatedText || text}
      </Text>
      
      {/* Séparation du bouton "View More/Less" en son propre composant Text */}
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
  viewMoreText: {
    color: 'red',
    marginTop: -2,
    fontWeight: '500',
    marginLeft: 6,
  }
});

export default TextWithMore;