import { Match } from "./match";
import { HotelPickup } from "./transport";

// API Response structure for ticket object (from list endpoint - simplified)
export interface PickupTicketObject {
  id: string;
  date: string;
  title: string;
  city: string;
  price: number;
  location: [number, number]; // [latitude, longitude]
}

// API Response structure for ticket object (from detail endpoint - full structure)
export interface PickupTicketDetailObject {
  pickup: {
    id: string;
    title: string;
    price: number;
    city: string;
    isPrivate: boolean;
    model?: string;
    immId?: string;
  };
  reservation: {
    id: string;
    date: string;
    time: string;
    place: {
      city: string;
      destination: [number, number]; // [latitude, longitude]
    };
  };
}

export interface MatchTicketObject {
  id: string;
  eventId?: string;
  homeTeam: string;
  homeTeamShort?: string;
  awayTeam: string;
  awayTeamShort?: string;
  spot: {
    id: string;
    code: string;
    name: string;
    description?: string;
    type?: string;
    spotType?: string;
    address?: string;
    city: string;
  };
  date: string;
}

export type Ticket = {
  id: string;
  images: string[];
  saved: boolean;
  clientId?: string;
  elementId: string;
  type: "MATCH" | "PICKUP" | "E_SIM";
  price: number;
  status: "PAID" | "PENDING" | "CANCELLED";
  object: MatchTicketObject | PickupTicketObject;
  // Legacy fields for backward compatibility
  createdAt?: string;
  updatedAt?: string;
  matchId?: string;
};

export type TicketState = {
  tickets: Ticket[];
  loading: boolean;
  error: string | null;
  selectedTicket: Ticket | null;
  loadingDetail: boolean;
  errorDetail: string | null;
};