import api from "../lib/axios"
import { Book } from "../types/Book"

export const bookService = {
    createBook: async (book: Omit<Book, "bookId" | "status" | "createdAt" | "updatedAt" | "totalAvailableCopy" | "copyBooks">) => {
        const res = await api.post('/book/add-book', book,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        )
        return res
    },
    // query params {page, size, title}
    getBookByPage: async (page: number, size: number, title?: string) => {
        const res = await api.get(`/book/get-book?page=${page}&size=${size}&title=${title}`)
        return res
    },
    getBookDetail: async (bookId: string) => {
        const res = await api.get(`/book/get-detail?bookId=${bookId}`)
        return res
    },
    getCopyBookDetailByBarcode: async (barcode: string) => {
        const res = await api.get(`/book/get-copyBook?barcode=${barcode}`)
        return res
    }
}