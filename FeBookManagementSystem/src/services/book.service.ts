import api from "../lib/axios"
import { Book } from "../types/Book"

import { BACKEND_URL } from "@env";
import EncryptedStorage from "react-native-encrypted-storage";

export const bookService = {
    createBook: async (formData: FormData) => {
        const accessToken = await EncryptedStorage.getItem('accessToken');
        const baseUrl = BACKEND_URL || 'http://10.0.2.2:3000/api';
        const res = await fetch(`${baseUrl}/book/add-book`, {
            method: 'POST',
            headers: {
                ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
            },
            body: formData,
        });
        const data = await res.json();
        return { status: res.status, data };
    },
    updateBook: async (bookId: string, formData: FormData) => {
        const accessToken = await EncryptedStorage.getItem('accessToken');
        const baseUrl = BACKEND_URL || 'http://10.0.2.2:3000/api';
        const res = await fetch(`${baseUrl}/book/update?bookId=${bookId}`, {
            method: 'PUT',
            headers: {
                ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
            },
            body: formData,
        });
        const data = await res.json();
        return { status: res.status, data };
    },
    deleteBook: async (bookId: string) => {
        const res = await api.delete(`/book/delete?bookId=${bookId}`)
        return res;
    },
    addCopyBook: async (data: { barcode: string; location: string; bookId: string }) => {
        const res = await api.post('/book/add-copyBook', data)
        return res;
    },
    deleteCopyBook: async (copyBookId: string) => {
        const res = await api.delete(`/book/delete-copyBook?copyBookId=${copyBookId}`)
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