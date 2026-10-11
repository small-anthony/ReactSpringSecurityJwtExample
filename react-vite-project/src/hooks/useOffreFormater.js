import {DISCIPLINES} from "../constants/disciplines.js";
import {useTranslation} from "react-i18next";

export function useOffreFormater() {
    const { t, i18n } = useTranslation("main");

    const traduireDiscipline = (valeur) => {
        const disc = DISCIPLINES.find((d) => d.value === valeur);
        return t(`signup_etudiant.disciplines.${disc ? disc.labelKey : valeur}`, valeur);
    };

    const traduireDuree = (valeur) => {
        const nombre = parseInt(valeur, 10);
        return Number.isNaN(nombre) ? valeur : t("creer_offre.weeks", { count: nombre });
    };

    const formaterSalaire = (salaire) => {
        if (!salaire) return t("offres_etudiant.salary_to_discuss");

        const match = salaire.match(/\d+([.,]\d+)?/);
        if (!match) return salaire;

        const montant = match[0];
        const isEn = i18n.language?.startsWith("en");

        return isEn ? `$${montant}/h` : `${montant} $/h`;
    }

    return {
        traduireDiscipline,
        traduireDuree,
        formaterSalaire
    }
}