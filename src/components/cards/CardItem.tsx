import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
interface CardItemProps {
  imageUrl?: string;
  title: string;
  subtitle?: string;
  customStyles?: {
    container?: object;
    image?: object;
    content?: object;
    title?: object;
    subtitle?: object;
    tagsContainer?: object;
    mainTag?: object;
    mainTagText?: object;
    secondaryTagText?: object;
    priceContainer?: object;
    priceText?: object;
    priceValue?: object;
    actionButton?: object;
  };
  price?: {
    value: number;
    currency?: string;
    prefix?: string;
    suffix?: string;
  };
  tags?: Array<{
    id: string;
    label: string | React.ReactNode;
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
  isEditable?: boolean;
}

const CardItem: React.FC<CardItemProps> = ({
  imageUrl,
  title,
  subtitle,
  customStyles = {},
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
  isEditable = false,
}) => {
  return (
    <TouchableOpacity 
      style={[styles.cardContainer, customStyles.container]}
      onPress={onCardPress}
      disabled={!onCardPress}
    >
      {(imageUrl && (
        <Image 
          source={{ uri: imageUrl }} 
          style={[styles.cardImage, customStyles.image]} 
        />
      )) || svgImage}
      
      <View style={[styles.cardContent, customStyles.content]}>
        <View style={[styles.tagsRow, customStyles.tagsContainer]}>
          {tags.length > 0 && tags[0] && (
            <View style={[styles.mainTagContainer, customStyles.mainTag]}>
              {tags[0].icon}
              <Text style={[styles.mainTagText, customStyles.mainTagText]}>{tags[0].label}</Text>
            </View>
          )}
          
          {tags.length > 1 && tags[1] && (
            <Text style={[styles.secondaryTagText, customStyles.secondaryTagText]}>{tags[1].label}</Text>
          )}
        </View>
        
        <Text style={[styles.cardTitle, customStyles.title]}>
          {title}
        </Text>
        
        {subtitle && (
          <Text style={[styles.cardSubtitle, customStyles.subtitle]}>{subtitle}</Text>
        )}
        
        {price && (
          <View style={[styles.priceContainer, customStyles.priceContainer]}>
            <Text style={[styles.priceText, customStyles.priceText]}>
              {price.prefix || 'start from'}{' '}
              <Text style={[styles.priceValue, customStyles.priceValue]}>
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
            isSaved && styles.savedIconContainer,
          ]}>
            
            {actionIcon}
          </View>
        </TouchableOpacity>
    //   <TouchableOpacity
    //   style={styles.actionButton}
    //   onPress={onActionPress}
    //   disabled={!onActionPress}
    // >
    //   <View style={[
    //     styles.actionIconContainer,
    //     isSaved && styles.savedIconContainer
    //   ]}>
    //     <FontAwesome
    //       name={isSaved ? "bookmark" : "bookmark-o"}
    //       size={18}
    //       color={isSaved ? "#888888" : "#000"}
    //     />
    //   </View>
    // </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    paddingRight: 6,
    
  },
  cardImage: {
    width: 120,
    height: 100,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    marginRight: 10,
    alignSelf: 'center',
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
    backgroundColor: '#E6E6E6',
    borderColor: '#E6E6E6',
  },
});

export default CardItem; 