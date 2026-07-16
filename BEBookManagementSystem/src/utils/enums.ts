
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  LOCK = 'LOCK',
  FORGOTPASS = 'FORGOTPASS'
}

export enum RoleName {
  ADMIN = 'ADMIN',
  USER = 'USER',
  LIBRARIAN = 'LIBRARIAN',
}

export enum BookStatus {
  AVAILABLE = 'AVAILABLE',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
}

export enum CopyBookStatus {
  AVAILABLE = 'AVAILABLE',
  BORROWED = 'BORROWED',
}

export enum LoanStatus {
  PENDING = 'PENDING',
  REJECTED = 'REJECTED',
  BORROWING = 'BORROWING',
  RETURNED = 'RETURNED',
  OVERDUE = 'OVERDUE',
}