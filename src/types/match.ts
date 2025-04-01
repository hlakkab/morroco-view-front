export interface Team {
  id: string;
  name: string;
  flag: string; // URL du drapeau
}

export interface Stadium {
  name: string;
  city: string;
  address: string;
  coordinates: string;
  mapId: string;
}

export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamShort: string;
  awayTeamShort: string;
  date: string;
  spot: Stadium;
  about?: string;
  saved: boolean;
}