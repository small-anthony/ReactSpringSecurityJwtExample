import { BASE_URL } from "../../components/config/Config.jsx";

export async function getNotifications(authHeader) {
    const response = await fetch(`${BASE_URL}/notifications`, {
        method: "GET",
        headers: authHeader,
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Erreur lors de la récupération des notifications");
    }

    return response.json();
}

export async function dismissNotificationApi(id, authHeader) {
    const response = await fetch(`${BASE_URL}/notifications/dismiss`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...authHeader,
        },
        body: JSON.stringify(id),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Erreur lors de la mise à jour de la notification");
    }

    return response.json();
}

export async function deleteNotificationApi(id, authHeader) {
    const response = await fetch(`${BASE_URL}/notifications/${id}`, {
        method: "DELETE",
        headers: authHeader,
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Erreur lors de la suppression de la notification");
    }
}