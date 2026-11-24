import React, { useState, useEffect, useContext, useMemo } from "react";
import { FileText, X, XCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { AuthServiceContext } from "../../services/AuthService.tsx";
import SidePanelGestionnaire from "../widget/SidePanelGestionnaire.jsx";
import ListeContratsGestionnaire from "../widget/ListeContratsGestionnaire.jsx";
import ModalCvPdf from "../modal/ModalCvPdf.jsx";
import ModalSignaturePad from "../modal/ModalSignaturePad.jsx";
import {
  getTousLesContrats,
  getContratDocumentBlob,
  rejeterContrat
} from "../../services/api/ContratAPI.js";
import { getAnneesGestionnaire } from "../../services/api/OffreStageService.js";
import { useSessionSelection } from "../../hooks/useSessionSelection.js";
import { usePagination } from "../../hooks/usePagination.js";
import SelecteurSession from "../widget/SelecteurSession.jsx";
import Pagination from "../widget/Pagination.jsx";

const ORDRE_STATUT_CONTRAT_GESTIONNAIRE = {
  SIGNE_PAR_ETUDIANT_ET_EMPLOYEUR: 0,
  SIGNE_PAR_ETUDIANT: 1,
  SIGNE_PAR_EMPLOYEUR: 2,
  EN_ATTENTE_SIGNATURE: 3,
  COMPLETE: 4,
  REFUSE: 5,
};

export default function GestionnaireContrats() {
  const { t } = useTranslation("main");
  const authService = useContext(AuthServiceContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const { annees, anneeChoisie, setAnneeChoisie, anneesChargees, estAncienneSession } = useSessionSelection(
    getAnneesGestionnaire,
    authService
  );

  const [contrats, setContrats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [succes, setSucces] = useState(null);
  const [messageRefus, setMessageRefus] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [signingContrat, setSigningContrat] = useState(null);
  const [contratARefuser, setContratARefuser] = useState(null);
  const [refusSubmitting, setRefusSubmitting] = useState(false);

  const contratsTries = useMemo(() => {
    return [...contrats].sort((a, b) => {
      const prioriteA = ORDRE_STATUT_CONTRAT_GESTIONNAIRE[a.statut] ?? 99;
      const prioriteB = ORDRE_STATUT_CONTRAT_GESTIONNAIRE[b.statut] ?? 99;
      if (prioriteA !== prioriteB) return prioriteA - prioriteB;
      return Number(b.id || 0) - Number(a.id || 0);
    });
  }, [contrats]);

  const {
    page,
    setPage,
    pageSize,
    setPageSize,
    totalItems,
    totalPages,
    paginatedItems: contratsPagines
  } = usePagination(contratsTries, 10, [anneeChoisie]);

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
    if (lower.includes("horaire de travail") && lower.includes("dépasser")) {
      return t("contrats.form.errors.horaireMaxLength");
    }
    if (lower.includes("description des tâches") && lower.includes("dépasser")) {
      return t("contrats.form.errors.tachesMaxLength");
    }
    if (lower.includes("conditions de travail") && lower.includes("dépasser")) {
      return t("contrats.form.errors.conditionsMaxLength");
    }
    if (lower.includes("value too long") || lower.includes("could not execute statement") || lower.includes("longueur maximale")) {
      return t("contrats.alerts.error_value_too_long");
    }
    if (lower.includes("refus") || lower.includes("refusing") || lower.includes("refuse")) {
      return t("contrats.alerts.error_refuse");
    }
    return message;
  };

  const chargerDonnees = async (annee = anneeChoisie) => {
    try {
      setLoading(true);
      setErreur(null);
      const aAnnee = annee !== null && annee !== undefined;
      const contratsData = aAnnee
        ? await getTousLesContrats(authHeader, annee)
        : await getTousLesContrats(authHeader);
      setContrats(contratsData || []);
    } catch (e) {
      setErreur(e.message || t("contrats.alerts.error_load"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!anneesChargees) return;
    chargerDonnees(anneeChoisie);
  }, [anneesChargees, anneeChoisie]);

  useEffect(() => {
    const rawContratId = searchParams.get("contratId");
    if (!rawContratId || loading) return;

    const contratId = Number(rawContratId);
    const action = searchParams.get("action");
    const cible = contrats.find((c) => c.id === contratId);

    if (cible && action === "signer" && cible.statut === "SIGNE_PAR_ETUDIANT_ET_EMPLOYEUR") {
      setSigningContrat(cible);
    }

    const next = new URLSearchParams(searchParams);
    next.delete("contratId");
    next.delete("action");
    setSearchParams(next, { replace: true });
  }, [searchParams, loading, contrats, setSearchParams]);
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
    setMessageRefus(null);
    setContrats((prev) => prev.map((c) => (c.id === updatedContrat.id ? updatedContrat : c)));
  };

  const handleConfirmRefus = async () => {
    if (!contratARefuser) return;
    try {
      setRefusSubmitting(true);
      setErreur(null);
      await rejeterContrat(contratARefuser.id, authHeader);
      setMessageRefus(t("contrats.alerts.success_refused_manager"));
      setSucces(null);
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
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
              <FileText className="w-6 h-6 text-blue-600 shrink-0" />
              {t("contrats.title")}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
              {contrats.length}
            </span>
          </div>
          <SelecteurSession
            annees={annees}
            anneeSelectionnee={anneeChoisie}
            onChangementAnnee={setAnneeChoisie}
          />
        </div>

        {erreur && (
          <div
            id="contrat-error-alert"
            className="mb-6 ds-alert-error flex items-center justify-between gap-2.5"
            role="alert"
          >
            <span>{traduireErreurContrat(erreur)}</span>
            <button
              type="button"
              onClick={() => setErreur(null)}
              className="text-red-500 hover:text-red-700 p-1 rounded-lg cursor-pointer"
              aria-label={t("common.close")}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {succes && (
          <div
            id="contrat-success-alert"
            className="mb-6 ds-alert-success flex items-center justify-between gap-2.5"
            role="status"
          >
            <span>{succes}</span>
            <button
              type="button"
              onClick={() => setSucces(null)}
              className="text-emerald-600 hover:text-emerald-800 p-1 rounded-lg cursor-pointer"
              aria-label={t("common.close")}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {messageRefus && (
          <div
            id="contrat-refus-alert"
            className="mb-6 ds-alert-error flex items-center justify-between gap-2.5"
            role="status"
          >
            <span>{messageRefus}</span>
            <button
              type="button"
              onClick={() => setMessageRefus(null)}
              className="text-red-500 hover:text-red-700 p-1 rounded-lg cursor-pointer"
              aria-label={t("common.close")}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <ListeContratsGestionnaire
          contrats={contratsPagines}
          lectureSeule={estAncienneSession}
          onVoirDocument={handleVoirDocument}
          onTelechargerDocument={handleTelechargerDoc}
          onImprimerDocument={handleImprimerDoc}
          onSignerContrat={setSigningContrat}
          onRefuserContrat={setContratARefuser}
        />

        <Pagination
          page={page}
          totalItems={totalItems}
          totalPages={totalPages}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />

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
