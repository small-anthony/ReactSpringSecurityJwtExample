import React from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Building,
  CheckCircle2,
  XCircle,
  CalendarClock,
  MessageSquare,
  AlertTriangle,
  Video,
} from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ConvocationCard({
  convocation,
  onAccepter,
  onRefuser,
  onConflit,
  actionLoadingId,
}) {
  const { t, i18n } = useTranslation("main");

  const dateObj = convocation.dateHeure ? new Date(convocation.dateHeure) : null;
  const isDatePassee = dateObj ? dateObj < new Date() : false;
  const isLoading = actionLoadingId === convocation.id;
  const currentLocale = i18n.language?.startsWith("en") ? "en-US" : "fr-CA";

  const formatDate = (d) => {
    if (!d) return "N/D";
    const date = new Date(d);
    return date.toLocaleDateString(currentLocale, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (d) => {
    if (!d) return "";
    const date = new Date(d);
    return date.toLocaleTimeString(currentLocale, {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = () => {
    switch (convocation.statut) {
      case "ACCEPTEE":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {t("convocation.status.acceptee", { defaultValue: "Acceptée" })}
          </span>
        );
      case "REFUSEE":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            {t("convocation.status.refusee", { defaultValue: "Refusée" })}
          </span>
        );
      case "CONFLIT_HORAIRE":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
            <CalendarClock className="w-3.5 h-3.5" />
            {t("convocation.status.conflit", { defaultValue: "Conflit d'horaire" })}
          </span>
        );
      case "EN_ATTENTE_REPONSE":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-300">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            {t("convocation.status.en_attente_reponse", { defaultValue: "En attente de réponse" })}
          </span>
        );
      case "EN_ATTENTE":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            {t("convocation.status.en_attente", { defaultValue: "En attente de votre réponse" })}
          </span>
        );
    }
  };

  const isLienVirtuel =
    convocation.lieu &&
    (convocation.lieu.toLowerCase().includes("teams") ||
      convocation.lieu.toLowerCase().includes("meet") ||
      convocation.lieu.toLowerCase().includes("zoom") ||
      convocation.lieu.toLowerCase().includes("http"));

  return (
    <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs hover:shadow-md transition duration-200 overflow-hidden">
      <div className="p-6 space-y-4">
        {/* En-tête : Titre & Statut */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              {t("convocation.card_tag", { defaultValue: "Convocation d'entrevue" })}
            </span>
            <h3 className="text-xl font-bold text-gray-900 mt-0.5">
              {convocation.titrePoste || t("convocation.default_position", { defaultValue: "Entrevue de stage" })}
            </h3>
            <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 mt-1">
              <Building className="w-4 h-4 text-gray-400" />
              <span>{convocation.nomEntreprise || t("convocation.partner_company", { defaultValue: "Entreprise partenaire" })}</span>
            </div>
          </div>
          <div className="shrink-0">{getStatusBadge()}</div>
        </div>

        {/* Détails date, heure et lieu */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-3 p-3 bg-gray-50/80 rounded-xl border border-gray-100">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">
                {t("convocation.datetime_label", { defaultValue: "Date & Heure de l'entrevue" })}
              </p>
              <p className="text-sm font-bold text-gray-900 capitalize">
                {formatDate(convocation.dateHeure)} {formatTime(convocation.dateHeure)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50/80 rounded-xl border border-gray-100">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              {isLienVirtuel ? <Video className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
            </div>
            <div className="truncate">
              <p className="text-xs text-gray-500 font-medium">
                {isLienVirtuel
                  ? t("convocation.virtual_interview", { defaultValue: "Entrevue virtuelle" })
                  : t("convocation.location_label", { defaultValue: "Lieu de l'entrevue" })}
              </p>
              <p className="text-sm font-bold text-gray-900 truncate" title={convocation.lieu}>
                {convocation.lieu || t("convocation.location_unspecified", { defaultValue: "Lieu non précisé" })}
              </p>
            </div>
          </div>
        </div>

        {/* Message de l'employeur */}
        {convocation.messageEmployeur && (
          <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-100 text-xs text-gray-700 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-blue-900">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{t("convocation.employer_instructions", { defaultValue: "Instructions de l'employeur :" })}</span>
            </div>
            <p className="text-gray-600 italic leading-relaxed">{convocation.messageEmployeur}</p>
          </div>
        )}

        {/* Informations complémentaires si Conflit d'horaire ou Refus */}
        {convocation.statut === "CONFLIT_HORAIRE" && (
          <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs text-indigo-900 space-y-1">
            <p className="font-bold">
              {t("convocation.counter_proposal_label", { defaultValue: "Votre contre-proposition :" })}{" "}
              {formatDate(convocation.dateProposeeEtudiant)} {formatTime(convocation.dateProposeeEtudiant)}
            </p>
            {convocation.motifEtudiant && (
              <p className="text-indigo-700 italic">
                {t("convocation.justification_label", { defaultValue: "Justification :" })} "{convocation.motifEtudiant}"
              </p>
            )}
          </div>
        )}

        {convocation.statut === "REFUSEE" && convocation.motifEtudiant && (
          <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-100 text-xs text-rose-900 space-y-1">
            <p className="font-bold">
              {t("convocation.refusal_reason_label", { defaultValue: "Motif du refus transmis :" })}
            </p>
            <p className="text-rose-700 italic">"{convocation.motifEtudiant}"</p>
          </div>
        )}

        {/* Actions de l'étudiant */}
        {convocation.statut === "EN_ATTENTE" && !isDatePassee && (
          <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => onRefuser(convocation)}
              disabled={isLoading}
              className="px-4 py-2 text-xs font-bold text-rose-700 hover:text-rose-800 hover:bg-rose-50 border border-rose-200 rounded-xl transition cursor-pointer"
            >
              {t("convocation.btn_refuse", { defaultValue: "Refuser" })}
            </button>

            <button
              type="button"
              onClick={() => onConflit(convocation)}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-blue-700 hover:text-blue-800 hover:bg-blue-50 border border-blue-200 rounded-xl transition cursor-pointer"
            >
              <CalendarClock className="w-3.5 h-3.5" />
              {t("convocation.btn_propose_date", { defaultValue: "Proposer une autre date" })}
            </button>

            <button
              type="button"
              onClick={() => onAccepter(convocation.id)}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs hover:shadow-sm transition cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {isLoading ? t("convocation.processing", { defaultValue: "Traitement..." }) : t("convocation.btn_accept", { defaultValue: "Accepter l'entrevue" })}
            </button>
          </div>
        )}

        {/* Message d'entrevue passée sans réponse */}
        {convocation.statut === "EN_ATTENTE_REPONSE" && (
          <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t border-gray-100">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              {t("convocation.expired_notice", {
                defaultValue:
                  "La date de cette entrevue est maintenant échue. Le statut est passé en attente de la réponse de l'employeur.",
              })}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
