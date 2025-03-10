import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Button from '../components/Button';

interface ReservationPopupProps {
  onClose: () => void;
  title: string;
  price: number;
}

const ReservationPopup: React.FC<ReservationPopupProps> = ({ onClose, title, price }) => {
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [hotelLocation, setHotelLocation] = useState('');
  
  const handleSubmit = () => {
    // Handle reservation submission
    console.log({ pickupDate, pickupTime, hotelLocation });
    onClose();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.popup}>
        <View style={styles.header}>
          <Text style={styles.title}>Reserve Your Transport</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />
        
        <View style={styles.content}>
          <View style={styles.transportInfo}>
            <View style={styles.iconContainer}>
              <Ionicons name="car" size={28} color="#fff" />
            </View>
            <View style={styles.transportDetails}>
              <Text style={styles.transportTitle}>{title}</Text>
              <Text style={styles.transportPrice}>{price} Dh per group</Text>
            </View>
          </View>
          
          <View style={styles.routeContainer}>
            <View style={styles.routeItem}>
              <View style={styles.routeIconContainer}>
                <MaterialIcons name="flight" size={20} color="#fff" />
              </View>
              <Text style={styles.routeText}>Marrakech Airport</Text>
            </View>
            <View style={styles.routeLine}>
              <View style={styles.routeDash}></View>
              <View style={styles.routeDash}></View>
              <View style={styles.routeDash}></View>
              <View style={styles.routeDash}></View>
            </View>
            <View style={styles.routeItem}>
              <View style={[styles.routeIconContainer, styles.destinationIconContainer]}>
                <MaterialIcons name="hotel" size={20} color="#fff" />
              </View>
              <Text style={styles.routeText}>Your Hotel in Marrakech</Text>
            </View>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>When are you arriving?</Text>
            
            <View style={styles.dateTimeContainer}>
              <View style={styles.dateContainer}>
                <Text style={styles.inputLabel}>Date</Text>
                <TouchableOpacity style={styles.dateInput}>
                  <Ionicons name="calendar" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="DD/MM/YYYY"
                    value={pickupDate}
                    onChangeText={setPickupDate}
                    placeholderTextColor="#999"
                  />
                </TouchableOpacity>
              </View>
              
              <View style={styles.timeContainer}>
                <Text style={styles.inputLabel}>Time</Text>
                <TouchableOpacity style={styles.timeInput}>
                  <Ionicons name="time" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="HH:MM"
                    value={pickupTime}
                    onChangeText={setPickupTime}
                    placeholderTextColor="#999"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Where are you staying?</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="location" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your hotel name or address"
                value={hotelLocation}
                onChangeText={setHotelLocation}
                placeholderTextColor="#999"
              />
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Button 
            title="Confirm Reservation" 
            style={styles.confirmButton}
            icon={<Ionicons name="checkmark-circle" size={20} color="#fff" style={{ marginRight: 8 }} />}
            onPress={handleSubmit}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  popup: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginBottom: 16,
  },
  content: {
    paddingHorizontal: 20,
  },
  transportInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#CE1126',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  transportDetails: {
    flex: 1,
  },
  transportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  transportPrice: {
    fontSize: 14,
    color: '#CE1126',
    fontWeight: '500',
  },
  routeContainer: {
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  routeIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#CE1126',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  destinationIconContainer: {
    backgroundColor: '#008060',
  },
  routeLine: {
    height: 40,
    width: 2,
    marginLeft: 17,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  routeDash: {
    width: 2,
    height: 6,
    backgroundColor: '#ddd',
  },
  routeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  formContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dateContainer: {
    flex: 1,
    marginRight: 8,
  },
  timeContainer: {
    flex: 1,
    marginLeft: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 50,
    backgroundColor: '#f9f9f9',
  },
  timeInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 50,
    backgroundColor: '#f9f9f9',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    height: 50,
    backgroundColor: '#f9f9f9',
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 14,
    color: '#333',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  confirmButton: {
    backgroundColor: '#008060',
  },
});

export default ReservationPopup; 