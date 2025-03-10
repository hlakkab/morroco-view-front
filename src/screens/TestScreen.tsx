import React, { useState, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Animated, 
  PanResponder,
  Dimensions,
  SafeAreaView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';

// Get screen dimensions for responsive layout
const { width } = Dimensions.get('window');
const ITEM_SIZE = width * 0.8; // 80% of screen width
const ITEM_HEIGHT = 80;
const ITEM_MARGIN = 10;
const ITEM_TOTAL_HEIGHT = ITEM_HEIGHT + ITEM_MARGIN * 2;

// Define the items with different colors
const INITIAL_ITEMS = [
  { id: '1', color: '#FF5252', label: 'Item 1' },
  { id: '2', color: '#4CAF50', label: 'Item 2' },
  { id: '3', color: '#2196F3', label: 'Item 3' },
  { id: '4', color: '#FFC107', label: 'Item 4' },
];

const TestScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [items, setItems] = useState(INITIAL_ITEMS);
  
  // Track the order of items by their index
  const [itemOrder, setItemOrder] = useState([0, 1, 2, 3]);
  
  // Create animated values for each item
  const itemAnimations = useRef(
    INITIAL_ITEMS.map(() => ({
      // Each item has a fixed Y position based on its order
      translateY: new Animated.Value(0),
      scale: new Animated.Value(1),
      zIndex: new Animated.Value(1)
    }))
  ).current;
  
  // Track which item is being dragged
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  
  // Track the last gesture movement direction
  const lastDirection = useRef<'up' | 'down' | null>(null);
  
  // Function to get Y position for an item based on its order
  const getYPosition = (orderIndex: number) => {
    return orderIndex * ITEM_TOTAL_HEIGHT;
  };
  
  // Function to swap items in the order array
  const swapItems = (index1: number, index2: number) => {
    // Get the current positions in the order
    const orderIndex1 = itemOrder.indexOf(index1);
    const orderIndex2 = itemOrder.indexOf(index2);
    
    // Create a new order array with swapped positions
    const newOrder = [...itemOrder];
    newOrder[orderIndex1] = index2;
    newOrder[orderIndex2] = index1;
    
    // Update the order state
    setItemOrder(newOrder);
    
    // Animate both items to their new positions
    Animated.parallel([
      Animated.spring(itemAnimations[index1].translateY, {
        toValue: getYPosition(orderIndex2),
        friction: 5,
        tension: 40,
        useNativeDriver: true
      }),
      Animated.spring(itemAnimations[index2].translateY, {
        toValue: getYPosition(orderIndex1),
        friction: 5,
        tension: 40,
        useNativeDriver: true
      })
    ]).start();
  };
  
  // Create pan responders for each item
  const panResponders = items.map((_, index) => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        // When user starts dragging, bring this item to front and scale it slightly
        setDraggingIdx(index);
        Animated.parallel([
          Animated.timing(itemAnimations[index].zIndex, {
            toValue: 10,
            duration: 100,
            useNativeDriver: true
          }),
          Animated.spring(itemAnimations[index].scale, {
            toValue: 1.05,
            friction: 5,
            tension: 40,
            useNativeDriver: true
          })
        ]).start();
      },
      onPanResponderMove: (_, gesture) => {
        if (draggingIdx === null) return;
        
        // Get the current order index of this item
        const currentOrderIndex = itemOrder.indexOf(index);
        
        // Calculate the potential new position based on drag
        const dragDistance = gesture.dy;
        const itemHeight = ITEM_TOTAL_HEIGHT;
        
        // Calculate how many positions to move (can be fractional)
        const positionsToMove = dragDistance / itemHeight;
        
        // Calculate the target index (can be fractional)
        const targetIndex = currentOrderIndex + positionsToMove;
        
        // Determine which items need to be swapped
        if (targetIndex > currentOrderIndex && currentOrderIndex < items.length - 1) {
          // Dragging downward
          const nextItemIndex = itemOrder[currentOrderIndex + 1];
          
          // Check if we've dragged far enough to swap
          const swapThreshold = 0.3; // Swap when dragged 30% of the way
          if (positionsToMove > swapThreshold) {
            swapItems(index, nextItemIndex);
          }
        } 
        else if (targetIndex < currentOrderIndex && currentOrderIndex > 0) {
          // Dragging upward
          const prevItemIndex = itemOrder[currentOrderIndex - 1];
          
          // Check if we've dragged far enough to swap
          const swapThreshold = -0.3; // Swap when dragged 30% of the way
          if (positionsToMove < swapThreshold) {
            swapItems(index, prevItemIndex);
          }
        }
      },
      onPanResponderRelease: () => {
        if (draggingIdx !== null) {
          // Reset the item appearance
          Animated.parallel([
            Animated.timing(itemAnimations[draggingIdx].zIndex, {
              toValue: 1,
              duration: 100,
              useNativeDriver: true
            }),
            Animated.spring(itemAnimations[draggingIdx].scale, {
              toValue: 1,
              friction: 5,
              tension: 40,
              useNativeDriver: true
            })
          ]).start();
          
          setDraggingIdx(null);
        }
      }
    });
  });

  // Initialize item positions when component mounts
  React.useEffect(() => {
    itemOrder.forEach((itemIndex, orderIndex) => {
      itemAnimations[itemIndex].translateY.setValue(getYPosition(orderIndex));
    });
  }, []);

  // Function to go back to home
  const goBack = () => {
    navigation.navigate('Home');
  };

  // Function to reset items to original order
  const resetItems = () => {
    // Reset the order
    const newOrder = [0, 1, 2, 3];
    setItemOrder(newOrder);
    
    // Animate items back to original positions
    newOrder.forEach((itemIndex, orderIndex) => {
      Animated.spring(itemAnimations[itemIndex].translateY, {
        toValue: getYPosition(orderIndex),
        friction: 5,
        tension: 40,
        useNativeDriver: true
      }).start();
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Drag & Drop Test</Text>
      <Text style={styles.subtitle}>Drag items to swap with neighbors</Text>
      
      <View style={styles.itemsContainer}>
        {items.map((item, index) => {
          return (
            <Animated.View
              key={item.id}
              {...panResponders[index].panHandlers}
              style={[
                styles.item,
                { 
                  backgroundColor: item.color,
                  transform: [
                    { translateY: itemAnimations[index].translateY },
                    { scale: itemAnimations[index].scale }
                  ],
                  zIndex: itemAnimations[index].zIndex,
                  elevation: draggingIdx === index ? 5 : 0,
                  shadowOpacity: draggingIdx === index ? 0.3 : 0
                }
              ]}
            >
              <Text style={styles.itemText}>{item.label}</Text>
              <View style={styles.dragHandle}>
                <View style={styles.dragLine} />
                <View style={styles.dragLine} />
                <View style={styles.dragLine} />
              </View>
            </Animated.View>
          );
        })}
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.resetButton]} 
          onPress={resetItems}
        >
          <Text style={styles.buttonText}>Reset Order</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.backButton]} 
          onPress={goBack}
        >
          <Text style={styles.buttonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF7F7',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  itemsContainer: {
    width: width - 40,
    height: ITEM_TOTAL_HEIGHT * 4,
    position: 'relative',
  },
  item: {
    position: 'absolute',
    width: ITEM_SIZE,
    height: ITEM_HEIGHT,
    marginVertical: ITEM_MARGIN,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    left: (width - 40 - ITEM_SIZE) / 2, // Center horizontally
  },
  itemText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  dragHandle: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dragLine: {
    width: 25,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    marginVertical: 2,
    borderRadius: 2,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    alignItems: 'center',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: '#6200EE',
  },
  backButton: {
    backgroundColor: '#03DAC5',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TestScreen; 