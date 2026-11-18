import {
    Calendar,
    CheckCircle2,
    Compass,
    FileSignature,
    UploadCloud,
    XCircle
} from "lucide-react";
import {
    extraireEntrepriseConvocation,
    extraireTitreConvocation
} from "./helpers.js";

export function construireActionsPrioritaires({
    cvState,
    contratsASigner,
    convocationsEnAttente,
    contrats,
    candidaturesEmbauchees,
    aTrouveStage,
    mesCandidaturesOffres,
    offresDisponiblesNonPostulees,
    changerOnglet,
    onSelectionnerOffre,
    t
}) {
    const items = [];
    const { cvExiste, status: statutCv, messageRefus, openUpload } = cvState;

    if (cvExiste && statutCv === "REFUSE") {
        items.push({
            id: "cv-refuse",
            priority: "urgent",
            badge: t("etudiant_dashboard.todo.urgent_badge"),
            tone: "border-rose-200 bg-rose-50/40",
            badgeTone: "bg-rose-100 text-rose-800",
            icon: XCircle,
            iconTone: "bg-rose-100 text-rose-600",
            title: t("etudiant_dashboard.todo.cv_refused_title"),
            desc: messageRefus
                ? t("modal_cv.refused_motif", { motif: messageRefus })
                : t("modal_cv.refused_no_motif"),
            ctaLabel: t("modal_cv.upload_corrected_title"),
            ctaClass: "btn-danger text-xs py-2 px-3.5",
            onAction: () => openUpload && openUpload()
        });
    } else if (cvExiste === false) {
        items.push({
            id: "cv-manquant",
            priority: "urgent",
            badge: t("etudiant_dashboard.todo.urgent_badge"),
            tone: "border-amber-200 bg-amber-50/40",
            badgeTone: "bg-amber-100 text-amber-800",
            icon: UploadCloud,
            iconTone: "bg-amber-100 text-amber-700",
            title: t("etudiant_dashboard.todo.cv_missing_title"),
            desc: t("etudiant_dashboard.todo.cv_missing_desc"),
            ctaLabel: t("modal_cv.upload"),
            ctaClass: "btn-primary text-xs py-2 px-3.5",
            onAction: () => openUpload && openUpload()
        });
    }

    contratsASigner.forEach((contrat) => {
        const { id, titreOffre, nomEntreprise } = contrat;
        items.push({
            id: `contrat-${id}`,
            priority: "urgent",
            badge: t("etudiant_dashboard.todo.urgent_badge"),
            tone: "border-blue-200 bg-blue-50/40",
            badgeTone: "bg-blue-100 text-blue-800",
            icon: FileSignature,
            iconTone: "bg-blue-100 text-blue-600",
            title: t("etudiant_dashboard.todo.contract_to_sign_title", { poste: titreOffre }),
            desc: t("etudiant_dashboard.todo.contract_to_sign_desc", { entreprise: nomEntreprise }),
            ctaLabel: t("etudiant_dashboard.todo.contract_sign_cta"),
            ctaClass: "btn-primary text-xs py-2 px-3.5",
            onAction: () => changerOnglet("contrats")
        });
    });

    convocationsEnAttente.forEach((conv) => {
        const poste = extraireTitreConvocation(conv, t("convocation.default_position"));
        const entreprise = extraireEntrepriseConvocation(conv, t("convocation.partner_company"));
        items.push({
            id: `conv-${conv.id}`,
            priority: "urgent",
            badge: t("etudiant_dashboard.todo.important_badge"),
            tone: "border-amber-200 bg-amber-50/30",
            badgeTone: "bg-amber-100 text-amber-800",
            icon: Calendar,
            iconTone: "bg-amber-100 text-amber-700",
            title: t("etudiant_dashboard.todo.interview_to_respond_title", { poste }),
            desc: t("etudiant_dashboard.todo.interview_to_respond_desc", { entreprise }),
            ctaLabel: t("etudiant_dashboard.todo.interview_respond_cta"),
            ctaClass: "btn-primary text-xs py-2 px-3.5",
            onAction: () => changerOnglet("convocations")
        });
    });

    if (contrats.length === 0 && candidaturesEmbauchees.length > 0) {
        const embauche = candidaturesEmbauchees[0];
        const { id, nomEntreprise, titre } = embauche;
        items.push({
            id: `hired-${id}`,
            priority: "info",
            badge: t("etudiant_dashboard.applications.status_hired"),
            tone: "border-emerald-200 bg-emerald-50/40",
            badgeTone: "bg-emerald-100 text-emerald-800",
            icon: CheckCircle2,
            iconTone: "bg-emerald-100 text-emerald-600",
            title: t("etudiant_dashboard.todo.hired_notice_title", {
                entreprise: nomEntreprise,
                poste: titre
            }),
            desc: t("etudiant_dashboard.todo.hired_notice_desc"),
            ctaLabel: t("offres_etudiant.btn_see_details"),
            ctaClass: "btn-secondary text-xs py-2 px-3.5",
            onAction: () => onSelectionnerOffre(embauche)
        });
    }

    if (
        items.length === 0 &&
        !aTrouveStage &&
        mesCandidaturesOffres.length === 0 &&
        offresDisponiblesNonPostulees.length > 0 &&
        cvExiste
    ) {
        items.push({
            id: "first-apply",
            priority: "normal",
            badge: t("etudiant_dashboard.todo.action_badge"),
            tone: "border-slate-200 bg-white",
            badgeTone: "bg-blue-50 text-blue-700",
            icon: Compass,
            iconTone: "bg-blue-50 text-blue-600",
            title: t("etudiant_dashboard.todo.first_application_title", {
                count: offresDisponiblesNonPostulees.length
            }),
            desc: t("etudiant_dashboard.todo.first_application_desc"),
            ctaLabel: t("etudiant_dashboard.todo.explore_cta"),
            ctaClass: "btn-primary text-xs py-2 px-3.5",
            onAction: () => changerOnglet("toutes")
        });
    }

    return items;
}

