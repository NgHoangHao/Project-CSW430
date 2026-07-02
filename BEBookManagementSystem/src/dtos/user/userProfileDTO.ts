import { UserStatus } from "../../utils/enums";

export class UserProfileDto {
  userId: string;
  userName: string;
  email: string;
  status: UserStatus;
  credit: number;


  constructor(partial: Partial<UserProfileDto>) {
    Object.assign(this, partial);
  }
}