export enum EventType {
  Conference = "Conference",
  Festival = "Festival",
  Exhibition = "Exhibition",
  Sports = "Sports",
  Cultural = "Cultural",
  Music = "Music",
  Other = "Other",
}

export interface Event {
  id: string;
  name: string;
  description: string;
  images: string[];
  website: string;
  fromDate: string;
  toDate: string;
  location: string;
  address: string;
  coordinates?: number[];
  mapUrl?: string;
  entryFee?: string;
  saved?: boolean;
  logo?: string;
  isFeatured?: boolean;
  organizer?: string;
  type: string;
} 