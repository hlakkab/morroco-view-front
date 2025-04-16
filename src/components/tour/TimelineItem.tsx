import { Feather, Ionicons } from '@expo/vector-icons';
import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SavedItem {
  id: string;
  type: 'hotel' | 'restaurant' | 'match' | 'entertainment';
  title: string;
  subtitle?: string;
  city: string;
  duration?: string;
  timeSlot?: string;
}

interface TimelineItemProps {
  item: SavedItem;
  onSetTime: () => void;
  onSetDuration: () => void;
  onDragStart?: () => void;
  isDragging?: boolean;
}

const TimelineItem: React.FC<TimelineItemProps> = ({ 
  item, 
  onSetTime, 
  onSetDuration, 
  onDragStart,
  isDragging = false
}) => {
  const getItemTypeIcon = (type: string, size = 18) => {
    switch(type) {
      case 'hotel':
        return <Ionicons name="bed" size={size} color="#FFF" />;
      case 'restaurant':
        return <Ionicons name="restaurant" size={size} color="#FFF" />;
      case 'match':
        return <Ionicons name="football" size={size} color="#FFF" />;
      case 'entertainment':
        return <Ionicons name="musical-notes" size={size} color="#FFF" />;
      default:
        return <Ionicons name="location" size={size} color="#FFF" />;
    }
  };

  const getIconBackgroundColor = (type: string) => {
    switch(type) {
      case 'hotel': return '#E91E63';
      case 'restaurant': return '#4CAF50';
      case 'match': return '#2196F3';
      case 'entertainment': return '#FF9800';
      default: return '#9E9E9E';
    }
  };

  const iconBgColor = getIconBackgroundColor(item.type);

  return (
    <Pressable 
      onLongPress={onDragStart}
      delayLongPress={200}
      style={({ pressed }) => [
        styles.container, 
        isDragging && styles.draggingItem,
        pressed && styles.pressedItem
      ]}
    >
      <View style={styles.timelineIconContainer}>
        <View style={styles.horizontalConnector} />
        <View style={[styles.iconCircle, { backgroundColor: iconBgColor }]}>
          {getItemTypeIcon(item.type)}
          {onDragStart && (
            <View style={styles.dragIndicator}>
              <Feather name="move" size={10} color="#FFF" />
            </View>
          )}
        </View>
      </View>
      
      <View style={styles.cardContainer}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          <View style={[styles.itemTypeBadge, { backgroundColor: iconBgColor }]}>
            <Text style={styles.itemTypeText}>
              {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
            </Text>
          </View>
        </View>
        
        {item.subtitle && (
          <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
        )}
        
        <View style={styles.itemFooter}>
          {item.timeSlot ? (
            <View style={styles.itemTimeSlot}>
              <Feather name="clock" size={14} color="#666" style={{ marginRight: 4 }} />
              <Text style={styles.itemTimeText}>{item.timeSlot}</Text>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.addButton}
              onPress={onSetTime}
            >
              <Feather name="clock" size={14} color="#E53935" style={{ marginRight: 4 }} />
              <Text style={styles.addButtonText}>Set Time</Text>
            </TouchableOpacity>
          )}
          
          {(item.type === 'match' || item.type === 'entertainment') && (
            item.duration ? (
              <View style={styles.itemDuration}>
                <Feather name="calendar" size={14} color="#666" style={{ marginRight: 4 }} />
                <Text style={styles.itemDurationText}>{item.duration}</Text>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.addButton}
                onPress={onSetDuration}
              >
                <Feather name="calendar" size={14} color="#E53935" style={{ marginRight: 4 }} />
                <Text style={styles.addButtonText}>Set Duration</Text>
              </TouchableOpacity>
            )
          )}
          
          <TouchableOpacity style={styles.viewDetailsButton}>
            <Text style={styles.viewDetailsText}>View Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 16,
    position: 'relative',
    alignItems: 'center',
    zIndex: 5,
  },
  timelineIconContainer: {
    width: 75,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  horizontalConnector: {
    position: 'absolute',
    height: 2,
    backgroundColor: '#E53935',
    width: 30,
    right: 0,
    zIndex: 1,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    zIndex: 10,
    position: 'relative',
    marginLeft: -25,
  },
  cardContainer: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 5,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    flex: 1,
  },
  itemTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  itemTypeText: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: '500',
  },
  itemSubtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  itemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  itemTimeSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  itemTimeText: {
    fontSize: 12,
    color: '#666',
  },
  itemDuration: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  itemDurationText: {
    fontSize: 12,
    color: '#666',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E53935',
    borderStyle: 'dashed',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  addButtonText: {
    fontSize: 12,
    color: '#E53935',
  },
  viewDetailsButton: {
    marginLeft: 'auto',
    marginBottom: 4,
  },
  viewDetailsText: {
    fontSize: 12,
    color: '#E53935',
    fontWeight: '500',
  },
  draggingItem: {
    opacity: 0.9,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.34,
    shadowRadius: 6.27,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  dragIndicator: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 8,
    padding: 2,
  },
  pressedItem: {
    opacity: 0.8,
  },
});

// Use memo to prevent unnecessary re-renders
export default memo(TimelineItem);