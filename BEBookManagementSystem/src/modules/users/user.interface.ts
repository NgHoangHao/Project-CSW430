export interface User {
    id: number;
    name: string;
    email: string;
    created_at: Date;
}

export interface CreateUserDto {
    name: string;
    email: string;
}