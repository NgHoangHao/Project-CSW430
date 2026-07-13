import { UserStatus } from "../../utils/enums";

export interface userInfo{
    userName:string;
    email:string;
    borrowingBooks:number;
    expiredBooks:number;
    totalBorrowedBook: number;
    status:UserStatus;
}