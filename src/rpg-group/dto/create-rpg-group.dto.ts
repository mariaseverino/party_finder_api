import { IsNotEmpty } from 'class-validator';

export class CreateRpgGroupRequestBodyDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  genre: string;

  @IsNotEmpty()
  nivel: 'novato' | 'experiente';

  @IsNotEmpty()
  maxPlayers: number;

  @IsNotEmpty()
  currentPlayers: number;

  @IsNotEmpty()
  schedule: string;

  @IsNotEmpty()
  platform: 'presencial' | 'online' | 'hibrido';

  location?: string;

  image?: string;

  @IsNotEmpty()
  masterId: string;

  tags?: string[];
}

export class CreateRpgGroupDto {
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
}
