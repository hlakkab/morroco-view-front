import { Destination, Tour } from '../types/tour';
import { SavedItem } from '../types/navigation';

interface MappedTourData {
  tourItems: SavedItem[];
  title: string;
  singleDayView: boolean;
  selectedDay: number;
  totalDays: number;
  destinationsByDate: Record<string, Destination[]>;
}

export const mapTourForDetailsModal = (
  tour: Tour,
  selectedDayIndex: number = 1
): MappedTourData => {
  const destinations = tour.destinations as Destination[];
  
  // Group destinations by date
  const destinationsByDate = destinations.reduce((acc, dest) => {
    const date = dest.date || 'unknown';
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(dest);
    return acc;
  }, {} as Record<string, Destination[]>);

  // Convert destinations to SavedItems with coordinates and day information
  const tourItems: SavedItem[] = destinations.map(dest => {
    const date = dest.date || 'unknown';
    const dayNumber = Object.keys(destinationsByDate).indexOf(date) + 1;
    
    return {
      ...dest,
      day: dayNumber,
      coordinate: dest.coordinate || {
        latitude: Number(dest.coordinates?.split(',')[0]) || 0,
        longitude: Number(dest.coordinates?.split(',')[1]) || 0
      }
    };
  });

  // Sort items by day to ensure proper order
  tourItems.sort((a, b) => (a.day || 1) - (b.day || 1));

  return {
    tourItems,
    title: tour.title,
    singleDayView: true,
    selectedDay: selectedDayIndex,
    totalDays: Object.keys(destinationsByDate).length,
    destinationsByDate
  };
}; 