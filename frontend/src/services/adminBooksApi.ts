import { apiFetch } from "./api";
import { Book } from "@/lib/types";

export function getBooksAdmin(): Promise<Book[]> {
  return apiFetch("/books");
}

export function createBookAdmin(book: Partial<Book>) {
  return apiFetch("/books", {
    method: "POST",
    body: JSON.stringify(book),
  });
}

export function updateBookAdmin(id: number, book: Partial<Book>) {
  return apiFetch(`/books/${id}`, {
    method: "PUT",
    body: JSON.stringify(book),
  });
}

export function deleteBookAdmin(id: number) {
  return apiFetch(`/books/${id}`, {
    method: "DELETE",
  });
}
