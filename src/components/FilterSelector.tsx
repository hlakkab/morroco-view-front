import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface FilterOption {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface FilterSelectorProps {
  options: FilterOption[];
  selectedOptionId: string;
  onSelectOption: (optionId: string) => void;
  containerStyle?: object;
  optionStyle?: object;
  selectedOptionStyle?: object;
  textStyle?: object;
  selectedTextStyle?: object;
  title?: string;
}

const FilterSelector: React.FC<FilterSelectorProps> = ({
  options,
  selectedOptionId,
  onSelectOption,
  containerStyle,
  optionStyle,
  selectedOptionStyle,
  textStyle,
  selectedTextStyle,
  title,
}) => {
  return (
    <View>
      {title && <Text style={styles.titleText}>{title}</Text>}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.container, containerStyle]}
      >
        {options.map((option) => {
          const isSelected = selectedOptionId === option.id;
          
          return (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionButton,
                optionStyle,
                isSelected && styles.selectedOptionButton,
                isSelected && selectedOptionStyle,
              ]}
              onPress={() => onSelectOption(option.id)}
            >
              {option.icon}
              <Text 
                style={[
                  styles.optionText,
                  textStyle,
                  isSelected && styles.selectedOptionText,
                  isSelected && selectedTextStyle,
                ]}
              >
                {option.label}
              </Text>
              {isSelected && (
                <Ionicons 
                  name="checkmark" 
                  size={16} 
                  color="#fff" 
                  style={styles.checkIcon} 
                />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  titleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    marginLeft: 8,
    marginBottom: 4,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 6,
  },
  selectedOptionButton: {
    backgroundColor: '#CE1126',
  },
  optionText: {
    fontSize: 14,
    color: '#888',
    marginLeft: 6,
  },
  selectedOptionText: {
    color: 'white',
    fontWeight: '500',
  },
  checkIcon: {
    marginLeft: 6,
  },
});

export default FilterSelector;
