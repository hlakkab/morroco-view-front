import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface TextWithMoreProps {
  text: string;
  style: any; // Style for the text
}

const TextWithMore: React.FC<TextWithMoreProps> = ({ text, style }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showViewMore, setShowViewMore] = useState(false);
  const [truncatedText, setTruncatedText] = useState('');

  return (
    <View>
      <Text
        style={style}
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
  viewMoreText: {
    color: '#AE1913',
    marginTop: 4,
    fontWeight: '500',
  }
});

export default TextWithMore; 