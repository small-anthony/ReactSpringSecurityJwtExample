import React from "react";
import {
  FileText,
  Clock,
  Download,
  Briefcase,
  Calendar,
  DollarSign,
  Eye,
  Check,
  Printer,
  PenTool,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ListeContratsGestionnaire({
  contrats,
  onVoirDocument,
  onTelechargerDocument,
  onImprimerDocument,
  onSignerContrat,
  onRefuserContrat
}) {
  const { t } = useTranslation("main");

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
      case "SIGNE_PAR_ETUDIANT_ET_EMPLOYEUR":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
            {t("contrats.status.SIGNE_PAR_ETUDIANT_ET_EMPLOYEUR", { defaultValue: "Signé par l'étudiant et l'employeur" })}
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

  const renderSignaturePill = (label, signe) => (
    <div className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-gray-200/80 text-xs">
      <span className="font-semibold text-gray-700">{label} :</span>
      {signe ? (
        <span className="text-green-700 font-semibold bg-green-50 px-2 py-0.5 rounded border border-green-200 flex items-center gap-1">
          <Check className="w-3.5 h-3.5 text-green-600" /> {t("contrats.signatures.signed")}
        </span>
      ) : (
        <span className="text-amber-800 font-medium bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-amber-600" /> {t("contrats.signatures.waiting")}
        </span>
      )}
    </div>
  );

  if (contrats.length === 0) {
    return (
      <div
        id="no-contracts-message"
        className="text-center bg-white rounded-2xl shadow-sm border border-gray-200 p-16"
      >
        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 font-medium">
          {t("contrats.alerts.no_contracts")}
        </p>
      </div>
    );
  }

  return (
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
              {renderSignaturePill(t("contrats.signatures.student"), c.signeParEtudiant)}
              {renderSignaturePill(t("contrats.signatures.employer"), c.signeParEmployeur)}
              {renderSignaturePill(t("contrats.signatures.manager"), c.signeParGestionnaire)}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-5 border-t border-gray-100">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => onVoirDocument(c.id)}
                className="inline-flex items-center gap-1.5 text-blue-600 bg-blue-50 px-3.5 py-2 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors cursor-pointer"
                title={t("contrats.table.view")}
              >
                <Eye className="w-3.5 h-3.5" strokeWidth={2} />
                {t("contrats.table.view")}
              </button>

              <button
                type="button"
                onClick={() => onTelechargerDocument(c.id)}
                className="inline-flex items-center gap-1.5 text-gray-700 bg-gray-100 hover:bg-gray-200 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                title={t("contrats.table.download")}
              >
                <Download className="w-3.5 h-3.5" strokeWidth={2} />
                {t("contrats.table.download")}
              </button>

              {onImprimerDocument && (
                <button
                  type="button"
                  id={`btn-imprimer-contrat-${c.id}`}
                  onClick={() => onImprimerDocument(c.id)}
                  className="inline-flex items-center gap-1.5 text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                  title={t("contrats.actions.print", { defaultValue: "Imprimer" })}
                >
                  <Printer className="w-3.5 h-3.5 text-gray-600" />
                  {t("contrats.actions.print", { defaultValue: "Imprimer" })}
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {!c.signeParGestionnaire && c.statut !== "REFUSE" ? (
                c.signeParEtudiant && c.signeParEmployeur ? (
                  <>
                    {onRefuserContrat && (
                      <button
                        type="button"
                        id={`btn-refuser-contrat-${c.id}`}
                        onClick={() => onRefuserContrat(c)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span>{t("contrats.actions.refuse", { defaultValue: "Refuser le contrat" })}</span>
                      </button>
                    )}
                    {onSignerContrat && (
                      <button
                        type="button"
                        id={`btn-signer-contrat-${c.id}`}
                        onClick={() => onSignerContrat(c)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors cursor-pointer shadow-xs"
                      >
                        <PenTool className="w-3.5 h-3.5" />
                        <span>{t("contrats.actions.sign", { defaultValue: "Signer le contrat" })}</span>
                      </button>
                    )}
                  </>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>{t("contrats.alerts.waiting_student_employer", { defaultValue: "En attente des signatures de l'étudiant et de l'employeur" })}</span>
                  </span>
                )
              ) : c.signeParGestionnaire ? (
                <div className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-3.5 py-2 rounded-lg text-xs font-bold border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{t("contrats.actions.already_signed_manager", { defaultValue: "Vous avez signé ce contrat" })}</span>
                </div>
              ) : null}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

