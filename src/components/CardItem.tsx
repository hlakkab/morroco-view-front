import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CardItemProps {
  imageUrl?: string;
  title: string;
  subtitle?: string;
  price?: {
    value: number;
    currency?: string;
    prefix?: string;
    suffix?: string;
  };
  tags?: Array<{
    id: string;
    label: string;
    icon?: React.ReactNode;
    style?: object;
    textStyle?: object;
  }>;
  actionIcon?: React.ReactNode;
  onActionPress?: () => void;
  onCardPress?: () => void;
  containerStyle?: object;
  imageStyle?: object;
  contentStyle?: object;
  svgImage?: React.ReactNode;
  isSaved?: boolean;
}

const CardItem: React.FC<CardItemProps> = ({
  imageUrl,
  title,
  subtitle,
  price,
  tags = [],
  actionIcon,
  onActionPress,
  onCardPress,
  containerStyle,
  imageStyle,
  contentStyle,
  svgImage,
  isSaved = false,
}) => {
  return (
    <TouchableOpacity 
      style={[styles.cardContainer, containerStyle]}
      onPress={onCardPress}
      disabled={!onCardPress}
    >
      {svgImage || (imageUrl && (
        <Image 
          source={{ uri: imageUrl }} 
          style={[styles.cardImage, imageStyle]} 
        />
      ))}
      
      <View style={[styles.cardContent, contentStyle]}>
        <View style={styles.tagsRow}>
          {tags.length > 0 && tags[0] && (
            <View style={styles.mainTagContainer}>
              {tags[0].icon}
              <Text style={[styles.mainTagText, tags[0].textStyle]}>{tags[0].label}</Text>
            </View>
          )}
          
          {tags.length > 1 && tags[1] && (
            <Text style={styles.secondaryTagText}>{tags[1].label}</Text>
          )}
        </View>
        
        <Text style={styles.cardTitle}>
          {title}
        </Text>
        
        {subtitle && (
          <Text style={styles.cardSubtitle}>{subtitle}</Text>
        )}
        
        {price && (
          <View style={styles.priceContainer}>
            <Text style={styles.priceText}>
              {price.prefix || 'start from'}{' '}
              <Text style={styles.priceValue}>
                {price.value} {price.currency || 'Dh'}
              </Text>
              {price.suffix && ` ${price.suffix}`}
            </Text>
          </View>
        )}
      </View>
      
      {actionIcon && (
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={onActionPress}
          disabled={!onActionPress}
        >
          <View style={[
            styles.actionIconContainer, 
            isSaved && styles.savedIconContainer
          ]}>
            {actionIcon}
          </View>
        </TouchableOpacity>
      )}
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
  cardImage: {
    width: 100,
    height: 70,
    borderRadius: 8,
    marginRight: 10,
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
    backgroundColor: '#E8F5F0',
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  mainTagText: {
    fontSize: 10,
    color: '#008060',
    fontWeight: '500',
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
    backgroundColor: 'grey',
    borderColor: '#666',
  },
});

export default CardItem; 