export interface RPGGroup {
  id: string;
  name: string;
  description: string;
  genre: string;
  nivel: 'novato' | 'experiente';
  maxPlayers: number;
  currentPlayers: number;
  schedule: string;
  platform: 'presencial' | 'online' | 'hibrido';
  location?: string | null;
  image?: string | null;
  masterId: string;
  tags?: string[];
}
