import { Building2, Calendar, DollarSign, GraduationCap, MapPin, Phone } from "lucide-react";
import { useTranslation } from "react-i18next";
import ModalConfirmation from "./ModalConfirmation.jsx";
import { useOffreFormater } from "../../hooks/useOffreFormater.js";

export default function ModalConfirmerChoixStage({
    isOpen,
    offre,
    onClose,
    onConfirm,
    loading = false
}) {
    const { t } = useTranslation("main");
    const { traduireDiscipline, formaterSalaire } = useOffreFormater();

    if (!isOpen || !offre) {
        return null;
    }

    const {
        titre,
        nomEntreprise,
        discipline,
        salaire,
        dateDebut,
        dateFin,
        adresse,
        ville,
        codePostal,
        telephone,
        exigences
    } = offre;

    const adresseComplete = [adresse, ville, codePostal].filter(Boolean).join(", ");
    const periodeStage = dateDebut && dateFin
        ? `${dateDebut} → ${dateFin}`
        : dateDebut || dateFin || t("offres_etudiant.modal.not_specified");

    return (
        <ModalConfirmation
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={onConfirm}
            loading={loading}
            type="info"
            title={t("candidature_etudiant.confirm_choose_title")}
            message={t("candidature_etudiant.confirm_choose_message")}
            confirmText={t("candidature_etudiant.confirm_choose_btn")}
            details={
                <div className="space-y-2.5 text-xs font-normal text-slate-700">
                    <div>
                        <p className="text-sm font-bold text-slate-900 break-words">{titre}</p>
                        <p className="text-xs font-semibold text-blue-700 flex items-center gap-1.5 mt-0.5">
                            <Building2 className="w-3.5 h-3.5 shrink-0" />
                            <span>{nomEntreprise}</span>
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200/80">
                        {discipline && (
                            <p className="flex items-center gap-1.5">
                                <GraduationCap className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                <span>{traduireDiscipline(discipline)}</span>
                            </p>
                        )}
                        <p className="flex items-center gap-1.5">
                            <DollarSign className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{formaterSalaire(salaire)}</span>
                        </p>
                        <p className="flex items-center gap-1.5 sm:col-span-2">
                            <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span>{periodeStage}</span>
                        </p>
                        {adresseComplete && (
                            <p className="flex items-start gap-1.5 sm:col-span-2">
                                <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                                <span className="break-words">{adresseComplete}</span>
                            </p>
                        )}
                        {telephone && (
                            <p className="flex items-center gap-1.5 sm:col-span-2">
                                <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                <span>{telephone}</span>
                            </p>
                        )}
                    </div>
                    {exigences && (
                        <div className="pt-2 border-t border-slate-200/80">
                            <span className="font-semibold text-slate-800 block mb-0.5">
                                {t("offres_etudiant.modal.requirements")} :
                            </span>
                            <p className="text-slate-600 line-clamp-3 break-words">{exigences}</p>
                        </div>
                    )}
                </div>
            }
        />
    );
}
