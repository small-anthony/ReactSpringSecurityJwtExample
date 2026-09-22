import { BASE_URL } from "../../components/config/Config.jsx";
import { getTokenCookie } from "../AuthService.tsx";

export const uploadCv = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const token = getTokenCookie() || localStorage.getItem("token");

    const response = await fetch(`${BASE_URL}/etudiant/cv`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData,
    });

    if (!response.ok) {
        let errorMessage = 'Une erreur est survenue lors du televersement';

        try {
            errorMessage = await response.text();
        } catch (e) {
            throw new Error(errorMessage);
        }

        throw new Error(errorMessage);
    }

    return response.json();
};

export const checkCvExists = async () => {
    const token = getTokenCookie() || localStorage.getItem("token");

    if (!token) return false;

    const response = await fetch(`${BASE_URL}/user/me`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Une erreur est survenue lors de la vérification du CV');
    }

    const data = await response.json();

    return data.hasCv === true;
}