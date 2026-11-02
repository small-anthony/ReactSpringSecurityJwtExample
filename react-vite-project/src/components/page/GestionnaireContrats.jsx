import React, { useState, useEffect, useContext } from "react";
import { FileText, PlusCircle, RefreshCw, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AuthServiceContext } from "../../services/AuthService.tsx";
import SidePanelGestionnaire from "../widget/SidePanelGestionnaire.jsx";
import FormulaireCreationContrat from "../widget/FormulaireCreationContrat.jsx";
import ListeContratsGestionnaire from "../widget/ListeContratsGestionnaire.jsx";
import ModalCvPdf from "../modal/ModalCvPdf.jsx";
import {
  getCandidaturesAccepteesPourContrat,
  creerContrat,
  getTousLesContrats,
  getContratDocumentBlob
} from "../../services/api/ContratAPI.js";

export default function GestionnaireContrats() {
  const { t } = useTranslation("main");
  const authService = useContext(AuthServiceContext);

  const [activeTab, setActiveTab] = useState("create");
  const [candidatures, setCandidatures] = useState([]);
  const [contrats, setContrats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [erreur, setErreur] = useState(null);
  const [succes, setSucces] = useState(null);
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

  const handleCreerContrat = async (payload) => {
    setErreur(null);
    setSucces(null);
    try {
      setSubmitting(true);
      await creerContrat(payload, authHeader);
      setSucces(t("contrats.alerts.success_created"));
      await chargerDonnees();
      setActiveTab("list");
      return true;
    } catch (err) {
      setErreur(err.message || t("contrats.alerts.error_missing_fields"));
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const handleTelechargerDoc = async (contratId) => {
    try {
      const blob = await getContratDocumentBlob(contratId, authHeader);
      const pdfBlob = new Blob([blob], { type: "application/pdf" });
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `contrat-stage-${contratId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      setErreur(t("contrats.alerts.error_download"));
    }
  };

  const handleVoirDocument = async (contratId) => {
    try {
      const blob = await getContratDocumentBlob(contratId, authHeader);
      const pdfBlob = new Blob([blob], { type: "application/pdf" });
      if (previewDoc?.url) {
        window.URL.revokeObjectURL(previewDoc.url);
      }
      const url = window.URL.createObjectURL(pdfBlob);
      setPreviewDoc({
        url,
        titre: `${t("contrats.actions.contract_number")}${contratId} — ${t("contrats.title")}`
      });
    } catch {
      setErreur(t("contrats.alerts.error_open"));
    }
  };

  const fermerPreviewDoc = () => {
    if (previewDoc?.url) {
      window.URL.revokeObjectURL(previewDoc.url);
    }
    setPreviewDoc(null);
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
          <FormulaireCreationContrat
            candidatures={candidatures}
            submitting={submitting}
            onCreerContrat={handleCreerContrat}
            onErreur={(msg) => {
              setSucces(null);
              setErreur(msg);
            }}
          />
        )}

        {activeTab === "list" && (
          <ListeContratsGestionnaire
            contrats={contrats}
            onVoirDocument={handleVoirDocument}
            onTelechargerDocument={handleTelechargerDoc}
          />
        )}

        {previewDoc && (
          <ModalCvPdf
            pdfUrl={previewDoc.url}
            onClose={fermerPreviewDoc}
            titre={previewDoc.titre}
          />
        )}
      </div>
    </main>
  );
}
