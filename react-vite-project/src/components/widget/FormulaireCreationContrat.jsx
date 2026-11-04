import React, { useState } from "react";
import {
  FileText,
  PlusCircle,
  Briefcase,
  Building,
  User,
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import { useTranslation } from "react-i18next";

export default function FormulaireCreationContrat({
  candidatures,
  submitting,
  onCreerContrat,
  onErreur
}) {
  const { t } = useTranslation("main");

  const [selectedCandidatureId, setSelectedCandidatureId] = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [horaire, setHoraire] = useState("");
  const [salaire, setSalaire] = useState("");
  const [descriptionTaches, setDescriptionTaches] = useState("");
  const [conditions, setConditions] = useState("");

  const selectedCandidature = candidatures.find(
    (c) => String(c.candidatureId) === String(selectedCandidatureId)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCandidatureId) {
      onErreur(t("contrats.alerts.error_missing_fields"));
      return;
    }

    if (selectedCandidature?.contratExiste) {
      onErreur(t("contrats.alerts.error_already_exists"));
      return;
    }

    if (
      !dateDebut ||
      !dateFin ||
      !horaire.trim() ||
      !salaire.trim() ||
      !descriptionTaches.trim() ||
      !conditions.trim()
    ) {
      onErreur(t("contrats.alerts.error_missing_fields"));
      return;
    }

    if (new Date(dateFin) < new Date(dateDebut)) {
      onErreur(t("contrats.alerts.error_date_order"));
      return;
    }

    const ok = await onCreerContrat({
      candidatureId: Number(selectedCandidatureId),
      dateDebut,
      dateFin,
      horaire: horaire.trim(),
      salaire: salaire.trim(),
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
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-7 md:p-8">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <PlusCircle className="w-5 h-5 text-blue-600" />
        {t("contrats.tabs.create")}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="select-candidature"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            {t("contrats.candidature_select.label")} *
          </label>
          <select
            id="select-candidature"
            value={selectedCandidatureId}
            onChange={(e) => setSelectedCandidatureId(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
            required
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
          <p className="mt-1 text-xs text-gray-500">
            {t("contrats.candidature_select.help")}
          </p>
        </div>

        {selectedCandidature && (
          <div
            id="candidature-selected-card"
            className={`p-5 rounded-xl border ${
              selectedCandidature.contratExiste
                ? "bg-amber-50 border-amber-200"
                : "bg-blue-50/60 border-blue-100"
            }`}
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs md:text-sm">
              <div>
                <span className="font-semibold text-gray-500 block text-xs">
                  {t("contrats.candidature_select.student")} :
                </span>
                <span className="text-gray-900 font-bold flex items-center gap-1.5 mt-1">
                  <User className="w-4 h-4 text-blue-600" />
                  {selectedCandidature.etudiantPrenom} {selectedCandidature.etudiantNom}
                </span>
                <span className="text-gray-500 text-xs font-mono block mt-0.5">
                  {t("contrats.candidature_select.matricule")} : {selectedCandidature.etudiantMatricule}
                </span>
              </div>

              <div>
                <span className="font-semibold text-gray-500 block text-xs">
                  {t("contrats.candidature_select.company")} :
                </span>
                <span className="text-gray-900 font-bold flex items-center gap-1.5 mt-1">
                  <Building className="w-4 h-4 text-blue-600" />
                  {selectedCandidature.nomEntreprise}
                </span>
                <span className="text-gray-500 text-xs block mt-0.5">
                  {selectedCandidature.employeurEmail}
                </span>
              </div>

              <div>
                <span className="font-semibold text-gray-500 block text-xs">
                  {t("contrats.candidature_select.offer")} :
                </span>
                <span className="text-gray-900 font-bold flex items-center gap-1.5 mt-1">
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
            <label
              htmlFor="contrat-date-debut"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              {t("contrats.form.dateDebut")} *
            </label>
            <input
              id="contrat-date-debut"
              type="date"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              required
            />
          </div>

          <div>
            <label
              htmlFor="contrat-date-fin"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              {t("contrats.form.dateFin")} *
            </label>
            <input
              id="contrat-date-fin"
              type="date"
              value={dateFin}
              onChange={(e) => setDateFin(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="contrat-horaire"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              {t("contrats.form.horaire")} *
            </label>
            <input
              id="contrat-horaire"
              type="text"
              value={horaire}
              onChange={(e) => setHoraire(e.target.value)}
              placeholder={t("contrats.form.horaire_placeholder")}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              required
            />
          </div>

          <div>
            <label
              htmlFor="contrat-salaire"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              {t("contrats.form.salaire")} *
            </label>
            <input
              id="contrat-salaire"
              type="text"
              value={salaire}
              onChange={(e) => setSalaire(e.target.value)}
              placeholder={t("contrats.form.salaire_placeholder")}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              required
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="contrat-taches"
            className="block text-sm font-semibold text-gray-700 mb-1"
          >
            {t("contrats.form.taches")} *
          </label>
          <textarea
            id="contrat-taches"
            rows={4}
            value={descriptionTaches}
            onChange={(e) => setDescriptionTaches(e.target.value)}
            placeholder={t("contrats.form.taches_placeholder")}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            required
          />
        </div>

        <div>
          <label
            htmlFor="contrat-conditions"
            className="block text-sm font-semibold text-gray-700 mb-1"
          >
            {t("contrats.form.conditions")} *
          </label>
          <textarea
            id="contrat-conditions"
            rows={3}
            value={conditions}
            onChange={(e) => setConditions(e.target.value)}
            placeholder={t("contrats.form.conditions_placeholder")}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            required
          />
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

