
import { apiFetch } from "./api";

export const loansApi = {
    borrowBook: (bookId: string, periodDays: number = 14, cost: number) =>
        apiFetch("/loans/borrow", {
            method: "POST",
            body: JSON.stringify({ bookId, periodDays, cost }),
        }),

    reserveBook: (bookId: string) =>
        apiFetch("/loans/reserve", {
            method: "POST",
            body: JSON.stringify({ bookId }),
        }),

    returnBook: (loanId: string) =>
        apiFetch("/loans/return", {
            method: "POST",
            body: JSON.stringify({ loanId }),
        }),

    getMyLoans: () =>
        apiFetch("/loans/my"),

    getAllLoans: () =>
        apiFetch("/loans"), // Admin/Manager only
};
