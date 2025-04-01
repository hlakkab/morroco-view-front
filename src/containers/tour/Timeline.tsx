import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useSharedValue } from 'react-native-reanimated';
import TimelineItem from '../../components/tour/TimelineItem';
import { SavedItem } from '../../types/navigation';

interface TimelineProps {
  items: SavedItem[];
  onSetTime: (itemIndex: number) => void;
  onSetDuration: (itemIndex: number) => void;
  onReorderItems?: (newItems: SavedItem[]) => void;
}

type RenderItemProps = {
  item: SavedItem;
  index: number;
};

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
  
  // State to manage the items for the flatlist
  const [timelineItems, setTimelineItems] = useState(items);
  
  // Shared value to track dragged item
  const draggingId = useSharedValue<string | null>(null);
  const draggedIndex = useSharedValue<number>(-1);
  const currentPositionY = useSharedValue(0);
  
  // Create a memoized copy of items to prevent reference issues
  const itemsCopy = useMemo(() => 
    timelineItems.map(item => ({...item})), 
    [timelineItems]
  );
  
  // Update local state when props change
  useMemo(() => {
    setTimelineItems(items);
  }, [items]);
  
  // Handle moving items
  const handleMoveItem = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    
    // Create a new array to avoid mutation issues
    const newItems = [...itemsCopy];
    
    // Remove the item from its original position
    const [movedItem] = newItems.splice(fromIndex, 1);
    
    // Insert the item at the new position
    newItems.splice(toIndex, 0, movedItem);
    
    // Update the state immediately for a smooth visual update
    setTimelineItems(newItems);
    
    // Notify parent component about the reordering
    if (onReorderItems) {
      onReorderItems(newItems);
    }
  }, [itemsCopy, onReorderItems]);
  
  // Handle drag start for an item
  const handleDragStart = useCallback((id: string, index: number) => {
    draggingId.value = id;
    draggedIndex.value = index;
  }, [draggingId, draggedIndex]);
  
  // Handle drag end
  const handleDragEnd = useCallback(() => {
    draggingId.value = null;
    draggedIndex.value = -1;
    currentPositionY.value = 0;
  }, [draggingId, draggedIndex, currentPositionY]);
  
  // Handle position change during drag
  const handlePositionChange = useCallback((id: string, destIndex: number) => {
    const sourceIndex = itemsCopy.findIndex(item => item.id === id);
    
    if (sourceIndex !== -1 && sourceIndex !== destIndex) {
      handleMoveItem(sourceIndex, destIndex);
    }
  }, [itemsCopy, handleMoveItem]);
  
  // Render item component
  const renderItem = useCallback(({ item, index }: RenderItemProps) => {
    const handleSetTimeCallback = () => onSetTime(index);
    const handleSetDurationCallback = () => onSetDuration(index);
    
    // Fix for accessing shared values in render functions:
    // Instead of directly accessing draggingId.value, we pass the shared value object
    return (
      <TimelineItem
        key={item.id}
        item={item}
        onSetTime={handleSetTimeCallback}
        onSetDuration={handleSetDurationCallback}
        index={index}
        onDragStart={() => handleDragStart(item.id, index)}
        onDragEnd={handleDragEnd}
        onPositionChange={(destIndex: number) => handlePositionChange(item.id, destIndex)}
        isDragging={false} // Static value to avoid shared value warning
        totalItems={itemsCopy.length}
        draggingId={draggingId}
        draggedIndex={draggedIndex}
        currentPositionY={currentPositionY}
      />
    );
  }, [
    onSetTime, 
    onSetDuration, 
    handleDragStart, 
    handleDragEnd,
    handlePositionChange, 
    draggingId, 
    draggedIndex,
    currentPositionY,
    itemsCopy
  ]);
  
  const keyExtractor = useCallback((item: SavedItem) => item.id, []);
  
  return (
    <View style={styles.container}>
      <GestureHandlerRootView style={styles.gestureContainer}>
        <View style={styles.timelineColumn}>
          <View style={styles.timelineLine} />
        </View>
        
        <View style={styles.itemsColumn}>
          <FlatList
            data={itemsCopy}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.flatListContainer}
            removeClippedSubviews={false}
            CellRendererComponent={({ children, ...props }) => (
              <View {...props}>
                {children}
              </View>
            )}
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
    paddingBottom: 16,
    paddingTop: 8,
  },
});

export default React.memo(Timeline);