import { apiFetch } from "./api";
import { Book } from "@/lib/types";

export const bookApi = {
    getAllBooks: (): Promise<Book[]> => apiFetch("/books"),

    getBook: (id: string): Promise<Book> => apiFetch(`/books/${id}`),

    createBook: (data: Omit<Book, "id" | "createdAt">): Promise<Book> =>
        apiFetch("/books", {
            method: "POST",
            body: JSON.stringify(data),
        }),

    updateBook: (id: string, data: Partial<Book>): Promise<Book> =>
        apiFetch(`/books/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        }),

    deleteBook: (id: string): Promise<{ success: boolean }> =>
        apiFetch(`/books/${id}`, {
            method: "DELETE",
        }),
};
