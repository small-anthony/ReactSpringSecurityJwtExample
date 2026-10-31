import React, { useState, useEffect, useContext } from "react";
import {
  FileText,
  Clock,
  Download,
  PlusCircle,
  Briefcase,
  Building,
  User,
  Calendar,
  DollarSign,
  AlertTriangle,
  RefreshCw,
  Eye,
  X,
  Check
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { AuthServiceContext } from "../../services/AuthService.tsx";
import SidePanelGestionnaire from "../widget/SidePanelGestionnaire.jsx";
import {
  getCandidaturesAccepteesPourContrat,
  creerContrat,
  getTousLesContrats,
  getContratDocumentBlob
} from "../../services/api/ContratAPI.js";

export default function GestionnaireContrats() {
  const { t, i18n } = useTranslation("main");
  const authService = useContext(AuthServiceContext);

  const [activeTab, setActiveTab] = useState("create");
  const [candidatures, setCandidatures] = useState([]);
  const [contrats, setContrats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [erreur, setErreur] = useState(null);
  const [succes, setSucces] = useState(null);

  const [selectedCandidatureId, setSelectedCandidatureId] = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [horaire, setHoraire] = useState("");
  const [salaire, setSalaire] = useState("");
  const [descriptionTaches, setDescriptionTaches] = useState("");
  const [conditions, setConditions] = useState("");

  const [previewDoc, setPreviewDoc] = useState(null);

  const authHeader = authService.buildAuthHeader();

  const chargerDonnees = async () => {
    try {
      setLoading(true);
      setErreur(null);
      const [candsData, contratsData] = await Promise.all([
        getCandidaturesAccepteesPourContrat(authHeader),
        getTousLesContrats(authHeader)
      ]);
      setCandidatures(candsData || []);
      setContrats(contratsData || []);
    } catch (e) {
      setErreur(e.message || t("contrats.alerts.error_load"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    chargerDonnees();
  }, []);

  const selectedCandidature = candidatures.find(
    (c) => String(c.candidatureId) === String(selectedCandidatureId)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur(null);
    setSucces(null);

    if (!selectedCandidatureId) {
      setErreur(t("contrats.alerts.error_missing_fields"));
      return;
    }

    if (selectedCandidature?.contratExiste) {
      setErreur(t("contrats.alerts.error_already_exists"));
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
      setErreur(t("contrats.alerts.error_missing_fields"));
      return;
    }

    if (new Date(dateFin) < new Date(dateDebut)) {
      setErreur(t("contrats.alerts.error_date_order"));
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        candidatureId: Number(selectedCandidatureId),
        dateDebut,
        dateFin,
        horaire: horaire.trim(),
        salaire: salaire.trim(),
        descriptionTaches: descriptionTaches.trim(),
        conditions: conditions.trim()
      };

      await creerContrat(payload, authHeader);
      setSucces(t("contrats.alerts.success_created"));

      setSelectedCandidatureId("");
      setDateDebut("");
      setDateFin("");
      setHoraire("");
      setSalaire("");
      setDescriptionTaches("");
      setConditions("");

      await chargerDonnees();
      setActiveTab("list");
    } catch (err) {
      setErreur(err.message || t("contrats.alerts.error_missing_fields"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleTelechargerDoc = async (contratId) => {
    try {
      const blob = await getContratDocumentBlob(contratId, authHeader);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `contrat-stage-${contratId}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setErreur(t("contrats.alerts.error_download"));
    }
  };

  const handleVoirDocument = async (contratId) => {
    try {
      const blob = await getContratDocumentBlob(contratId, authHeader);
      const text = await blob.text();
      setPreviewDoc({ id: contratId, text });
    } catch (err) {
      setErreur(t("contrats.alerts.error_open"));
    }
  };

  const getStatusBadge = (statut) => {
    switch (statut) {
      case "COMPLETE":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
            {t("contrats.status.COMPLETE")}
          </span>
        );
      case "SIGNE_PAR_EMPLOYEUR":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            {t("contrats.status.SIGNE_PAR_EMPLOYEUR")}
          </span>
        );
      case "SIGNE_PAR_ETUDIANT":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
            {t("contrats.status.SIGNE_PAR_ETUDIANT")}
          </span>
        );
      case "REFUSE":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
            {t("contrats.status.REFUSE")}
          </span>
        );
      case "EN_ATTENTE_SIGNATURE":
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            {t("contrats.status.EN_ATTENTE_SIGNATURE")}
          </span>
        );
    }
  };

  return (
    <main className="flex flex-col md:flex-row w-full bg-gray-50/30 overflow-hidden min-h-[calc(100vh-80px)]">
      <SidePanelGestionnaire activeTab="contrats" />

      <div className="flex-1 p-8 md:p-12 animate-in fade-in duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {t("contrats.title")}
          </h2>

          <button
            type="button"
            onClick={chargerDonnees}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl border border-gray-200 shadow-sm transition disabled:opacity-50 cursor-pointer self-start sm:self-auto"
            title={t("contrats.actions.refresh")}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-blue-600" : ""}`} />
            {t("contrats.actions.refresh")}
          </button>
        </div>

        <div className="flex border-b border-gray-200 mb-8 gap-4">
          <button
            id="tab-create-contrat"
            type="button"
            onClick={() => setActiveTab("create")}
            className={`pb-3 px-2 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === "create"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            {t("contrats.tabs.create")}
          </button>
          <button
            id="tab-list-contrats"
            type="button"
            onClick={() => setActiveTab("list")}
            className={`pb-3 px-2 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === "list"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <FileText className="w-4 h-4" />
            {t("contrats.tabs.list")}{" "}
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-700">
              {contrats.length}
            </span>
          </button>
        </div>

        {erreur && (
          <div
            id="contrat-error-alert"
            className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md font-medium shadow-sm flex items-center justify-between"
          >
            <span>{erreur}</span>
            <button
              onClick={() => setErreur(null)}
              className="text-red-500 hover:text-red-700 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {succes && (
          <div
            id="contrat-success-alert"
            className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-md font-medium shadow-sm flex items-center justify-between"
          >
            <span>{succes}</span>
            <button
              onClick={() => setSucces(null)}
              className="text-green-500 hover:text-green-700 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {activeTab === "create" && (
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
                      {c.etudiantPrenom} {c.etudiantNom} ({c.etudiantMatricule}) — {c.nomEntreprise} ({c.titreOffre}) {c.contratExiste ? `— [${t("contrats.candidature_select.already_contracted")}]` : ""}
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
        )}

        {activeTab === "list" && (
          <div>
            {contrats.length === 0 ? (
              <div
                id="no-contracts-message"
                className="text-center bg-white rounded-2xl shadow-sm border border-gray-200 p-16"
              >
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">
                  {t("contrats.alerts.no_contracts")}
                </p>
              </div>
            ) : (
              <div className="grid gap-6">
                {contrats.map((c) => (
                  <article
                    key={c.id}
                    className="relative p-7 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="absolute top-7 right-7">
                      {getStatusBadge(c.statut)}
                    </div>

                    <div className="mb-4 pr-44">
                      <h3 className="text-xl font-bold text-gray-900 mb-0.5">
                        {c.etudiantPrenom} {c.etudiantNom}
                      </h3>
                      <p className="text-sm text-gray-500 font-medium">
                        {t("contrats.candidature_select.matricule")} : {c.etudiantMatricule}
                      </p>
                      {c.etudiantEmail && (
                        <a
                          href={`mailto:${c.etudiantEmail}`}
                          className="inline-block text-sm text-gray-500 hover:text-blue-600 transition-colors"
                        >
                          {c.etudiantEmail}
                        </a>
                      )}
                    </div>

                    <p className="text-blue-600 font-medium mb-5 flex items-center gap-1.5 pb-4 border-b border-gray-100 flex-wrap">
                      <Briefcase className="w-4 h-4" strokeWidth={2} />
                      <span className="font-semibold text-gray-900">{c.nomEntreprise}</span>
                      <span className="text-gray-300">•</span>
                      <span className="text-gray-700">{c.titreOffre}</span>
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-50 p-2 rounded-lg border border-blue-100">
                          <Calendar className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                            {t("contrats.table.dates")}
                          </span>
                          <span className="text-gray-800 text-sm font-medium">
                            {c.dateDebut} → {c.dateFin}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="bg-green-50 p-2 rounded-lg border border-green-100">
                          <DollarSign className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                            {t("contrats.table.salary")}
                          </span>
                          <span className="text-green-700 text-sm font-bold">
                            {c.salaire}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="bg-purple-50 p-2 rounded-lg border border-purple-100">
                          <Clock className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                            {t("contrats.form.horaire")}
                          </span>
                          <span className="text-gray-800 text-sm font-medium">
                            {c.horaire}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-100 mb-6">
                      <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">
                        {t("contrats.table.signatures")}
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-gray-200/80 text-xs">
                          <span className="font-semibold text-gray-700">
                            {t("contrats.signatures.student")} :
                          </span>
                          {c.signeParEtudiant ? (
                            <span className="text-green-700 font-semibold bg-green-50 px-2 py-0.5 rounded border border-green-200 flex items-center gap-1">
                              <Check className="w-3.5 h-3.5 text-green-600" /> {t("contrats.signatures.signed")}
                            </span>
                          ) : (
                            <span className="text-amber-800 font-medium bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-amber-600" /> {t("contrats.signatures.waiting")}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-gray-200/80 text-xs">
                          <span className="font-semibold text-gray-700">
                            {t("contrats.signatures.employer")} :
                          </span>
                          {c.signeParEmployeur ? (
                            <span className="text-green-700 font-semibold bg-green-50 px-2 py-0.5 rounded border border-green-200 flex items-center gap-1">
                              <Check className="w-3.5 h-3.5 text-green-600" /> {t("contrats.signatures.signed")}
                            </span>
                          ) : (
                            <span className="text-amber-800 font-medium bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-amber-600" /> {t("contrats.signatures.waiting")}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-gray-200/80 text-xs">
                          <span className="font-semibold text-gray-700">
                            {t("contrats.signatures.manager")} :
                          </span>
                          {c.signeParGestionnaire ? (
                            <span className="text-green-700 font-semibold bg-green-50 px-2 py-0.5 rounded border border-green-200 flex items-center gap-1">
                              <Check className="w-3.5 h-3.5 text-green-600" /> {t("contrats.signatures.signed")}
                            </span>
                          ) : (
                            <span className="text-amber-800 font-medium bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-amber-600" /> {t("contrats.signatures.waiting")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-5 border-t border-gray-100">
                      <button
                        onClick={() => handleVoirDocument(c.id)}
                        className="inline-flex items-center gap-2 text-blue-600 bg-blue-50 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-100 transition-colors cursor-pointer"
                        title={t("contrats.table.view")}
                      >
                        <Eye className="w-4 h-4" strokeWidth={2} />
                        {t("contrats.table.view")}
                      </button>

                      <button
                        onClick={() => handleTelechargerDoc(c.id)}
                        className="inline-flex items-center gap-2 text-gray-700 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
                        title={t("contrats.table.download")}
                      >
                        <Download className="w-4 h-4" strokeWidth={2} />
                        {t("contrats.table.download")}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {previewDoc && (
          <div
            id="contrat-preview-modal"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
            onClick={() => setPreviewDoc(null)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" strokeWidth={2} />
                  <h3 className="text-lg font-bold text-gray-800">
                    {t("contrats.actions.contract_number")}{previewDoc.id} — {t("contrats.title")}
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleTelechargerDoc(previewDoc.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    {t("contrats.table.download")}
                  </button>

                  <button
                    onClick={() => setPreviewDoc(null)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-gray-600 hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                    title={t("contrats.actions.close")}
                  >
                    <X className="w-4 h-4" strokeWidth={2.5} />
                  </button>
                </div>
              </div>

              <div className="flex-grow bg-gray-100 p-4 md:p-6 overflow-y-auto">
                <div className="bg-white p-6 md:p-8 rounded-xl border border-gray-200 shadow-xs font-mono text-xs text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {previewDoc.text}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
