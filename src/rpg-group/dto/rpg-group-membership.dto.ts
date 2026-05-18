import { IsNotEmpty } from 'class-validator';

export class GroupMembershipDto {
  @IsNotEmpty()
  rpgGroupId: string;

  @IsNotEmpty()
  memberId: string;
}
