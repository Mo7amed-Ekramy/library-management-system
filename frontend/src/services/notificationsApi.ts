
import { apiFetch } from "./api";

export const notificationsApi = {
    getNotifications: () =>
        apiFetch("/notifications"),

    markAsRead: (id: string) =>
        apiFetch(`/notifications/${id}/read`, {
            method: "PUT",
        }),

    markAllAsRead: () =>
        apiFetch("/notifications/mark-all-read", {
            method: "POST",
        }),
};
