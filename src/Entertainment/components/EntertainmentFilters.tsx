import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EntertainmentType, BookingRequired } from '../types/Entertainment';
import i18n from '../../translations/i18n';

export interface EntertainmentFilterValues {
  type?: EntertainmentType;
  minRating?: number;
  maxRating?: number;
  bookingRequired?: BookingRequired;
}

interface EntertainmentFiltersProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: EntertainmentFilterValues) => void;
  initialFilters?: EntertainmentFilterValues;
}

const EntertainmentFilters: React.FC<EntertainmentFiltersProps> = ({
  visible,
  onClose,
  onApply,
  initialFilters = {}
}) => {
  const [selectedType, setSelectedType] = useState<EntertainmentType | undefined>(initialFilters.type);
  const [selectedMinRating, setSelectedMinRating] = useState<number | undefined>(initialFilters.minRating);
  const [selectedMaxRating, setSelectedMaxRating] = useState<number | undefined>(initialFilters.maxRating);
  const [selectedBooking, setSelectedBooking] = useState<BookingRequired | undefined>(initialFilters.bookingRequired);

  const entertainmentTypes: { value: EntertainmentType; label: string }[] = [
    { value: 'THEME_PARK', label: i18n.t('entertainment.types.themePark') || 'Theme Park' },
    { value: 'WATER_PARK', label: i18n.t('entertainment.types.waterPark') || 'Water Park' },
    { value: 'ZOO', label: i18n.t('entertainment.types.zoo') || 'Zoo' },
    { value: 'AQUARIUM', label: i18n.t('entertainment.types.aquarium') || 'Aquarium' },
    { value: 'MUSEUM', label: i18n.t('entertainment.types.museum') || 'Museum' },
    { value: 'THEATER', label: i18n.t('entertainment.types.theater') || 'Theater' },
    { value: 'CINEMA', label: i18n.t('entertainment.types.cinema') || 'Cinema' },
    { value: 'CONCERT_HALL', label: i18n.t('entertainment.types.concertHall') || 'Concert Hall' },
    { value: 'SPORTS_VENUE', label: i18n.t('entertainment.types.sportsVenue') || 'Sports Venue' },
    { value: 'NIGHTCLUB', label: i18n.t('entertainment.types.nightclub') || 'Nightclub' },
    { value: 'CASINO', label: i18n.t('entertainment.types.casino') || 'Casino' },
    { value: 'OTHER', label: i18n.t('entertainment.types.other') || 'Other' },
  ];

  const ratingOptions = [
    { value: 1, label: '1+' },
    { value: 2, label: '2+' },
    { value: 3, label: '3+' },
    { value: 4, label: '4+' },
    { value: 5, label: '5' },
  ];

  const bookingOptions: { value: BookingRequired; label: string }[] = [
    { value: 'YES', label: i18n.t('entertainment.booking.yes') || 'Required' },
    { value: 'NO', label: i18n.t('entertainment.booking.no') || 'Not Required' },
    { value: 'RECOMMENDED', label: i18n.t('entertainment.booking.recommended') || 'Recommended' },
  ];

  const handleReset = () => {
    setSelectedType(undefined);
    setSelectedMinRating(undefined);
    setSelectedMaxRating(undefined);
    setSelectedBooking(undefined);
  };

  const handleApply = () => {
    onApply({
      type: selectedType,
      minRating: selectedMinRating,
      maxRating: selectedMaxRating,
      bookingRequired: selectedBooking,
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{i18n.t('entertainment.filterTitle') || 'Filter Entertainment'}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Entertainment Type Filter */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {i18n.t('entertainment.filterType') || 'Entertainment Type'}
              </Text>
              <View style={styles.chipContainer}>
                {entertainmentTypes.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.chip,
                      selectedType === type.value && styles.chipSelected,
                    ]}
                    onPress={() =>
                      setSelectedType(selectedType === type.value ? undefined : type.value)
                    }
                  >
                    <Text
                      style={[
                        styles.chipText,
                        selectedType === type.value && styles.chipTextSelected,
                      ]}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Rating Filter */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {i18n.t('entertainment.filterRating') || 'Minimum Rating'}
              </Text>
              <View style={styles.chipContainer}>
                {ratingOptions.map((rating) => (
                  <TouchableOpacity
                    key={rating.value}
                    style={[
                      styles.chip,
                      selectedMinRating === rating.value && styles.chipSelected,
                    ]}
                    onPress={() =>
                      setSelectedMinRating(
                        selectedMinRating === rating.value ? undefined : rating.value
                      )
                    }
                  >
                    <View style={styles.ratingChip}>
                      <Ionicons
                        name="star"
                        size={16}
                        color={selectedMinRating === rating.value ? '#FFF' : '#FFD700'}
                      />
                      <Text
                        style={[
                          styles.chipText,
                          selectedMinRating === rating.value && styles.chipTextSelected,
                        ]}
                      >
                        {rating.label}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Booking Required Filter */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {i18n.t('entertainment.filterBooking') || 'Booking Requirement'}
              </Text>
              <View style={styles.chipContainer}>
                {bookingOptions.map((booking) => (
                  <TouchableOpacity
                    key={booking.value}
                    style={[
                      styles.chip,
                      selectedBooking === booking.value && styles.chipSelected,
                    ]}
                    onPress={() =>
                      setSelectedBooking(
                        selectedBooking === booking.value ? undefined : booking.value
                      )
                    }
                  >
                    <Text
                      style={[
                        styles.chipText,
                        selectedBooking === booking.value && styles.chipTextSelected,
                      ]}
                    >
                      {booking.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <Text style={styles.resetButtonText}>
                {i18n.t('entertainment.resetFilters') || 'Reset'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              <Text style={styles.applyButtonText}>
                {i18n.t('entertainment.applyFilters') || 'Apply Filters'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  chipSelected: {
    backgroundColor: '#CE1126',
    borderColor: '#CE1126',
  },
  chipText: {
    fontSize: 14,
    color: '#333',
  },
  chipTextSelected: {
    color: '#FFF',
    fontWeight: '600',
  },
  ratingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  resetButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CE1126',
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#CE1126',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#CE1126',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});

export default EntertainmentFilters;

