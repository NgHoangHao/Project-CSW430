
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE='INACTIVE',
  LOCK = 'LOCK',
  FORGOTPASS='FORGOTPASS'
}

export enum RoleName {
  ADMIN = 'ADMIN',
  USER = 'USER',
  LIBRARIAN = 'LIBRARIAN',
}

export enum BookStatus {
  AVAILABLE = 'AVAILABLE',
  OUT_OF_STOCK = 'OUT OF STOCK',
}

export enum CopyBookStatus {
  AVAILABLE = 'AVAILABLE',
  BORROWED = 'BORROWED',
}

export enum LoanStatus {
  BORROWING = 'BORROWING',
  RETURNED = 'RETURNED',
  OVERDUE = 'OVERDUE',
}