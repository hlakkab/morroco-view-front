export interface Team {
  id: string;
  name: string;
  flag: string; // URL du drapeau
}

export interface Stadium {
  name: string;
  address: string;
  coordinates: string;
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