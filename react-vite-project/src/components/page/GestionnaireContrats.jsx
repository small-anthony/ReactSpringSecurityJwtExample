import React, { useState, useEffect, useContext } from "react";
import { FileText, PlusCircle, X, XCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AuthServiceContext } from "../../services/AuthService.tsx";
import SidePanelGestionnaire from "../widget/SidePanelGestionnaire.jsx";
import FormulaireCreationContrat from "../widget/FormulaireCreationContrat.jsx";
import ListeContratsGestionnaire from "../widget/ListeContratsGestionnaire.jsx";
import ModalCvPdf from "../modal/ModalCvPdf.jsx";
import ModalSignaturePad from "../modal/ModalSignaturePad.jsx";
import {
  getCandidaturesAccepteesPourContrat,
  creerContrat,
  getTousLesContrats,
  getContratDocumentBlob,
  rejeterContrat
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
  const [signingContrat, setSigningContrat] = useState(null);
  const [contratARefuser, setContratARefuser] = useState(null);
  const [refusSubmitting, setRefusSubmitting] = useState(false);

  const authHeader = authService.buildAuthHeader();

  const traduireErreurContrat = (message) => {
    if (!message) return "";
    const msg = String(message).trim();
    if (msg.startsWith("contrats.alerts.")) {
      return t(msg);
    }
    const lower = msg.toLowerCase();
    if (lower.includes("informations obligatoires manquent") || lower.includes("mandatory information is missing")) {
      return t("contrats.alerts.error_missing_fields");
    }
    if (lower.includes("date de fin") && (lower.includes("antérieure") || lower.includes("anterieure") || lower.includes("avant") || lower.includes("earlier") || lower.includes("before"))) {
      return t("contrats.alerts.error_date_order");
    }
    if (lower.includes("un contrat existe") || lower.includes("contract already exists")) {
      return t("contrats.alerts.error_already_exists");
    }
    if (lower.includes("pas été embauché") || lower.includes("pas ete embauche") || lower.includes("was not hired")) {
      return t("contrats.alerts.error_not_hired");
    }
    if (lower.includes("candidature introuvable") || lower.includes("chargement des données") || lower.includes("loading contract data")) {
      return t("contrats.alerts.error_load");
    }
    if (lower.includes("téléchargement") || lower.includes("telechargement") || lower.includes("downloading")) {
      return t("contrats.alerts.error_download");
    }
    if (lower.includes("ouverture") || lower.includes("opening")) {
      return t("contrats.alerts.error_open");
    }
    if (lower.includes("refus") || lower.includes("refusing") || lower.includes("refuse")) {
      return t("contrats.alerts.error_refuse");
    }
    return message;
  };

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

  const handleImprimerDoc = async (contratId) => {
    try {
      const blob = await getContratDocumentBlob(contratId, authHeader);
      const pdfBlob = new Blob([blob], { type: "application/pdf" });
      const url = window.URL.createObjectURL(pdfBlob);
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      iframe.src = url;
      document.body.appendChild(iframe);
      iframe.onload = () => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      };
    } catch {
      setErreur(t("contrats.alerts.error_print", { defaultValue: "Erreur lors de l'impression du contrat." }));
    }
  };

  const handleSignatureSuccess = (updatedContrat) => {
    setSucces(t("contrats.alerts.success_signed_manager", {
      defaultValue: "Contrat de stage signé électroniquement avec succès ! Le contrat est désormais complété."
    }));
    setContrats((prev) => prev.map((c) => (c.id === updatedContrat.id ? updatedContrat : c)));
  };

  const handleConfirmRefus = async () => {
    if (!contratARefuser) return;
    try {
      setRefusSubmitting(true);
      setErreur(null);
      await rejeterContrat(contratARefuser.id, authHeader);
      setSucces(t("contrats.alerts.success_refused_manager", {
        defaultValue: "Le contrat de stage a été refusé. L'employeur et l'étudiant en ont été notifiés."
      }));
      setContrats((prev) =>
        prev.map((c) => (c.id === contratARefuser.id ? { ...c, statut: "REFUSE" } : c))
      );
      setContratARefuser(null);
    } catch (e) {
      setErreur(e.message || t("contrats.alerts.error_refuse", { defaultValue: "Erreur lors du refus du contrat." }));
    } finally {
      setRefusSubmitting(false);
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
            <span>{traduireErreurContrat(erreur)}</span>
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
            onImprimerDocument={handleImprimerDoc}
            onSignerContrat={setSigningContrat}
            onRefuserContrat={setContratARefuser}
          />
        )}

        {signingContrat && (
          <ModalSignaturePad
            isOpen={!!signingContrat}
            onClose={() => setSigningContrat(null)}
            contrat={signingContrat}
            onSuccess={handleSignatureSuccess}
            authHeader={authHeader}
            roleLabel={t("contrats.role_label_manager", { defaultValue: "Le gestionnaire (représentant du cégep)" })}
          />
        )}

        {contratARefuser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col p-6 space-y-4">
              <div className="flex items-center gap-3 text-rose-600">
                <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
                  <XCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">
                    {t("contrats.refuse_modal.title", { defaultValue: "Refuser le contrat de stage" })}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {contratARefuser.etudiantPrenom} {contratARefuser.etudiantNom} — {contratARefuser.titreOffre}
                  </p>
                </div>
              </div>

              <p className="text-sm text-gray-600 leading-relaxed">
                {t("contrats.refuse_modal.desc", {
                  defaultValue: "Êtes-vous certain de vouloir refuser ce contrat de stage ? Cette action marquera le contrat comme refusé et en informera l'étudiant et l'employeur.",
                })}
              </p>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setContratARefuser(null)}
                  disabled={refusSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition cursor-pointer"
                >
                  {t("contrats.actions.cancel", { defaultValue: "Annuler" })}
                </button>
                <button
                  type="button"
                  id="btn-confirm-refus-gestionnaire"
                  onClick={handleConfirmRefus}
                  disabled={refusSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
                >
                  {refusSubmitting ? (
                    <span>{t("contrats.actions.processing", { defaultValue: "Traitement..." })}</span>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" />
                      <span>{t("contrats.refuse_modal.confirm", { defaultValue: "Confirmer le refus" })}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
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
