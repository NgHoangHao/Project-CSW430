export interface Book {
    bookId?: string;
    title: string;
    author: string;
    publisher: string;
    publishYear: number;
    category: string;
    url: string;
    status?: "AVAILABLE" | "OUT_OF_STOCK";
    totalAvailableCopy?: number;
    createdAt?: string;
    updatedAt?: string;
    availableBooks?: CopyBook[];
}

export interface CopyBook {
    barcode: string;
    location: string;
}