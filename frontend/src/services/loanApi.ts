import { apiFetch } from "./api";
import { Loan } from "@/lib/types";

export const loanApi = {
    getMyLoans: (): Promise<Loan[]> => apiFetch("/loans/my"),

    getAllLoans: (): Promise<Loan[]> => apiFetch("/loans"),

    borrowBook: (data: { bookId: string; periodDays: number; cost: number }): Promise<{ success: boolean; loanId: string }> =>
        apiFetch("/loans/borrow", {
            method: "POST",
            body: JSON.stringify(data),
        }),

    returnBook: (loanId: string): Promise<{ success: boolean; fine: number }> =>
        apiFetch("/loans/return", {
            method: "POST",
            body: JSON.stringify({ loanId }),
        }),
};
