import { useState } from 'react';

interface UseReservationFormReturn {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  selectedTime: Date;
  setSelectedTime: (date: Date) => void;
  hotelLocation: string;
  setHotelLocation: (location: string) => void;
  destination: [number, number] | null;
  setDestination: (destination: [number, number] | null) => void;
  passengers: number;
  setPassengers: (count: number) => void;
  luggage: number;
  setLuggage: (count: number) => void;
  name: string;
  setName: (name: string) => void;
  email: string;
  setEmail: (email: string) => void;
  phone: string;
  setPhone: (phone: string) => void;
  specialRequests: string;
  setSpecialRequests: (requests: string) => void;
  showDatePicker: boolean;
  setShowDatePicker: (show: boolean) => void;
  showTimePicker: boolean;
  setShowTimePicker: (show: boolean) => void;
  showModernDatePicker: boolean;
  setShowModernDatePicker: (show: boolean) => void;
  resetForm: () => void;
}

export const useReservationForm = (): UseReservationFormReturn => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [hotelLocation, setHotelLocation] = useState('');
  const [destination, setDestination] = useState<[number, number] | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showModernDatePicker, setShowModernDatePicker] = useState(false);
  const [passengers, setPassengers] = useState(1);
  const [luggage, setLuggage] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  const resetForm = () => {
    setSelectedDate(new Date());
    setSelectedTime(new Date());
    setHotelLocation('');
    setDestination(null);
    setPassengers(1);
    setLuggage(0);
    setName('');
    setEmail('');
    setPhone('');
    setSpecialRequests('');
  };

  return {
    selectedDate,
    setSelectedDate,
    selectedTime,
    setSelectedTime,
    hotelLocation,
    setHotelLocation,
    destination,
    setDestination,
    passengers,
    setPassengers,
    luggage,
    setLuggage,
    name,
    setName,
    email,
    setEmail,
    phone,
    setPhone,
    specialRequests,
    setSpecialRequests,
    showDatePicker,
    setShowDatePicker,
    showTimePicker,
    setShowTimePicker,
    showModernDatePicker,
    setShowModernDatePicker,
    resetForm,
  };
};

