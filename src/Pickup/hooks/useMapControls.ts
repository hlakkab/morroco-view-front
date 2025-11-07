import { useRef, useState } from 'react';
import MapView, { Region } from 'react-native-maps';

export const useMapControls = () => {
  const mapRef = useRef<MapView | null>(null);
  const [mapVisible, setMapVisible] = useState(false);
  const [mapRegion, setMapRegion] = useState<Region | null>(null);

  const zoomIn = () => {
    if (mapRef.current && mapRegion) {
      const newRegion = {
        ...mapRegion,
        latitudeDelta: mapRegion.latitudeDelta / 2,
        longitudeDelta: mapRegion.longitudeDelta / 2,
      };
      mapRef.current.animateToRegion(newRegion, 300);
    }
  };

  const zoomOut = () => {
    if (mapRef.current && mapRegion) {
      const newRegion = {
        ...mapRegion,
        latitudeDelta: mapRegion.latitudeDelta * 2,
        longitudeDelta: mapRegion.longitudeDelta * 2,
      };
      mapRef.current.animateToRegion(newRegion, 300);
    }
  };

  const animateToRegion = (region: Region) => {
    if (mapRef.current) {
      mapRef.current.animateToRegion(region, 1000);
    }
  };

  return {
    mapRef,
    mapVisible,
    setMapVisible,
    mapRegion,
    setMapRegion,
    zoomIn,
    zoomOut,
    animateToRegion,
  };
};

