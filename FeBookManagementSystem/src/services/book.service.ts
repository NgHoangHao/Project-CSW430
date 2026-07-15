import api from "../lib/axios"
import { Book } from "../types/Book"

export const bookService = {
    createBook: async (formData: FormData) => {
        const res = await api.post('/book/add-book', formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        )
        return res;
    },
    updateBook: async (bookId: string, formData: FormData) => {
        const res = await api.put(`/book/update?bookId=${bookId}`, formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        )
        return res;
    },
    deleteBook: async (bookId: string) => {
        const res = await api.delete(`/book/delete?bookId=${bookId}`)
        return res;
    },
    addCopyBook: async (data: { barcode: string; location: string; bookId: string }) => {
        const res = await api.post('/book/add-copy-book', data)
        return res;
    },
    deleteCopyBook: async (copyBookId: string) => {
        const res = await api.delete(`/book/delete-copy-book?copyBookId=${copyBookId}`)
        return res;
    },
   getBookByPage: async (page: number, size: number, title?: string) => {
    const res = await api.get("/book/get-book", {
        params: {
            page,
            size,
            ...(title?.trim() ? { title } : {}),
        },
    });
    return res;
},
    getBookDetail: async (bookId: string) => {
        const res = await api.get(`/book/get-detail?bookId=${bookId}`)
        return res;
    },
    getCopyBookDetailByBarcode: async (barcode: string) => {
        const res = await api.get(`/book/get-copyBook?barcode=${barcode}`)
        return res;
    }
}