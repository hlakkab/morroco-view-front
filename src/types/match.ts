export interface Team {
    id: string;
    name: string;
    flag: string; // URL du drapeau
  }
  
  export interface Match {
    id: string;
    status: string;
    teams: string;
    homeTeam?: Team;
    awayTeam?: Team;
    team1Image?: string;
    team2Image?: string;
    image?: string;
    date: string;
    stadium?: string;
    location?: {
        address: string;
        mapUrl?: string;
      };
    about?: string;
    isSaved?: boolean;
  }