import React, { useCallback, useEffect, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import TimelineItem from '../../components/tour/TimelineItem';

interface SavedItem {
  id: string;
  type: 'hotel' | 'restaurant' | 'match' | 'entertainment';
  title: string;
  subtitle?: string;
  city: string;
  duration?: string;
  timeSlot?: string;
}

interface TimelineProps {
  items: SavedItem[];
  onSetTime: (itemIndex: number) => void;
  onSetDuration: (itemIndex: number) => void;
  onReorderItems?: (newItems: SavedItem[]) => void;
}

const Timeline: React.FC<TimelineProps> = ({ 
  items, 
  onSetTime, 
  onSetDuration,
  onReorderItems
}) => {
  // Skip rendering if no items
  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.timelineColumn}>
          <View style={styles.timelineLine} />
        </View>
        
        <View style={styles.itemsColumn}>
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No activities planned for this day</Text>
          </View>
        </View>
      </View>
    );
  }
  
  // Create a memoized copy of items to prevent reference issues
  const itemsCopy = useMemo(() => 
    items.map(item => ({...item})), 
    [items]
  );
  
  // Create a stable callback for handling drag end
  const handleDragEnd = useCallback(({ data }: { data: SavedItem[] }) => {
    if (onReorderItems) {
      // Create a fresh copy to avoid reference issues
      const newItems = data.map(item => ({...item}));
      onReorderItems(newItems);
    }
  }, [onReorderItems]);

  // Fixed render item function to avoid closure problems with Reanimated
  const renderItem = useCallback(({ item, drag, isActive, index }: any) => {
    // These handler functions are recreated for each item to avoid ref usage
    const handleSetTimeCallback = () => onSetTime(index);
    const handleSetDurationCallback = () => onSetDuration(index);
    
    return (
      <TimelineItem
        key={item.id}
        item={item}
        onSetTime={handleSetTimeCallback}
        onSetDuration={handleSetDurationCallback}
        onDragStart={drag}
        isDragging={isActive}
      />
    );
  }, [onSetTime, onSetDuration]);
  
  return (
    <View style={styles.container}>
      <GestureHandlerRootView style={styles.gestureContainer}>
        <View style={styles.timelineColumn}>
          <View style={styles.timelineLine} />
        </View>
        
        <View style={styles.itemsColumn}>
          <DraggableFlatList
            data={itemsCopy}
            keyExtractor={(item) => item.id}
            onDragEnd={handleDragEnd}
            renderItem={renderItem}
            containerStyle={styles.flatListContainer}
            activationDistance={5}
            scrollEnabled={false}
            autoscrollSpeed={200}
            dragHitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </GestureHandlerRootView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flex: 1,
  },
  gestureContainer: {
    flex: 1, 
    flexDirection: 'row',
  },
  timelineColumn: {
    width: 30,
    alignItems: 'center',
    position: 'absolute',
    height: '100%',
    left: 10,
    zIndex: 0,
  },
  timelineLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#E53935',
    left: '50%',
    zIndex: 1,
  },
  itemsColumn: {
    flex: 1,
  },
  emptyContainer: {
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    alignItems: 'center',
    marginLeft: 10,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  flatListContainer: {
    flex: 1,
    width: '100%',
  },
});

export default React.memo(Timeline);