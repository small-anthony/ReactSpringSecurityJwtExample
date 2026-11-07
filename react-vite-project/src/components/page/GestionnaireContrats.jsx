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
      setErreur(t("contrats.alerts.error_print"));
    }
  };

  const handleSignatureSuccess = (updatedContrat) => {
    setSucces(t("contrats.alerts.success_signed_manager"));
    setContrats((prev) => prev.map((c) => (c.id === updatedContrat.id ? updatedContrat : c)));
  };

  const handleConfirmRefus = async () => {
    if (!contratARefuser) return;
    try {
      setRefusSubmitting(true);
      setErreur(null);
      await rejeterContrat(contratARefuser.id, authHeader);
      setSucces(t("contrats.alerts.success_refused_manager"));
      setContrats((prev) =>
        prev.map((c) => (c.id === contratARefuser.id ? { ...c, statut: "REFUSE" } : c))
      );
      setContratARefuser(null);
    } catch (e) {
      setErreur(e.message || t("contrats.alerts.error_refuse"));
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
    <main className="flex flex-col md:flex-row w-full overflow-hidden min-h-[calc(100vh-4rem)]">
      <SidePanelGestionnaire activeTab="contrats" />

      <div className="flex-1 p-6 sm:p-8 md:p-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            {t("contrats.title")}
          </h2>
        </div>

        <div className="flex border-b border-slate-200 mb-8 gap-6">
          <button
            id="tab-create-contrat"
            type="button"
            onClick={() => setActiveTab("create")}
            className={`pb-3 px-1 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === "create"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            {t("contrats.tabs.create")}
          </button>
          <button
            id="tab-list-contrats"
            type="button"
            onClick={() => setActiveTab("list")}
            className={`pb-3 px-1 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === "list"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <FileText className="w-4 h-4" />
            {t("contrats.tabs.list")}{" "}
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
              {contrats.length}
            </span>
          </button>
        </div>

        {erreur && (
          <div
            id="contrat-error-alert"
            className="mb-6 ds-alert-error flex items-center justify-between"
            role="alert"
          >
            <span>{erreur}</span>
            <button
              onClick={() => setErreur(null)}
              className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {succes && (
          <div
            id="contrat-success-alert"
            className="mb-6 ds-alert-success flex items-center justify-between"
            role="status"
          >
            <span>{succes}</span>
            <button
              onClick={() => setSucces(null)}
              className="text-emerald-600 hover:text-emerald-800 p-1 cursor-pointer"
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
            roleLabel={t("contrats.role_label_manager")}
          />
        )}

        {contratARefuser && (
          <div className="ds-modal-backdrop animate-in fade-in duration-200">
            <div className="ds-modal-panel max-w-md p-6 space-y-4">
              <div className="flex items-center gap-3 text-red-600">
                <div className="p-2.5 rounded-xl bg-red-50 text-red-600 border border-red-100">
                  <XCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900">
                    {t("contrats.refuse_modal.title")}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {contratARefuser.etudiantPrenom} {contratARefuser.etudiantNom} — {contratARefuser.titreOffre}
                  </p>
                </div>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">
                {t("contrats.refuse_modal.desc")}
              </p>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setContratARefuser(null)}
                  disabled={refusSubmitting}
                  className="btn-secondary py-2 px-4 text-xs"
                >
                  {t("contrats.actions.cancel")}
                </button>
                <button
                  type="button"
                  id="btn-confirm-refus-gestionnaire"
                  onClick={handleConfirmRefus}
                  disabled={refusSubmitting}
                  className="btn-danger py-2 px-4 text-xs"
                >
                  {refusSubmitting ? (
                    <span>{t("contrats.actions.processing")}</span>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" />
                      <span>{t("contrats.refuse_modal.confirm")}</span>
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
