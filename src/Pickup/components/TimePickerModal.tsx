import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import i18n from '../../translations/i18n';

interface TimePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (hour: number, minute: number) => void;
  initialHour?: number;
  initialMinute?: number;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5); // 0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55

const ITEM_HEIGHT = 50;
const VISIBLE_ITEMS = 5;

export const TimePickerModal: React.FC<TimePickerModalProps> = ({
  visible,
  onClose,
  onConfirm,
  initialHour,
  initialMinute,
}) => {
  const [selectedHour, setSelectedHour] = useState(initialHour ?? 12);
  const [selectedMinute, setSelectedMinute] = useState(
    initialMinute !== undefined ? Math.round(initialMinute / 5) * 5 : 0
  );

  const hourScrollRef = useRef<ScrollView>(null);
  const minuteScrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (visible) {
      const hourIndex = HOURS.indexOf(selectedHour);
      const minuteIndex = MINUTES.indexOf(selectedMinute);

      setTimeout(() => {
        if (hourScrollRef.current && hourIndex >= 0) {
          hourScrollRef.current.scrollTo({
            y: hourIndex * ITEM_HEIGHT,
            animated: false,
          });
        }
        if (minuteScrollRef.current && minuteIndex >= 0) {
          minuteScrollRef.current.scrollTo({
            y: minuteIndex * ITEM_HEIGHT,
            animated: false,
          });
        }
      }, 100);
    }
  }, [visible, selectedHour, selectedMinute]);

  const handleHourScroll = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    const hour = HOURS[Math.max(0, Math.min(index, HOURS.length - 1))];
    setSelectedHour(hour);
  };

  const handleMinuteScroll = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    const minute = MINUTES[Math.max(0, Math.min(index, MINUTES.length - 1))];
    setSelectedMinute(minute);
  };

  const handleConfirm = () => {
    onConfirm(selectedHour, selectedMinute);
    onClose();
  };

  const renderPickerItem = (value: number, isSelected: boolean) => (
    <View
      style={[
        styles.pickerItem,
        isSelected && styles.pickerItemSelected,
      ]}
    >
      <Text
        style={[
          styles.pickerItemText,
          isSelected && styles.pickerItemTextSelected,
        ]}
      >
        {String(value).padStart(2, '0')}
      </Text>
    </View>
  );

  const renderHourPicker = () => {
    const paddingTop = (VISIBLE_ITEMS - 1) * ITEM_HEIGHT * 0.5;
    const paddingBottom = (VISIBLE_ITEMS - 1) * ITEM_HEIGHT * 0.5;

    return (
      <ScrollView
        ref={hourScrollRef}
        style={styles.pickerColumn}
        contentContainerStyle={{
          paddingTop,
          paddingBottom,
        }}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onMomentumScrollEnd={handleHourScroll}
        onScrollEndDrag={handleHourScroll}
      >
        {HOURS.map((hour) => (
          <View key={hour} style={styles.pickerItemContainer}>
            {renderPickerItem(hour, hour === selectedHour)}
          </View>
        ))}
      </ScrollView>
    );
  };

  const renderMinutePicker = () => {
    const paddingTop = (VISIBLE_ITEMS - 1) * ITEM_HEIGHT * 0.5;
    const paddingBottom = (VISIBLE_ITEMS - 1) * ITEM_HEIGHT * 0.5;

    return (
      <ScrollView
        ref={minuteScrollRef}
        style={styles.pickerColumn}
        contentContainerStyle={{
          paddingTop,
          paddingBottom,
        }}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onMomentumScrollEnd={handleMinuteScroll}
        onScrollEndDrag={handleMinuteScroll}
      >
        {MINUTES.map((minute) => (
          <View key={minute} style={styles.pickerItemContainer}>
            {renderPickerItem(minute, minute === selectedMinute)}
          </View>
        ))}
      </ScrollView>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{i18n.t('reservation.selectTime')}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.pickerContainer}>
            <View style={styles.pickerWrapper}>
              {renderHourPicker()}
              <Text style={styles.pickerSeparator}>:</Text>
              {renderMinutePicker()}
            </View>
            <View style={styles.pickerHighlight} />
          </View>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={handleConfirm}
            >
              <Text style={styles.confirmButtonText}>{i18n.t('reservation.confirm') || i18n.t('common.close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  pickerContainer: {
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    position: 'relative',
    marginVertical: 20,
  },
  pickerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  pickerColumn: {
    flex: 1,
    maxWidth: 100,
  },
  pickerItemContainer: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerItem: {
    width: 60,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  pickerItemSelected: {
    // No background color for selected items
  },
  pickerItemText: {
    fontSize: 20,
    color: '#999',
    fontWeight: '400',
  },
  pickerItemTextSelected: {
    color: '#008060',
    fontWeight: '600',
  },
  pickerSeparator: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 8,
  },
  pickerHighlight: {
    position: 'absolute',
    top: ITEM_HEIGHT * 2,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#008060',
    backgroundColor: 'rgba(0, 128, 96, 0.05)',
    pointerEvents: 'none',
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  button: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButton: {
    backgroundColor: '#008060',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

