export interface Tour {
  startDate: string;
  id: string;
  title: string;
  imageUrl: string;
  city: string;
  duration: number;
  price: number;
  destinations: string[];
  isEditable: boolean;
} 