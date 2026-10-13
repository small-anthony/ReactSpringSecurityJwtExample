import React, { useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Building,
  CheckCircle2,
  XCircle,
  MessageSquare,
  AlertTriangle,
  Video,
  Check,
} from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ConvocationCard({
  convocation,
  onAccepter,
  onRefuser,
  actionLoadingId,
}) {
  const { t, i18n } = useTranslation("main");

  const slots = convocation.rendezVousPossibles && convocation.rendezVousPossibles.length > 0
    ? convocation.rendezVousPossibles
    : (convocation.dateHeure ? [{ date: convocation.dateHeure, lieu: convocation.lieu }] : []);

  const [selectedSlotIndex, setSelectedSlotIndex] = useState(0);

  const selectedSlot = slots[selectedSlotIndex] || slots[0] || null;
  const confirmedSlot = convocation.rendezVousSelection || (convocation.statut === "ACCEPTEE" ? selectedSlot : null);

  const isLoading = actionLoadingId === convocation.id;
  const currentLocale = i18n.language?.startsWith("en") ? "en-US" : "fr-CA";

  const formatDate = (d) => {
    if (!d) return t("common.not_available", { defaultValue: "N/D" });
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
      case "EXPIREE":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-300">
            <Clock className="w-3.5 h-3.5 text-gray-500" />
            {t("convocation.status.expiree", { defaultValue: "Expirée" })}
          </span>
        );
      case "ANNULEE":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-300">
            <XCircle className="w-3.5 h-3.5 text-slate-500" />
            {t("convocation.status.annulee", { defaultValue: "Annulée" })}
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

  const isLienVirtuel = (lieu) =>
    lieu &&
    (lieu.toLowerCase().includes("teams") ||
      lieu.toLowerCase().includes("meet") ||
      lieu.toLowerCase().includes("zoom") ||
      lieu.toLowerCase().includes("http"));

  return (
    <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs hover:shadow-md transition duration-200 overflow-hidden">
      <div className="p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              {t("convocation.card_tag", { defaultValue: "Convocation d'entrevue" })}
            </span>
            <h3 className="text-xl font-bold text-gray-900 mt-0.5">
              {convocation.offreStage?.titre || convocation.titrePoste || t("convocation.default_position", { defaultValue: "Entrevue de stage" })}
            </h3>
            <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 mt-1">
              <Building className="w-4 h-4 text-gray-400" />
              <span>{convocation.offreStage?.nomEntreprise || convocation.nomEntreprise || t("convocation.partner_company", { defaultValue: "Entreprise partenaire" })}</span>
            </div>
          </div>
          <div className="shrink-0 flex flex-col items-end gap-1.5">
            {getStatusBadge()}
            {convocation.statut === "EN_ATTENTE" && convocation.dateLimite && (
              <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                {t("convocation.deadline_notice", { defaultValue: "Répondre avant le" })} {formatDate(convocation.dateLimite)}
              </span>
            )}
          </div>
        </div>

        {convocation.statut === "ACCEPTEE" && confirmedSlot && (
          <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-200 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wide text-emerald-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {t("convocation.confirmed_interview", { defaultValue: "Rendez-vous confirmé" })}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="flex items-center gap-2.5 text-xs text-gray-700">
                <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold">{formatDate(confirmedSlot.date)} {t("common.at", { defaultValue: "à" })} {formatTime(confirmedSlot.date)}</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-gray-700">
                {isLienVirtuel(confirmedSlot.lieu) ? (
                  <Video className="w-4 h-4 text-indigo-600 shrink-0" />
                ) : (
                  <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
                )}
                <span className="truncate" title={confirmedSlot.lieu}>{confirmedSlot.lieu || t("convocation.location_to_confirm", { defaultValue: "Lieu à confirmer" })}</span>
              </div>
            </div>
          </div>
        )}

        {convocation.statut === "EN_ATTENTE" && slots.length > 0 && (
          <div className="space-y-2.5 pt-2 border-t border-gray-100">
            <p className="text-xs font-bold uppercase text-gray-700 tracking-wider">
              {slots.length > 1
                ? t("convocation.choose_slot", { defaultValue: "Choisissez votre créneau préféré parmi les propositions de l'employeur :" })
                : t("convocation.proposed_slot", { defaultValue: "Plage horaire proposée par l'employeur :" })}
            </p>
            {slots.length > 1 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {slots.map((slot, index) => {
                  const isSelected = selectedSlotIndex === index;
                  const isVirtuel = isLienVirtuel(slot.lieu);
                  return (
                    <button
                      type="button"
                      key={index}
                      onClick={() => setSelectedSlotIndex(index)}
                      className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex items-start justify-between gap-2 ${
                        isSelected
                          ? "bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 shadow-xs"
                          : "bg-gray-50/60 hover:bg-gray-100 border-gray-200"
                      }`}
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
                          <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span className="capitalize">{formatDate(slot.date)} {t("common.at", { defaultValue: "à" })} {formatTime(slot.date)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                          {isVirtuel ? (
                            <Video className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          ) : (
                            <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          )}
                          <span className="truncate" title={slot.lieu}>{slot.lieu || t("convocation.location_to_confirm", { defaultValue: "Lieu à confirmer" })}</span>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="w-full p-4 bg-blue-50/50 rounded-xl border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 text-xs font-bold text-gray-900">
                  <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="capitalize font-semibold text-sm">{formatDate(slots[0].date)} {t("common.at", { defaultValue: "à" })} {formatTime(slots[0].date)}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
                  {isLienVirtuel(slots[0].lieu) ? (
                    <Video className="w-4 h-4 text-indigo-600 shrink-0" />
                  ) : (
                    <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
                  )}
                  <span className="truncate max-w-md" title={slots[0].lieu}>
                    {slots[0].lieu || t("convocation.location_to_confirm", { defaultValue: "Lieu à confirmer" })}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {convocation.messageEmployeur && (
          <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-100 text-xs text-gray-700 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-blue-900">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{t("convocation.employer_instructions", { defaultValue: "Instructions de l'employeur :" })}</span>
            </div>
            <p className="text-gray-600 italic leading-relaxed">{convocation.messageEmployeur}</p>
          </div>
        )}

        {convocation.statut === "REFUSEE" && (convocation.reponseEtudiant || convocation.motifEtudiant) && (
          <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-100 text-xs text-rose-900 space-y-1">
            <p className="font-bold">
              {t("convocation.refusal_reason_label", { defaultValue: "Motif du refus transmis :" })}
            </p>
            <p className="text-rose-700 italic">"{convocation.reponseEtudiant || convocation.motifEtudiant}"</p>
          </div>
        )}

        {convocation.statut === "EN_ATTENTE" && (
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
              onClick={() => onAccepter(convocation.id, selectedSlot)}
              disabled={isLoading || !selectedSlot}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs hover:shadow-sm transition cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {isLoading ? t("convocation.processing", { defaultValue: "Traitement..." }) : t("convocation.btn_accept", { defaultValue: "Accepter l'entrevue" })}
            </button>
          </div>
        )}

        {convocation.statut === "EXPIREE" && (
          <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t border-gray-100">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              {t("convocation.expired_notice", {
                defaultValue: "La date limite pour répondre à cette convocation est maintenant échue.",
              })}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
