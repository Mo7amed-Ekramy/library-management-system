import { apiFetch } from "./api";

export function getBooks() {
  return apiFetch("/books");
}

export function borrowBook(bookId: number) {
  return apiFetch("/loans/borrow", {
    method: "POST",
    body: JSON.stringify({ bookId }),
  });
}
