import {BASE_URL} from "../../components/config/Config.jsx";

export const uploadCv = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const token = localStorage.getItem("token");

    const response = await fetch(`${BASE_URL}/etudiants/cv`, {
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