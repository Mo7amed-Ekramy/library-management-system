
import { apiFetch } from "./api";

export const userApi = {
    getProfile: () =>
        apiFetch("/users/profile"),

    updateProfile: (data: any) =>
        apiFetch("/users/profile", {
            method: "PUT",
            body: JSON.stringify(data),
        }),

    payFine: (amount?: number) =>
        apiFetch("/users/pay-fine", {
            method: "POST",
            body: JSON.stringify({ amount }),
        }),
};
