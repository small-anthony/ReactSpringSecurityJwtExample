import React, { useState, useEffect, useContext } from "react";
import {
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  Inbox,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { AuthServiceContext } from "../../services/AuthService.tsx";
import {
  getConvocationsEtudiant,
  accepterConvocation,
  refuserConvocation,
} from "../../services/api/ConvocationAPI.js";
import ConvocationCard from "../convocation/ConvocationCard.jsx";
import ModalRefuserConvocation from "../modal/ModalRefuserConvocation.jsx";

export default function EtudiantConvocations({ embedMode = false, onPendingCountChange }) {
  const { t } = useTranslation("main");
  const authService = useContext(AuthServiceContext);

  const [convocations, setConvocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [messageSucces, setMessageSucces] = useState(null);
  const [filtre, setFiltre] = useState("TOUTES");

  const [modalRefusOpen, setModalRefusOpen] = useState(false);
  const [convocationRefusCible, setConvocationRefusCible] = useState(null);

  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [modalSubmitting, setModalSubmitting] = useState(false);

  const chargerConvocations = async () => {
    try {
      setLoading(true);
      setErreur(null);
      const authHeader = authService.buildAuthHeader();
      const data = await getConvocationsEtudiant(authHeader);
      setConvocations(data || []);
      if (onPendingCountChange) {
        const pending = (data || []).filter((c) => c.statut === "EN_ATTENTE").length;
        onPendingCountChange(pending);
      }
    } catch (e) {
      setErreur(e.message || "Erreur lors du chargement des convocations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    chargerConvocations();
  }, []);

  const notifierSucces = (msg) => {
    setMessageSucces(msg);
    setTimeout(() => {
      setMessageSucces(null);
    }, 4500);
  };

  const handleAccepter = async (id, selectedSlot) => {
    try {
      setActionLoadingId(id);
      setErreur(null);
      const authHeader = authService.buildAuthHeader();
      const updated = await accepterConvocation(id, selectedSlot, authHeader);

      setConvocations((prev) =>
        prev.map((c) => (c.id === id ? updated : c))
      );
      notifierSucces(
        t("convocation.success_accepted", {
          defaultValue: "Félicitations ! L'entrevue a été confirmée et ajoutée à votre profil.",
        })
      );
    } catch (e) {
      setErreur(e.message || "Erreur lors de l'acceptation");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleOuvrirRefus = (convocation) => {
    setConvocationRefusCible(convocation);
    setModalRefusOpen(true);
  };

  const handleConfirmerRefus = async (motif) => {
    if (!convocationRefusCible) return;
    try {
      setModalSubmitting(true);
      setErreur(null);
      const authHeader = authService.buildAuthHeader();
      const updated = await refuserConvocation(
        convocationRefusCible.id,
        motif,
        authHeader
      );

      setConvocations((prev) =>
        prev.map((c) => (c.id === convocationRefusCible.id ? updated : c))
      );
      setModalRefusOpen(false);
      setConvocationRefusCible(null);
      notifierSucces(
        t("convocation.success_refused", {
          defaultValue: "La convocation a été refusée. L'employeur en a été notifié.",
        })
      );
    } catch (e) {
      setErreur(e.message || "Erreur lors du refus de la convocation");
    } finally {
      setModalSubmitting(false);
    }
  };

  const convocationsFiltrees = convocations.filter((c) => {
    if (filtre === "TOUTES") return true;
    if (filtre === "EN_ATTENTE") return c.statut === "EN_ATTENTE";
    if (filtre === "ACCEPTEE") return c.statut === "ACCEPTEE";
    if (filtre === "REFUSEE") return c.statut === "REFUSEE";
    if (filtre === "EXPIREE") return c.statut === "EXPIREE";
    return true;
  });

  const countEnAttente = convocations.filter((c) => c.statut === "EN_ATTENTE").length;
  const countAcceptees = convocations.filter((c) => c.statut === "ACCEPTEE").length;
  const countExpirees = convocations.filter((c) => c.statut === "EXPIREE").length;

  const content = (
    <>
      <div className={embedMode ? "space-y-6" : "max-w-5xl mx-auto space-y-6"}>
      {!embedMode ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
              <Calendar className="w-8 h-8 text-blue-600" />
              <span>{t("convocation.title", { defaultValue: "Mes Convocations d'Entrevue" })}</span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {t("convocation.subtitle", {
                defaultValue: "Gérez les invitations d'entrevues envoyées par vos employeurs potentiels.",
              })}
            </p>
          </div>

          <button
            type="button"
            onClick={chargerConvocations}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl shadow-xs transition cursor-pointer self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-blue-600" : ""}`} />
            <span>{t("convocation.btn_refresh", { defaultValue: "Actualiser" })}</span>
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <p className="text-sm text-gray-500">
            {t("convocation.subtitle", {
              defaultValue: "Gérez vos invitations d'entrevues envoyées par vos employeurs.",
            })}
          </p>
          <button
            type="button"
            onClick={chargerConvocations}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl shadow-xs transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-blue-600" : ""}`} />
            <span>{t("convocation.btn_refresh", { defaultValue: "Actualiser" })}</span>
          </button>
        </div>
      )}

        {messageSucces && (
          <div className="p-4 bg-emerald-50 text-emerald-800 border-l-4 border-emerald-500 rounded-xl shadow-xs flex items-center gap-3 animate-in fade-in duration-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-sm font-semibold">{messageSucces}</span>
          </div>
        )}

        {erreur && (
          <div className="p-4 bg-rose-50 text-rose-800 border-l-4 border-rose-500 rounded-xl shadow-xs flex items-center gap-3 animate-in fade-in duration-200">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span className="text-sm font-semibold">{erreur}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => setFiltre("TOUTES")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              filtre === "TOUTES"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            {t("convocation.filter_all", { defaultValue: "Toutes" })} ({convocations.length})
          </button>

          <button
            type="button"
            onClick={() => setFiltre("EN_ATTENTE")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer inline-flex items-center gap-1.5 ${
              filtre === "EN_ATTENTE"
                ? "bg-amber-600 text-white shadow-xs"
                : "bg-white text-amber-700 hover:bg-amber-50 border border-amber-200"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>
              {t("convocation.filter_pending", { defaultValue: "En attente" })} ({countEnAttente})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFiltre("ACCEPTEE")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer inline-flex items-center gap-1.5 ${
              filtre === "ACCEPTEE"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>
              {t("convocation.filter_confirmed", { defaultValue: "Confirmées" })} ({countAcceptees})
            </span>
          </button>

          {countExpirees > 0 && (
            <button
              type="button"
              onClick={() => setFiltre("EXPIREE")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                filtre === "EXPIREE"
                  ? "bg-gray-700 text-white shadow-xs"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              {t("convocation.status.expiree", { defaultValue: "Expirées" })} ({countExpirees})
            </button>
          )}

          <button
            type="button"
            onClick={() => setFiltre("REFUSEE")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              filtre === "REFUSEE"
                ? "bg-rose-600 text-white shadow-xs"
                : "bg-white text-rose-700 hover:bg-rose-50 border border-rose-200"
            }`}
          >
            {t("convocation.filter_refused", { defaultValue: "Refusées" })}
          </button>
        </div>

        {loading && convocations.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
            <p className="text-sm font-semibold text-gray-500">
              {t("convocation.loading", { defaultValue: "Chargement de vos convocations..." })}
            </p>
          </div>
        ) : convocationsFiltrees.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center space-y-3">
            <Inbox className="w-12 h-12 text-gray-300 mx-auto" />
            <h3 className="text-base font-bold text-gray-700">
              {t("convocation.empty_title", { defaultValue: "Aucune convocation" })}
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              {filtre === "TOUTES"
                ? t("convocation.empty_desc_all", {
                    defaultValue: "Vous n'avez pas encore reçu de convocation d'entrevue pour vos candidatures.",
                  })
                : t("convocation.empty_desc_filter", {
                    defaultValue: "Aucune convocation ne correspond au filtre sélectionné.",
                  })}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {convocationsFiltrees.map((convocation) => (
              <ConvocationCard
                key={convocation.id}
                convocation={convocation}
                onAccepter={handleAccepter}
                onRefuser={handleOuvrirRefus}
                actionLoadingId={actionLoadingId}
              />
            ))}
          </div>
        )}
      </div>

      <ModalRefuserConvocation
        isOpen={modalRefusOpen}
        onClose={() => {
          setModalRefusOpen(false);
          setConvocationRefusCible(null);
        }}
        onConfirm={handleConfirmerRefus}
        convocation={convocationRefusCible}
        loading={modalSubmitting}
      />
    </>
  );

  if (embedMode) {
    return content;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      {content}
    </div>
  );
}
