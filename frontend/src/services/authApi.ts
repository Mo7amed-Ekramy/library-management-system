
import { apiFetch } from "./api";
import { User, LoginCredentials, RegisterData } from "@/lib/types";

export const authApi = {
    login: (credentials: LoginCredentials) =>
        apiFetch("/auth/login", {
            method: "POST",
            body: JSON.stringify(credentials)
        }),

    register: (data: RegisterData) =>
        apiFetch("/auth/register", {
            method: "POST",
            body: JSON.stringify(data)
        }),

    updateProfile: (data: Partial<User>) =>
        apiFetch("/users/profile", {
            method: "PUT",
            body: JSON.stringify(data)
        }),

    getCurrentUser: () =>
        apiFetch("/auth/me"),

    getAllUsers: () =>
        apiFetch("/users"),

    updateUserRole: (userId: string, role: string) =>
        apiFetch(`/users/${userId}/role`, {
            method: "PUT",
            body: JSON.stringify({ role })
        }),

    clearUserFines: (userId: string) =>
        apiFetch(`/users/${userId}/clear-fine`, {
            method: "POST"
        }),
};
