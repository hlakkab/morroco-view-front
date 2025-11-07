import { useRef, useState } from 'react';
import { Keyboard } from 'react-native';

interface UseLocationSearchProps {
  onLocationSelect: (location: { latitude: number; longitude: number; address: string }) => void;
}

export const useLocationSearch = ({ onLocationSelect }: UseLocationSearchProps) => {
  const googlePlacesRef = useRef(null);
  const [showLocationInput, setShowLocationInput] = useState(true);

  const handleLocationSelect = (data: any, details: any) => {
    const newLocation = {
      latitude: details.geometry.location.lat,
      longitude: details.geometry.location.lng,
      address: data.description,
    };

    onLocationSelect(newLocation);
    setShowLocationInput(false);
    Keyboard.dismiss();
  };

  const focusLocationSearch = () => {
    if (googlePlacesRef.current) {
      // @ts-ignore - textInputRef doesn't exist in the type definitions
      googlePlacesRef.current.textInputRef?.focus();
    }
    setShowLocationInput(true);
  };

  const handleClearLocation = () => {
    setShowLocationInput(true);
    setTimeout(() => {
      focusLocationSearch();
    }, 100);
  };

  return {
    googlePlacesRef,
    showLocationInput,
    setShowLocationInput,
    handleLocationSelect,
    focusLocationSearch,
    handleClearLocation,
  };
};

