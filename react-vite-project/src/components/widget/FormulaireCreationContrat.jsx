import React, { useState, useMemo } from "react";
import {
  FileText,
  PlusCircle,
  Briefcase,
  Building,
  User,
  AlertTriangle,
  RefreshCw,
  Calendar,
  Clock,
  DollarSign
} from "lucide-react";
import { useTranslation } from "react-i18next";

export default function FormulaireCreationContrat({
  candidatures = [],
  submitting = false,
  onCreerContrat,
  onErreur
}) {
  const { t, i18n } = useTranslation("main");
  const isEn = i18n.language?.startsWith("en");

  const [selectedCandidatureId, setSelectedCandidatureId] = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [horaire, setHoraire] = useState("");
  const [salaire, setSalaire] = useState("");
  const [descriptionTaches, setDescriptionTaches] = useState("");
  const [conditions, setConditions] = useState("");
  const [errors, setErrors] = useState({});

  const selectedCandidature = useMemo(() => {
    return candidatures.find(
      (c) => String(c.candidatureId) === String(selectedCandidatureId)
    );
  }, [candidatures, selectedCandidatureId]);

  const nombreSemaines = useMemo(() => {
    if (!dateDebut || !dateFin) return null;
    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);
    const diffDays = Math.ceil((fin - debut) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return null;
    return Math.max(1, Math.round(diffDays / 7));
  }, [dateDebut, dateFin]);

  const clearError = (field) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleCandidatureChange = (e) => {
    const candId = e.target.value;
    setSelectedCandidatureId(candId);
    clearError("candidature");

    const cand = candidatures.find((c) => String(c.candidatureId) === String(candId));
    if (cand) {
      if (cand.salaireOffre) {
        const match = cand.salaireOffre.match(/\d+([.,]\d+)?/);
        if (match) {
          const num = parseFloat(match[0].replace(",", "."));
          if (!isNaN(num)) {
            setSalaire(num.toFixed(2));
          } else {
            setSalaire("");
          }
        } else {
          setSalaire("");
        }
      } else {
        setSalaire("");
      }

      if (cand.descriptionOffre) {
        setDescriptionTaches(cand.descriptionOffre);
      } else {
        setDescriptionTaches("");
      }
    } else {
      setSalaire("");
      setDescriptionTaches("");
    }
  };

  const handleDateDebutChange = (e) => {
    setDateDebut(e.target.value);
    clearError("dateDebut");
    if (errors.dateFin === "order") {
      clearError("dateFin");
    }
  };

  const handleDateFinChange = (e) => {
    setDateFin(e.target.value);
    clearError("dateFin");
  };

  const handleHoraireChange = (e) => {
    setHoraire(e.target.value);
    clearError("horaire");
  };

  const handleSalaireChange = (e) => {
    let val = e.target.value;

    if (val.length > 6) {
      val = val.slice(0, 6);
    }

    setSalaire(val);

    if (val !== "") {
      const montant = parseFloat(val);
      if (isNaN(montant) || montant < 0 || montant > 50) {
        setErrors((prev) => ({ ...prev, salaire: "format" }));
      } else {
        clearError("salaire");
      }
    } else {
      clearError("salaire");
    }
  };

  const handleSalaireBlur = () => {
    if (!salaire) return;
    const montant = parseFloat(salaire);
    if (isNaN(montant) || montant < 0 || montant > 50) {
      setErrors((prev) => ({ ...prev, salaire: "format" }));
    } else {
      setSalaire(montant.toFixed(2));
      clearError("salaire");
    }
  };

  const handleTachesChange = (e) => {
    setDescriptionTaches(e.target.value);
    clearError("descriptionTaches");
  };

  const handleConditionsChange = (e) => {
    setConditions(e.target.value);
    clearError("conditions");
  };

  const validate = () => {
    const newErrors = {};

    if (!selectedCandidatureId) {
      newErrors.candidature = "required";
    } else if (selectedCandidature?.contratExiste) {
      newErrors.candidature = "already_exists";
    }

    if (!dateDebut) {
      newErrors.dateDebut = "required";
    }

    if (!dateFin) {
      newErrors.dateFin = "required";
    } else if (dateDebut && new Date(dateFin) < new Date(dateDebut)) {
      newErrors.dateFin = "order";
    }

    if (!horaire.trim()) {
      newErrors.horaire = "required";
    }

    if (!salaire.toString().trim()) {
      newErrors.salaire = "required";
    } else {
      const montant = parseFloat(salaire);
      if (isNaN(montant) || montant < 0 || montant > 50) {
        newErrors.salaire = "format";
      }
    }

    if (!descriptionTaches.trim()) {
      newErrors.descriptionTaches = "required";
    } else if (descriptionTaches.trim().length < 20) {
      newErrors.descriptionTaches = "minLength";
    }

    if (!conditions.trim()) {
      newErrors.conditions = "required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      onErreur?.(t("contrats.alerts.error_missing_fields"));
      return;
    }

    let finalSalaire = salaire.toString().trim();
    if (finalSalaire && !finalSalaire.toLowerCase().includes("h")) {
      finalSalaire = finalSalaire.replace("$", "").trim() + " $/h";
    }

    const ok = await onCreerContrat({
      candidatureId: Number(selectedCandidatureId),
      dateDebut,
      dateFin,
      horaire: horaire.trim(),
      salaire: finalSalaire,
      descriptionTaches: descriptionTaches.trim(),
      conditions: conditions.trim()
    });

    if (ok) {
      setSelectedCandidatureId("");
      setDateDebut("");
      setDateFin("");
      setHoraire("");
      setSalaire("");
      setDescriptionTaches("");
      setConditions("");
      setErrors({});
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
      <div className="flex items-center justify-between pb-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              {t("contrats.tabs.create")}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              {t("contrats.form.title")}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <div>
          <label
            htmlFor="select-candidature"
            className="block text-sm font-semibold text-slate-700 mb-1.5"
          >
            {t("contrats.candidature_select.label")} <span className="text-red-500">*</span>
          </label>
          <select
            id="select-candidature"
            value={selectedCandidatureId}
            onChange={handleCandidatureChange}
            className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-colors bg-white ${
              errors.candidature
                ? "border-red-500 bg-red-50 text-slate-900"
                : "border-slate-300 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            }`}
          >
            <option value="">
              {t("contrats.candidature_select.placeholder")}
            </option>
            {candidatures.map((c) => (
              <option key={c.candidatureId} value={c.candidatureId}>
                {c.etudiantPrenom} {c.etudiantNom} ({c.etudiantMatricule}) — {c.nomEntreprise} ({c.titreOffre}){" "}
                {c.contratExiste ? `— [${t("contrats.candidature_select.already_contracted")}]` : ""}
              </option>
            ))}
          </select>
          {errors.candidature ? (
            <p className="text-red-500 text-xs mt-1.5">
              {errors.candidature === "already_exists"
                ? t("contrats.form.errors.already_exists")
                : t("contrats.form.errors.candidature")}
            </p>
          ) : (
            <p className="mt-1 text-xs text-slate-500">
              {t("contrats.candidature_select.help")}
            </p>
          )}
        </div>

        {selectedCandidature && (
          <div
            id="candidature-selected-card"
            className={`p-5 rounded-xl border transition-all ${
              selectedCandidature.contratExiste
                ? "bg-amber-50/80 border-amber-200"
                : "bg-blue-50/60 border-blue-100"
            }`}
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs md:text-sm">
              <div>
                <span className="font-semibold text-slate-500 block text-xs">
                  {t("contrats.candidature_select.student")} :
                </span>
                <span className="text-slate-900 font-bold flex items-center gap-1.5 mt-1">
                  <User className="w-4 h-4 text-blue-600" />
                  {selectedCandidature.etudiantPrenom} {selectedCandidature.etudiantNom}
                </span>
                <span className="text-slate-500 text-xs font-mono block mt-0.5">
                  {t("contrats.candidature_select.matricule")} : {selectedCandidature.etudiantMatricule}
                </span>
              </div>

              <div>
                <span className="font-semibold text-slate-500 block text-xs">
                  {t("contrats.candidature_select.company")} :
                </span>
                <span className="text-slate-900 font-bold flex items-center gap-1.5 mt-1">
                  <Building className="w-4 h-4 text-blue-600" />
                  {selectedCandidature.nomEntreprise}
                </span>
                <span className="text-slate-500 text-xs block mt-0.5">
                  {selectedCandidature.employeurEmail}
                </span>
              </div>

              <div>
                <span className="font-semibold text-slate-500 block text-xs">
                  {t("contrats.candidature_select.offer")} :
                </span>
                <span className="text-slate-900 font-bold flex items-center gap-1.5 mt-1">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                  {selectedCandidature.titreOffre}
                </span>
              </div>
            </div>

            {selectedCandidature.contratExiste && (
              <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-amber-800 bg-amber-100/90 px-3.5 py-2 rounded-lg border border-amber-300">
                <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0" />
                {t("contrats.alerts.error_already_exists")}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="contrat-date-debut"
                className="block text-sm font-semibold text-slate-700"
              >
                {t("contrats.form.dateDebut")} <span className="text-red-500">*</span>
              </label>
            </div>
            <input
              id="contrat-date-debut"
              type="date"
              value={dateDebut}
              onChange={handleDateDebutChange}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-colors ${
                errors.dateDebut
                  ? "border-red-500 bg-red-50 text-slate-900"
                  : "border-slate-300 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              }`}
            />
            {errors.dateDebut && (
              <p className="text-red-500 text-xs mt-1">
                {t("contrats.form.errors.dateDebut")}
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="contrat-date-fin"
                className="block text-sm font-semibold text-slate-700"
              >
                {t("contrats.form.dateFin")} <span className="text-red-500">*</span>
              </label>
              {nombreSemaines && nombreSemaines > 0 && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                  <Calendar className="w-3 h-3" />
                  {t("contrats.form.duree_calculee", { count: nombreSemaines })}
                </span>
              )}
            </div>
            <input
              id="contrat-date-fin"
              type="date"
              value={dateFin}
              onChange={handleDateFinChange}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-colors ${
                errors.dateFin
                  ? "border-red-500 bg-red-50 text-slate-900"
                  : "border-slate-300 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              }`}
            />
            {errors.dateFin && (
              <p className="text-red-500 text-xs mt-1">
                {errors.dateFin === "order"
                  ? t("contrats.form.errors.date_order")
                  : t("contrats.form.errors.dateFin")}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="contrat-horaire"
              className="block text-sm font-semibold text-slate-700 mb-1"
            >
              {t("contrats.form.horaire")} <span className="text-red-500">*</span>
            </label>
            <input
              id="contrat-horaire"
              type="text"
              value={horaire}
              onChange={handleHoraireChange}
              placeholder={t("contrats.form.horaire_placeholder")}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-colors ${
                errors.horaire
                  ? "border-red-500 bg-red-50 text-slate-900"
                  : "border-slate-300 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              }`}
            />
            {errors.horaire && (
              <p className="text-red-500 text-xs mt-1">
                {t("contrats.form.errors.horaire")}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="contrat-salaire"
              className="block text-sm font-semibold text-slate-700 mb-1"
            >
              {t("contrats.form.salaire")} <span className="text-red-500">*</span>
            </label>
            <div className="flex items-stretch w-full flex-nowrap">
              {isEn && (
                <span className={`inline-flex items-center px-3.5 text-sm font-medium bg-slate-100 border border-r-0 rounded-l-xl select-none ${
                  errors.salaire ? "border-red-500 bg-red-50 text-red-500" : "border-slate-300 text-slate-600"
                }`}>$</span>
              )}
              <input
                id="contrat-salaire"
                type="number"
                step="0.01"
                min="0"
                max="50"
                name="salaire"
                value={salaire}
                onChange={handleSalaireChange}
                onBlur={handleSalaireBlur}
                placeholder={t("contrats.form.salaire_placeholder")}
                className={`min-w-0 flex-1 px-4 py-2.5 border text-sm transition-colors ${
                  isEn ? "rounded-none" : "rounded-l-xl"
                } ${errors.salaire ? "border-red-500 bg-red-50 text-slate-900" : "border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"}`}
              />
              <span className={`inline-flex items-center px-3.5 text-sm font-medium bg-slate-100 border border-l-0 rounded-r-xl whitespace-nowrap select-none ${
                errors.salaire ? "border-red-500 bg-red-50 text-red-500" : "border-slate-300 text-slate-600"
              }`}>
                {isEn ? "/h" : "$/h"}
              </span>
            </div>
            {errors.salaire && (
              <p className="text-red-500 text-xs mt-1">
                {errors.salaire === "required"
                  ? t("contrats.form.errors.salaire.required")
                  : t("contrats.form.errors.salaire.format")}
              </p>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="contrat-taches"
            className="block text-sm font-semibold text-slate-700 mb-1"
          >
            {t("contrats.form.taches")} <span className="text-red-500">*</span>
          </label>
          <textarea
            id="contrat-taches"
            rows={4}
            value={descriptionTaches}
            onChange={handleTachesChange}
            placeholder={t("contrats.form.taches_placeholder")}
            className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-colors ${
              errors.descriptionTaches
                ? "border-red-500 bg-red-50 text-slate-900"
                : "border-slate-300 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            }`}
          />
          {errors.descriptionTaches && (
            <p className="text-red-500 text-xs mt-1">
              {errors.descriptionTaches === "minLength"
                ? t("contrats.form.errors.tachesLength")
                : t("contrats.form.errors.taches")}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="contrat-conditions"
            className="block text-sm font-semibold text-slate-700 mb-1"
          >
            {t("contrats.form.conditions")} <span className="text-red-500">*</span>
          </label>
          <textarea
            id="contrat-conditions"
            rows={3}
            value={conditions}
            onChange={handleConditionsChange}
            placeholder={t("contrats.form.conditions_placeholder")}
            className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-colors ${
              errors.conditions
                ? "border-red-500 bg-red-50 text-slate-900"
                : "border-slate-300 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            }`}
          />
          {errors.conditions && (
            <p className="text-red-500 text-xs mt-1">
              {t("contrats.form.errors.conditions")}
            </p>
          )}
        </div>

        <div className="pt-2 flex justify-end">
          <button
            id="contrat-submit-btn"
            type="submit"
            disabled={submitting || (selectedCandidature && selectedCandidature.contratExiste)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
          >
            {submitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                {t("contrats.form.submitting")}
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                {t("contrats.form.submit")}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
