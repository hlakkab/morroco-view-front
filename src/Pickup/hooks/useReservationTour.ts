import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCopilot } from 'react-native-copilot';

const TOUR_FLAG = '@reservationPopupTourSeen';

export const useReservationTour = () => {
  const { start: startTour, copilotEvents, visible, stop: stopTour } = useCopilot();
  const [tourStarted, setTourStarted] = useState(false);
  const [hasSeenTour, setHasSeenTour] = useState<boolean | null>(null);

  // ─── 1. Load tour status ─────────────────
  useEffect(() => {
    AsyncStorage.getItem(TOUR_FLAG)
      .then(value => {
        setHasSeenTour(value === 'true');
      })
      .catch(error => {
        console.error('Error reading Reservation Popup tour status:', error);
        setHasSeenTour(false);
      });
  }, []);

  // ─── 2. Auto-start tour if not seen ──────────
  useEffect(() => {
    if (hasSeenTour === false && !tourStarted && !visible) {
      const timer = setTimeout(() => {
        startTour();
        setTourStarted(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [hasSeenTour, startTour, tourStarted, visible]);

  // ─── 3. Save tour status on stop ────────
  useEffect(() => {
    const handleStop = async () => {
      try {
        await AsyncStorage.setItem(TOUR_FLAG, 'true');
        setHasSeenTour(true);
        setTourStarted(false);
      } catch (error) {
        console.error('Error saving Reservation Popup tour status:', error);
      }
    };

    const handleStepChange = (step: any) => {
      // Handle step changes if needed
    };

    copilotEvents.on('stop', handleStop);
    copilotEvents.on('stepChange', handleStepChange);

    return () => {
      copilotEvents.off('stop', handleStop);
      copilotEvents.off('stepChange', handleStepChange);
    };
  }, [copilotEvents]);

  // ─── 4. Clean up tour on unmount (iOS fix) ────────
  useEffect(() => {
    return () => {
      stopTour();
    };
  }, [stopTour]);

  const handleStartTour = () => {
    setTourStarted(true);
    startTour();
  };

  return {
    visible,
    handleStartTour,
  };
};

