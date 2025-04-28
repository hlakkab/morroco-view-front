import { Match } from "./match";
import { HotelPickup } from "./transport";

export type Ticket = {
  id: string;
  matchId: string;
  createdAt: string;
  updatedAt: string;
  type: "MATCH" | "PICKUP" | "E_SIM";
  object: Match | HotelPickup;
};

export type TicketState = {
  tickets: Ticket[];
  loading: boolean;
  error: string | null;
};