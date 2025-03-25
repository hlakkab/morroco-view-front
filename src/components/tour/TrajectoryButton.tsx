import { Feather } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface TrajectoryButtonProps {
  onPress: () => void;
  itemCount: number;
}

const TrajectoryButton: React.FC<TrajectoryButtonProps> = ({ 
  onPress,
  itemCount
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Feather name="map-pin" size={18} color="#E53935" style={styles.icon} />
        <Text style={styles.text}>Preview Trajectory</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{itemCount}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
    alignItems: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E53935',
    borderRadius: 20,
    borderStyle: 'dashed',
  },
  text: {
    fontSize: 14,
    color: '#E53935',
    fontWeight: '500',
  },
  icon: {
    marginRight: 8,
  },
  badge: {
    backgroundColor: '#E53935',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default TrajectoryButton; 