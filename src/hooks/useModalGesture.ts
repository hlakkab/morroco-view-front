import { useRef, useEffect } from 'react';
import { Animated, PanResponder } from 'react-native';

/**
 * Custom hook to handle modal gesture interactions
 * @param onClose Function to call when modal should close
 */
export const useModalGesture = (onClose: () => void) => {
  // Animation value for the modal position
  const pan = useRef(new Animated.ValueXY()).current;
  
  // Pan responder for handling drag gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to vertical gestures
        return Math.abs(gestureState.dy) > 10;
      },
      onPanResponderGrant: () => {
        // When gesture starts, extract the offset
        pan.extractOffset();
      },
      onPanResponderMove: (_, gestureState) => {
        // Only allow downward movement
        if (gestureState.dy > 0) {
          Animated.event([null, { dy: pan.y }], { useNativeDriver: false })(_, gestureState);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        // Reset the offset
        pan.flattenOffset();
        
        if (gestureState.dy > 100) {
          // If dragged down more than 100 units, close the modal
          onClose();
        } else {
          // Otherwise, reset position with a spring animation
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
            friction: 8
          }).start();
        }
      }
    })
  ).current;

  // Reset pan position when needed
  const resetPosition = () => {
    pan.setValue({ x: 0, y: 0 });
  };

  return {
    pan,
    panResponder,
    resetPosition
  };
}; 