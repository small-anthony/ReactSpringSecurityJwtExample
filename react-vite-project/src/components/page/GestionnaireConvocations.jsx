import React, { useState, useEffect, useContext } from "react";
import { Calendar, Users, Building, RefreshCw, Clock, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AuthServiceContext } from "../../services/AuthService.tsx";
import { getConvocationsGestionnaire } from "../../services/api/ConvocationAPI.jsx";
import SidePanelGestionnaire from "../widget/SidePanelGestionnaire.jsx";

export default function GestionnaireConvocations() {
  const { t, i18n } = useTranslation("main");
  const authService = useContext(AuthServiceContext);
  const [convocations, setConvocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState(null);

  const chargerConvocations = async () => {
    try {
      setLoading(true);
      setErreur(null);
      const authHeader = authService.buildAuthHeader();
      const data = await getConvocationsGestionnaire(authHeader);
      setConvocations(data);
    } catch (e) {
      setErreur(e.message || "Erreur lors du chargement des convocations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    chargerConvocations();
  }, []);

  const formatDate = (d) => {
    if (!d) return "N/D";
    const currentLocale = i18n.language?.startsWith("en") ? "en-US" : "fr-CA";
    return new Date(d).toLocaleDateString(currentLocale, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (statut) => {
    switch (statut) {
      case "ACCEPTEE":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            {t("convocation.status.acceptee", { defaultValue: "Acceptée" })}
          </span>
        );
      case "REFUSEE":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
            {t("convocation.status.refusee", { defaultValue: "Refusée" })}
          </span>
        );
      case "EXPIREE":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-300">
            {t("convocation.status.expiree", { defaultValue: "Expirée" })}
          </span>
        );
      case "ANNULEE":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-300">
            {t("convocation.status.annulee", { defaultValue: "Annulée" })}
          </span>
        );
      case "EN_ATTENTE":
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            {t("convocation.status.en_attente", { defaultValue: "En attente" })}
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50/40">
      <SidePanelGestionnaire activeTab="convocations" />

      <main className="flex-1 p-6 sm:p-10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2.5">
              <Calendar className="w-7 h-7 text-blue-600" />
              <span>{t("gestionnaire_convocations.title", { defaultValue: "Suivi des Convocations en Entrevue" })}</span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {t("gestionnaire_convocations.subtitle", {
                defaultValue: "Vue d'ensemble de tous les étudiants convoqués en entrevue par les employeurs.",
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

        {erreur && (
          <div className="p-4 bg-red-50 text-red-700 border-l-4 border-red-500 rounded-xl text-sm">
            {erreur}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-gray-500">
              {convocations.length > 1
                ? t("gestionnaire_convocations.total_plural", { count: convocations.length, defaultValue: `Total : ${convocations.length} convocations` })
                : t("gestionnaire_convocations.total", { count: convocations.length, defaultValue: `Total : ${convocations.length} convocation` })}
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-sm text-gray-500">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
              {t("gestionnaire_convocations.loading", { defaultValue: "Chargement des convocations..." })}
            </div>
          ) : convocations.length === 0 ? (
            <div className="p-12 text-center text-sm text-gray-500">
              {t("gestionnaire_convocations.empty", { defaultValue: "Aucune convocation d'entrevue enregistrée pour le moment." })}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50/70 text-xs font-bold uppercase text-gray-500 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4">{t("gestionnaire_convocations.th_student", { defaultValue: "Étudiant" })}</th>
                    <th className="px-6 py-4">{t("gestionnaire_convocations.th_position_company", { defaultValue: "Poste & Entreprise" })}</th>
                    <th className="px-6 py-4">{t("gestionnaire_convocations.th_datetime", { defaultValue: "Date & Heure" })}</th>
                    <th className="px-6 py-4">{t("gestionnaire_convocations.th_location", { defaultValue: "Lieu / Lien" })}</th>
                    <th className="px-6 py-4">{t("gestionnaire_convocations.th_status", { defaultValue: "Statut" })}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {convocations.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50/60 transition">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">
                          {c.etudiant ? `${c.etudiant.firstName} ${c.etudiant.lastName}` : (c.nomCompletEtudiant || "Étudiant")}
                        </div>
                        <div className="text-xs text-gray-400">
                          {c.etudiant?.matricule ? `${t("gestionnaire_convocations.matricule", { defaultValue: "Matricule :" })} ${c.etudiant.matricule}` : (c.matriculeEtudiant ? `${t("gestionnaire_convocations.matricule", { defaultValue: "Matricule :" })} ${c.matriculeEtudiant}` : (c.etudiant?.email || c.etudiantEmail))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-800">{c.offreStage?.titre || c.titrePoste || "Stage"}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <Building className="w-3 h-3 text-gray-400" />
                          <span>{c.offreStage?.nomEntreprise || c.nomEntreprise || "N/D"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-700">
                        {formatDate(c.rendezVousSelection?.date || c.rendezVousPossibles?.[0]?.date || c.dateHeure)}
                      </td>
                      <td className="px-6 py-4 max-w-xs truncate text-xs text-gray-600" title={c.rendezVousSelection?.lieu || c.rendezVousPossibles?.[0]?.lieu || c.lieu}>
                        {c.rendezVousSelection?.lieu || c.rendezVousPossibles?.[0]?.lieu || c.lieu || "N/D"}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(c.statut)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
