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

function determinerLocale(instanceI18n) {
  const langue = instanceI18n ? instanceI18n.language : "";
  if (typeof langue === "string" && langue.startsWith("en")) {
    return "en-US";
  }
  return "fr-CA";
}

function extraireTitreOffre(offreStage) {
  if (!offreStage) {
    return null;
  }
  return offreStage.titre;
}

function extraireNomEntrepriseOffre(offreStage) {
  if (!offreStage) {
    return null;
  }
  return offreStage.nomEntreprise;
}

function extraireCreneaux(convocation) {
  const { rendezVousPossibles, dateHeure, lieu } = convocation;
  if (Array.isArray(rendezVousPossibles) && rendezVousPossibles.length > 0) {
    return rendezVousPossibles;
  }
  if (dateHeure) {
    return [{ date: dateHeure, lieu }];
  }
  return [];
}

function contientMotCleVirtuel(texte) {
  return (
    texte.includes("teams") ||
    texte.includes("meet") ||
    texte.includes("zoom") ||
    texte.includes("http")
  );
}

function isLienVirtuel(lieu) {
  if (typeof lieu !== "string") {
    return false;
  }
  return contientMotCleVirtuel(lieu.toLowerCase());
}

export default function ConvocationCard({
  convocation,
  onAccepter,
  onRefuser,
  actionLoadingId,
}) {
  const { t, i18n } = useTranslation("main");

  const {
    id,
    statut,
    offreStage,
    titrePoste,
    nomEntreprise,
    dateLimite,
    rendezVousSelection,
    messageEmployeur,
    reponseEtudiant,
    motifEtudiant,
  } = convocation;

  const slots = extraireCreneaux(convocation);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(0);

  const premierCreneau = slots.length > 0 ? slots[0] : null;
  const selectedSlot = slots[selectedSlotIndex] || premierCreneau || null;
  const confirmedSlot =
    rendezVousSelection || (statut === "ACCEPTEE" ? selectedSlot : null);

  const isLoading = actionLoadingId === id;
  const currentLocale = determinerLocale(i18n);

  const formatDate = (d) => {
    if (!d) return t("common.not_available");
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
    switch (statut) {
      case "ACCEPTEE":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {t("convocation.status.acceptee")}
          </span>
        );
      case "REFUSEE":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            {t("convocation.status.refusee")}
          </span>
        );
      case "EXPIREE":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            {t("convocation.status.expiree")}
          </span>
        );
      case "ANNULEE":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-300">
            <XCircle className="w-3.5 h-3.5 text-slate-500" />
            {t("convocation.status.annulee")}
          </span>
        );
      case "EN_ATTENTE":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            {t("convocation.status.en_attente")}
          </span>
        );
    }
  };

  const titreAffiche =
    extraireTitreOffre(offreStage) || titrePoste || t("convocation.default_position");
  const entrepriseAffichee =
    extraireNomEntrepriseOffre(offreStage) || nomEntreprise || t("convocation.partner_company");
  const motifRefusAffiche = reponseEtudiant || motifEtudiant;
  const dateConfirmee = confirmedSlot ? confirmedSlot.date : null;
  const lieuConfirme = confirmedSlot ? confirmedSlot.lieu : null;
  const datePremierCreneau = premierCreneau ? premierCreneau.date : null;
  const lieuPremierCreneau = premierCreneau ? premierCreneau.lieu : null;

  return (
    <div className="ds-card overflow-hidden">
      <div className="p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
              {t("convocation.card_tag")}
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
              {titreAffiche}
            </h3>
            <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 mt-1">
              <Building className="w-4 h-4 text-slate-400" />
              <span>{entrepriseAffichee}</span>
            </div>
          </div>
          <div className="shrink-0 flex flex-col items-end gap-1.5">
            {getStatusBadge()}
            {statut === "EN_ATTENTE" && dateLimite && (
              <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                {t("convocation.deadline_notice")} {formatDate(dateLimite)}
              </span>
            )}
          </div>
        </div>

        {statut === "ACCEPTEE" && confirmedSlot && (
          <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-200 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wide text-emerald-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {t("convocation.confirmed_interview")}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="flex items-center gap-2.5 text-xs text-slate-700">
                <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold">
                  {formatDate(dateConfirmee)} {t("common.at")} {formatTime(dateConfirmee)}
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-700">
                {isLienVirtuel(lieuConfirme) ? (
                  <Video className="w-4 h-4 text-indigo-600 shrink-0" />
                ) : (
                  <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
                )}
                <span className="truncate" title={lieuConfirme}>
                  {lieuConfirme || t("convocation.location_to_confirm")}
                </span>
              </div>
            </div>
          </div>
        )}

        {statut === "EN_ATTENTE" && slots.length > 0 && (
          <div className="space-y-2.5 pt-2 border-t border-slate-100">
            <p className="text-xs font-bold uppercase text-slate-700 tracking-wider">
              {slots.length > 1
                ? t("convocation.choose_slot")
                : t("convocation.proposed_slot")}
            </p>
            {slots.length > 1 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {slots.map((slot, index) => {
                  const { date: dateSlot, lieu: lieuSlot } = slot;
                  const isSelected = selectedSlotIndex === index;
                  const isVirtuel = isLienVirtuel(lieuSlot);
                  return (
                    <button
                      type="button"
                      key={index}
                      onClick={() => setSelectedSlotIndex(index)}
                      className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex items-start justify-between gap-2 ${
                        isSelected
                          ? "bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 shadow-xs"
                          : "bg-slate-50/60 hover:bg-slate-100 border-slate-200"
                      }`}
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                          <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span className="capitalize">
                            {formatDate(dateSlot)} {t("common.at")} {formatTime(dateSlot)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          {isVirtuel ? (
                            <Video className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          ) : (
                            <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          )}
                          <span className="truncate" title={lieuSlot}>
                            {lieuSlot || t("convocation.location_to_confirm")}
                          </span>
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
                <div className="flex items-center gap-2.5 text-xs font-bold text-slate-900">
                  <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="capitalize font-semibold text-sm">
                    {formatDate(datePremierCreneau)} {t("common.at")} {formatTime(datePremierCreneau)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                  {isLienVirtuel(lieuPremierCreneau) ? (
                    <Video className="w-4 h-4 text-indigo-600 shrink-0" />
                  ) : (
                    <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
                  )}
                  <span className="truncate max-w-md" title={lieuPremierCreneau}>
                    {lieuPremierCreneau || t("convocation.location_to_confirm")}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {messageEmployeur && (
          <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-100 text-xs text-slate-700 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-blue-900">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{t("convocation.employer_instructions")}</span>
            </div>
            <p className="text-slate-600 italic leading-relaxed">{messageEmployeur}</p>
          </div>
        )}

        {statut === "REFUSEE" && motifRefusAffiche && (
          <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-100 text-xs text-rose-900 space-y-1">
            <p className="font-bold">
              {t("convocation.refusal_reason_label")}
            </p>
            <p className="text-rose-700 italic">"{motifRefusAffiche}"</p>
          </div>
        )}

        {statut === "EN_ATTENTE" && (
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => onRefuser(convocation)}
              disabled={isLoading}
              className="btn-danger-soft text-xs py-2 px-4"
            >
              {t("convocation.btn_refuse")}
            </button>

            <button
              type="button"
              onClick={() => onAccepter(id, selectedSlot)}
              disabled={isLoading || !selectedSlot}
              className="btn-success text-xs py-2 px-5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {isLoading ? t("convocation.processing") : t("convocation.btn_accept")}
            </button>
          </div>
        )}

        {statut === "EXPIREE" && (
          <div className="flex items-center gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            <span>{t("convocation.expired_notice")}</span>
          </div>
        )}
      </div>
    </div>
  );
}
