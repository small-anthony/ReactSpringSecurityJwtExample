import { useState } from "react";
import { useTranslation } from "react-i18next";
import { DISCIPLINES } from "../../constants/disciplines.js";
import { DUREES } from "../../constants/durees.js";
import {useOffreFormater} from "../../hooks/useOffreFormater.js";

export default function OffreForm({initialValues = {}, onSubmit, id = "offreForm" }) {
    const { t, i18n } = useTranslation("main");
    const isEn = i18n.language?.startsWith("en");
    const { traduireDuree, formaterSalaire } = useOffreFormater();

    const [formData, setFormData] = useState({
        id: initialValues.id || null,
        titre: initialValues.titre || "",
        nomEntreprise: initialValues.nomEntreprise || "",
        discipline: initialValues.discipline || "",
        duree: initialValues.duree || "",
        salaire: initialValues.salaire ? (initialValues.salaire.toString().match(/\d+([.,]\d+)?/)?.[0] || "") : "",
        exigences: initialValues.exigences || "",
        description: initialValues.description || "",
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const handleSalaireBlur = () => {
        const montant = parseFloat(formData.salaire);
        if (!isNaN(montant) && montant >= 0) {
            setFormData((prev) => ({ ...prev, salaire: montant.toFixed(2) }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.titre.trim()) newErrors.titre = "titre";
        if (!formData.nomEntreprise.trim()) newErrors.nomEntreprise = "nomEntreprise";
        if (!formData.discipline.trim()) newErrors.discipline = "discipline";

        if (!formData.salaire.toString().trim()) {
            newErrors.salaire = "required";
        } else {
            const montant = parseFloat(formData.salaire);
            if (isNaN(montant) || montant < 0 || montant > 50) {
                newErrors.salaire = "format";
            }
        }

        if (!formData.duree.trim()) newErrors.duree = "duree";
        if (!formData.exigences.trim()) newErrors.exigences = "exigences";

        if (!formData.description.trim()) {
            newErrors.description = "description";
        } else if (formData.description.trim().length < 20) {
            newErrors.description = "descriptionLength";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;
        onSubmit(formData);
    };

    return (
        <form id={id} onSubmit={handleFormSubmit} noValidate className="space-y-4">
            <div>
                <label className="ds-label">
                    {t("creer_offre.titre")} <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    name="titre"
                    value={formData.titre}
                    onChange={handleChange}
                    placeholder={t("creer_offre.placeholders.titre")}
                    className={`ds-input ${
                        errors.titre ? "ds-input-error" : ""
                    }`}
                />
                {errors.titre && (
                    <p className="ds-error-text">
                        {t(`creer_offre.errors.${errors.titre}`)}
                    </p>
                )}
            </div>

            <div>
                <label className="ds-label">
                    {t("creer_offre.nomEntreprise")}
                </label>
                <input
                    type="text"
                    name="nomEntreprise"
                    value={formData.nomEntreprise}
                    readOnly
                    className="ds-input-readonly"
                />
            </div>

            <div>
                <label className="ds-label">
                    {t("creer_offre.discipline")} <span className="text-red-500">*</span>
                </label>
                <select
                    name="discipline"
                    value={formData.discipline}
                    onChange={handleChange}
                    className={`ds-input ${
                        errors.discipline ? "ds-input-error" : ""
                    }`}
                >
                    <option value="">{t("creer_offre.placeholders.discipline")}</option>
                    {DISCIPLINES.map((disc) => (
                        <option key={disc.value} value={disc.value}>
                            {t(`signup_etudiant.disciplines.${disc.labelKey}`)}
                        </option>
                    ))}
                </select>
                {errors.discipline && (
                    <p className="ds-error-text">
                        {t(`creer_offre.errors.${errors.discipline}`)}
                    </p>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="ds-label">
                        {t("creer_offre.salaire")} <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center w-full flex-nowrap">
                        {isEn && (
                            <span className={`bg-slate-100 border border-r-0 font-semibold px-3 py-2.5 text-sm rounded-l-lg ${
                                errors.salaire ? "border-red-500 bg-red-50 text-red-600" : "border-slate-300 text-slate-600"
                            }`}>$</span>
                        )}
                        <input
                            type="number"
                            step="0.01"
                            name="salaire"
                            value={formData.salaire}
                            onChange={handleChange}
                            onBlur={handleSalaireBlur}
                            placeholder={t("creer_offre.placeholders.salaire")}
                            className={`min-w-0 flex-1 ds-input ${
                                isEn ? "rounded-none" : "rounded-r-none"
                            } ${errors.salaire ? "ds-input-error" : ""}`}
                        />
                        <span className={`bg-slate-100 border border-l-0 font-semibold px-3 py-2.5 text-sm rounded-r-lg whitespace-nowrap select-none ${
                            errors.salaire ? "border-red-500 bg-red-50 text-red-600" : "border-slate-300 text-slate-600"
                        }`}>
              {isEn ? "/h" : "$/h"}
            </span>
                    </div>
                    {errors.salaire && (
                        <p className="ds-error-text">
                            {t(`creer_offre.errors.salaire.${errors.salaire}`)}
                        </p>
                    )}
                </div>

                <div>
                    <label className="ds-label">
                        {t("creer_offre.duree")} <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="duree"
                        value={formData.duree}
                        onChange={handleChange}
                        className={`ds-input ${
                            errors.duree ? "ds-input-error" : ""
                        }`}
                    >
                        <option value="">{t("creer_offre.placeholders.duree")}</option>
                        {DUREES.map((dur) => (
                            <option key={dur} value={dur}>
                                {traduireDuree(dur)}
                            </option>
                        ))}
                    </select>
                    {errors.duree && (
                        <p className="ds-error-text">
                            {t(`creer_offre.errors.${errors.duree}`)}
                        </p>
                    )}
                </div>
            </div>

            <div>
                <label className="ds-label">
                    {t("creer_offre.exigences")} <span className="text-red-500">*</span>
                </label>
                <textarea
                    name="exigences"
                    rows={2}
                    value={formData.exigences}
                    onChange={handleChange}
                    placeholder={t("creer_offre.placeholders.exigences")}
                    className={`ds-input ${
                        errors.exigences ? "ds-input-error" : ""
                    }`}
                />
                {errors.exigences && (
                    <p className="ds-error-text">
                        {t(`creer_offre.errors.${errors.exigences}`)}
                    </p>
                )}
            </div>

            <div>
                <label className="ds-label">
                    {t("creer_offre.description")} <span className="text-red-500">*</span>
                </label>
                <textarea
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    placeholder={t("creer_offre.placeholders.description")}
                    className={`ds-input ${
                        errors.description ? "ds-input-error" : ""
                    }`}
                />
                {errors.description && (
                    <p className="ds-error-text">
                        {t(`creer_offre.errors.${errors.description}`)}
                    </p>
                )}
            </div>
        </form>
    );
}