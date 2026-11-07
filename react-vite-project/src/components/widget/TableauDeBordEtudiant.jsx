import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
    ArrowRight,
    Briefcase,
    Building2,
    Calendar,
    CheckCircle2,
    Compass,
    FileSignature,
    FileText,
    MapPin,
    Sparkles,
    UploadCloud,
    Video,
    XCircle
} from "lucide-react";

const MESSAGE_OFFRE_SUPPRIMEE = "L'offre a été supprimée par l'employeur";

function contientTexte(texteSource, texteRecherche) {
    if (typeof texteSource !== "string") {
        return false;
    }
    return texteSource.toLowerCase().includes(texteRecherche);
}

function contientMotCleVirtuel(texte) {
    return (
        texte.includes("teams") ||
        texte.includes("meet") ||
        texte.includes("zoom") ||
        texte.includes("http")
    );
}

function estLienVirtuel(lieu) {
    if (typeof lieu !== "string") {
        return false;
    }
    return contientMotCleVirtuel(lieu.toLowerCase());
}

function extrairePremierElement(liste) {
    if (!Array.isArray(liste) || liste.length === 0) {
        return null;
    }
    return liste[0];
}

function extraireCreneauEntrevue(convocation) {
    if (!convocation) {
        return null;
    }
    const { rendezVousSelection, rendezVousPossibles, dateHeure, lieu } = convocation;
    if (rendezVousSelection) {
        return rendezVousSelection;
    }
    const premierPossible = extrairePremierElement(rendezVousPossibles);
    if (premierPossible) {
        return premierPossible;
    }
    if (dateHeure) {
        return { date: dateHeure, lieu };
    }
    return null;
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

function extraireTitreConvocation(convocation, titreParDefaut) {
    if (!convocation) {
        return titreParDefaut;
    }
    const { offreStage, titrePoste } = convocation;
    return extraireTitreOffre(offreStage) || titrePoste || titreParDefaut;
}

function extraireEntrepriseConvocation(convocation, entrepriseParDefaut) {
    if (!convocation) {
        return entrepriseParDefaut;
    }
    const { offreStage, nomEntreprise } = convocation;
    return extraireNomEntrepriseOffre(offreStage) || nomEntreprise || entrepriseParDefaut;
}

export function extrairePremiereCandidature(offre) {
    if (!offre) {
        return null;
    }
    return extrairePremierElement(offre.candidatures);
}

export function obtenirStatutCandidature(offre, candidaturesParOffre) {
    if (!offre) {
        return "EN_ATTENTE";
    }
    const candidature = candidaturesParOffre[offre.id] || extrairePremiereCandidature(offre);
    if (!candidature || !candidature.statut) {
        return "EN_ATTENTE";
    }
    return candidature.statut;
}

function estContratSigneNonRefuse(contrat) {
    if (!contrat) {
        return false;
    }
    return Boolean(contrat.signeParEtudiant) && contrat.statut !== "REFUSE";
}

function estContratActifNonArchive(contrat) {
    if (!estContratSigneNonRefuse(contrat)) {
        return false;
    }
    return !contientTexte(contrat.titreOffre, "archive");
}

export function trouverContratSigneActif(contrats, contratsASigner) {
    const nonArchive = contrats.filter(estContratActifNonArchive);
    if (nonArchive.length > 0) {
        return nonArchive.find((c) => c.statut === "COMPLETE") || nonArchive[0];
    }
    if (contratsASigner.length > 0) {
        return null;
    }
    return (
        contrats.find((c) => c.statut === "COMPLETE") ||
        contrats.find(estContratSigneNonRefuse) ||
        null
    );
}

export function construireStatutParcours({
    contratsASigner,
    contratSigneActif,
    candidaturesEmbauchees,
    convocationsEnAttente,
    convocationsConfirmees,
    cvState,
    mesCandidaturesOffres,
    t
}) {
    const statutContratActif = contratSigneActif ? contratSigneActif.statut : null;
    const { cvExiste, status: statutCv } = cvState;

    if (contratsASigner.length > 0) {
        return {
            label: t("etudiant_dashboard.journey_status.contract_to_sign"),
            tone: "bg-amber-50 text-amber-800 border-amber-200",
            dot: "bg-amber-500"
        };
    }
    if (statutContratActif === "COMPLETE") {
        return {
            label: t("etudiant_dashboard.journey_status.contract_validated"),
            tone: "bg-emerald-50 text-emerald-800 border-emerald-200",
            dot: "bg-emerald-500"
        };
    }
    if (contratSigneActif) {
        return {
            label: t("etudiant_dashboard.journey_status.stage_found"),
            tone: "bg-emerald-50 text-emerald-800 border-emerald-200",
            dot: "bg-emerald-500"
        };
    }
    if (candidaturesEmbauchees.length > 0) {
        return {
            label: t("etudiant_dashboard.journey_status.hired_waiting_contract"),
            tone: "bg-emerald-50 text-emerald-800 border-emerald-200",
            dot: "bg-emerald-500"
        };
    }
    if (convocationsEnAttente.length > 0) {
        return {
            label: t("etudiant_dashboard.journey_status.interview_pending"),
            tone: "bg-amber-50 text-amber-800 border-amber-200",
            dot: "bg-amber-500"
        };
    }
    if (convocationsConfirmees.length > 0) {
        return {
            label: t("etudiant_dashboard.journey_status.interview_confirmed"),
            tone: "bg-indigo-50 text-indigo-800 border-indigo-200",
            dot: "bg-indigo-500"
        };
    }
    if (cvExiste === false || statutCv === "REFUSE") {
        return {
            label: t("etudiant_dashboard.journey_status.cv_required"),
            tone: "bg-rose-50 text-rose-800 border-rose-200",
            dot: "bg-rose-500"
        };
    }
    if (mesCandidaturesOffres.length > 0) {
        return {
            label: t("etudiant_dashboard.journey_status.applications_in_progress"),
            tone: "bg-blue-50 text-blue-800 border-blue-200",
            dot: "bg-blue-500"
        };
    }
    return {
        label: t("etudiant_dashboard.journey_status.searching"),
        tone: "bg-slate-100 text-slate-700 border-slate-200",
        dot: "bg-blue-500"
    };
}

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

function calculerScoreStatut(statut) {
    if (statut === "EMBAUCHEE") return 4;
    if (statut === "ACCEPTE" || statut === "ACCEPTEE") return 3;
    if (statut === "EN_ATTENTE" || statut === "EN_ATTENTE_REPONSE") return 2;
    if (statut === "REFUSEE" || statut === "REFUSE") return 1;
    return 0;
}

function SectionActionsPrioritaires({ actionsPrioritaires, t }) {
    return (
        <section className="ds-card p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>{t("etudiant_dashboard.todo.title")}</span>
                </h2>
            </div>

            {actionsPrioritaires.length === 0 ? (
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 text-emerald-900">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div className="text-xs">
                        <p className="font-bold">
                            {t("etudiant_dashboard.todo.all_caught_up_title")}
                        </p>
                        <p className="text-emerald-700 mt-0.5">
                            {t("etudiant_dashboard.todo.all_caught_up_desc")}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    {actionsPrioritaires.map((item) => {
                        const {
                            id,
                            icon: Icon,
                            tone,
                            iconTone,
                            badgeTone,
                            badge,
                            title,
                            desc,
                            onAction,
                            ctaClass,
                            ctaLabel
                        } = item;
                        return (
                            <div
                                key={id}
                                className={`p-4 rounded-xl border ${tone} flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 transition-all`}
                            >
                                <div className="flex items-start gap-3 min-w-0">
                                    <div
                                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconTone}`}
                                    >
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <div className="space-y-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span
                                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${badgeTone}`}
                                            >
                                                {badge}
                                            </span>
                                            <h3 className="text-sm font-bold text-slate-900">
                                                {title}
                                            </h3>
                                        </div>
                                        <p className="text-xs text-slate-600 leading-relaxed">
                                            {desc}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={onAction}
                                    className={`${ctaClass} shrink-0`}
                                >
                                    <span>{ctaLabel}</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}

function SectionCandidaturesRecentes({
    candidaturesTrieesApercu,
    totalCandidatures,
    nombreOffresDisponibles,
    candidaturesParOffre,
    renderCandidatureBadge,
    traduireDuree,
    changerOnglet,
    onSelectionnerOffre,
    t
}) {
    return (
        <section className="ds-card p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-blue-600" />
                    <span>{t("etudiant_dashboard.applications.title")}</span>
                </h2>
                {totalCandidatures > 0 && (
                    <button
                        type="button"
                        onClick={() => changerOnglet("mes_candidatures")}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 cursor-pointer"
                    >
                        <span>
                            {t("etudiant_dashboard.applications.view_all", {
                                count: totalCandidatures
                            })}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>

            {candidaturesTrieesApercu.length === 0 ? (
                <div className="p-6 rounded-xl border border-dashed border-slate-200 text-center space-y-2.5 bg-slate-50/50">
                    <p className="text-sm font-bold text-slate-800">
                        {t("etudiant_dashboard.applications.empty_title")}
                    </p>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        {t("etudiant_dashboard.applications.empty_desc")}
                    </p>
                    {nombreOffresDisponibles > 0 && (
                        <div className="pt-1">
                            <button
                                type="button"
                                onClick={() => changerOnglet("toutes")}
                                className="btn-outline text-xs py-2 px-4"
                            >
                                <span>{t("etudiant_dashboard.todo.explore_cta")}</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="divide-y divide-slate-100">
                    {candidaturesTrieesApercu.map((offre) => {
                        const { id, titre, nomEntreprise, duree } = offre;
                        const candidature = candidaturesParOffre[id];
                        const statut = candidature ? candidature.statut : null;
                        const messageReponse = candidature ? candidature.messageReponse : null;
                        const texteRefus =
                            messageReponse === MESSAGE_OFFRE_SUPPRIMEE
                                ? t("candidature_etudiant.offer_deleted")
                                : messageReponse;

                        return (
                            <div
                                key={id}
                                className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                            >
                                <div className="min-w-0 space-y-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="text-sm font-bold text-slate-900 truncate">
                                            {titre}
                                        </h3>
                                        {renderCandidatureBadge(id)}
                                    </div>
                                    <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                        <span>{nomEntreprise}</span>
                                        {duree && (
                                            <>
                                                <span className="text-slate-300">•</span>
                                                <span>{traduireDuree(duree)}</span>
                                            </>
                                        )}
                                    </p>
                                    {statut === "REFUSEE" && texteRefus && (
                                        <p className="text-xs text-rose-600 line-clamp-1">
                                            {texteRefus}
                                        </p>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => onSelectionnerOffre(offre)}
                                    className="btn-secondary text-xs py-1.5 px-3 shrink-0"
                                >
                                    {t("offres_etudiant.btn_see_details")}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}

function CarteStageConfirme({ contratSigneActif, changerOnglet, t }) {
    const { titreOffre, nomEntreprise, dateDebut, dateFin, salaire, statut } = contratSigneActif;
    return (
        <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h2 className="text-lg font-extrabold text-slate-900">
                        {titreOffre}
                    </h2>
                    <p className="text-sm font-semibold text-blue-600 flex items-center gap-1.5 mt-0.5">
                        <Building2 className="w-4 h-4" />
                        <span>{nomEntreprise}</span>
                    </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                    {t("contrats_etudiant.status_stage_trouve")}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="block text-[10px] font-bold uppercase text-slate-400">
                        {t("contrats.table.dates")}
                    </span>
                    <span className="font-semibold text-slate-800 mt-0.5 block">
                        {dateDebut} → {dateFin}
                    </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="block text-[10px] font-bold uppercase text-slate-400">
                        {t("contrats.table.salary")}
                    </span>
                    <span className="font-bold text-emerald-700 mt-0.5 block">
                        {salaire}
                    </span>
                </div>
            </div>

            <p className="text-xs text-slate-600 bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3 font-medium">
                {statut === "COMPLETE"
                    ? t("etudiant_dashboard.next_step.stage_confirmed_complete")
                    : t("etudiant_dashboard.next_step.stage_confirmed_waiting_others")}
            </p>

            <button
                type="button"
                onClick={() => changerOnglet("contrats")}
                className="btn-outline w-full text-xs py-2.5"
            >
                <FileText className="w-4 h-4" />
                <span>{t("etudiant_dashboard.next_step.view_contract_cta")}</span>
            </button>
        </div>
    );
}

function CarteProchaineEntrevue({ prochaineEntrevue, formatShortDate, changerOnglet, t }) {
    const { statut } = prochaineEntrevue;
    const titrePoste = extraireTitreConvocation(
        prochaineEntrevue,
        t("convocation.default_position")
    );
    const nomEntreprise = extraireEntrepriseConvocation(prochaineEntrevue, "");
    const creneau = extraireCreneauEntrevue(prochaineEntrevue);
    const dateCreneau = creneau ? creneau.date : null;
    const lieuCreneau = creneau ? creneau.lieu : null;
    const estAcceptee = statut === "ACCEPTEE";

    return (
        <div className="space-y-4">
            <div className="flex items-start justify-between gap-2">
                <div>
                    <h2 className="text-base font-extrabold text-slate-900">
                        {t("etudiant_dashboard.next_step.upcoming_interview_title")}
                    </h2>
                    <p className="text-sm font-semibold text-slate-700 mt-0.5">
                        {titrePoste}
                    </p>
                    <p className="text-xs text-slate-500">
                        {nomEntreprise}
                    </p>
                </div>
                <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 ${
                        estAcceptee
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                    }`}
                >
                    {estAcceptee
                        ? t("convocation.status.acceptee")
                        : t("convocation.filter_pending")}
                </span>
            </div>

            {creneau && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                    <div className="flex items-center gap-2 font-bold text-slate-900">
                        <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                        <span className="capitalize">
                            {formatShortDate(dateCreneau)}
                        </span>
                    </div>
                    {lieuCreneau && (
                        <div className="flex items-center gap-2 text-slate-600">
                            {estLienVirtuel(lieuCreneau) ? (
                                <Video className="w-4 h-4 text-indigo-600 shrink-0" />
                            ) : (
                                <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
                            )}
                            <span className="truncate">
                                {lieuCreneau}
                            </span>
                        </div>
                    )}
                </div>
            )}

            <button
                type="button"
                onClick={() => changerOnglet("convocations")}
                className="btn-outline w-full text-xs py-2.5"
            >
                <Calendar className="w-4 h-4" />
                <span>{t("etudiant_dashboard.next_step.manage_interviews_cta")}</span>
            </button>
        </div>
    );
}

function SectionProchaineEtape({
    contratSigneActif,
    prochaineEntrevue,
    totalCandidatures,
    nombreOffresDisponibles,
    formatShortDate,
    changerOnglet,
    t
}) {
    return (
        <section className="ds-card p-5 sm:p-6 space-y-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                {t("etudiant_dashboard.next_step.label")}
            </span>

            {contratSigneActif ? (
                <CarteStageConfirme
                    contratSigneActif={contratSigneActif}
                    changerOnglet={changerOnglet}
                    t={t}
                />
            ) : prochaineEntrevue ? (
                <CarteProchaineEntrevue
                    prochaineEntrevue={prochaineEntrevue}
                    formatShortDate={formatShortDate}
                    changerOnglet={changerOnglet}
                    t={t}
                />
            ) : totalCandidatures > 0 ? (
                <div className="space-y-3.5">
                    <h2 className="text-base font-extrabold text-slate-900">
                        {t("etudiant_dashboard.next_step.in_progress_title", {
                            count: totalCandidatures
                        })}
                    </h2>
                    <p className="text-xs text-slate-600 leading-relaxed">
                        {t("etudiant_dashboard.next_step.in_progress_desc")}
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                        <button
                            type="button"
                            onClick={() => changerOnglet("mes_candidatures")}
                            className="btn-secondary text-xs py-2 px-3.5"
                        >
                            {t("etudiant_dashboard.next_step.view_applications_cta")}
                        </button>
                        {nombreOffresDisponibles > 0 && (
                            <button
                                type="button"
                                onClick={() => changerOnglet("toutes")}
                                className="btn-outline text-xs py-2 px-3.5"
                            >
                                <span>{t("etudiant_dashboard.todo.explore_cta")}</span>
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <div className="space-y-3.5">
                    <h2 className="text-base font-extrabold text-slate-900">
                        {t("etudiant_dashboard.next_step.no_application_title")}
                    </h2>
                    <p className="text-xs text-slate-600 leading-relaxed">
                        {t("etudiant_dashboard.next_step.no_application_desc", {
                            count: nombreOffresDisponibles
                        })}
                    </p>
                    <button
                        type="button"
                        onClick={() => changerOnglet("toutes")}
                        className="btn-primary w-full text-xs py-2.5"
                    >
                        <Compass className="w-4 h-4" />
                        <span>{t("etudiant_dashboard.todo.explore_cta")}</span>
                    </button>
                </div>
            )}
        </section>
    );
}

function SectionDecouvrirOffres({
    offresDisponiblesNonPostulees,
    traduireDiscipline,
    changerOnglet,
    onSelectionnerOffre,
    t
}) {
    const apercuOffres = offresDisponiblesNonPostulees.slice(0, 3);
    return (
        <section className="ds-card p-5 sm:p-6 space-y-3.5">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Compass className="w-4 h-4 text-blue-600" />
                    <span>{t("etudiant_dashboard.discover.title")}</span>
                </h2>
                <button
                    type="button"
                    onClick={() => changerOnglet("toutes")}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 cursor-pointer"
                >
                    <span>
                        {t("etudiant_dashboard.discover.view_all", {
                            count: offresDisponiblesNonPostulees.length
                        })}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                </button>
            </div>

            <div className="divide-y divide-slate-100">
                {apercuOffres.map((offre) => {
                    const { id, titre, nomEntreprise, discipline } = offre;
                    return (
                        <div
                            key={id}
                            className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3"
                        >
                            <div className="min-w-0">
                                <h3 className="text-xs font-bold text-slate-900 truncate">
                                    {titre}
                                </h3>
                                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                    {nomEntreprise}
                                    {discipline ? ` • ${traduireDiscipline(discipline)}` : ""}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => onSelectionnerOffre(offre)}
                                className="btn-ghost text-xs py-1.5 px-2.5 shrink-0 text-blue-600 hover:text-blue-700"
                            >
                                {t("offres_etudiant.btn_see_details")}
                            </button>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

export default function TableauDeBordEtudiant({
    actionsPrioritaires,
    mesCandidaturesOffres,
    offresDisponiblesNonPostulees,
    candidaturesParOffre,
    contratSigneActif,
    convocationsConfirmees,
    convocationsEnAttente,
    aTrouveStage,
    renderCandidatureBadge,
    traduireDiscipline,
    traduireDuree,
    formatShortDate,
    changerOnglet,
    onSelectionnerOffre
}) {
    const { t } = useTranslation("main");

    const candidaturesTrieesApercu = useMemo(() => {
        return [...mesCandidaturesOffres]
            .sort((a, b) => {
                const stA = obtenirStatutCandidature(a, candidaturesParOffre);
                const stB = obtenirStatutCandidature(b, candidaturesParOffre);
                return calculerScoreStatut(stB) - calculerScoreStatut(stA);
            })
            .slice(0, 3);
    }, [mesCandidaturesOffres, candidaturesParOffre]);

    const prochaineEntrevue = useMemo(() => {
        if (convocationsConfirmees.length > 0) {
            return convocationsConfirmees[0];
        }
        if (convocationsEnAttente.length > 0) {
            return convocationsEnAttente[0];
        }
        return null;
    }, [convocationsConfirmees, convocationsEnAttente]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-7 space-y-6">
                    <SectionActionsPrioritaires
                        actionsPrioritaires={actionsPrioritaires}
                        t={t}
                    />
                    <SectionCandidaturesRecentes
                        candidaturesTrieesApercu={candidaturesTrieesApercu}
                        totalCandidatures={mesCandidaturesOffres.length}
                        nombreOffresDisponibles={offresDisponiblesNonPostulees.length}
                        candidaturesParOffre={candidaturesParOffre}
                        renderCandidatureBadge={renderCandidatureBadge}
                        traduireDuree={traduireDuree}
                        changerOnglet={changerOnglet}
                        onSelectionnerOffre={onSelectionnerOffre}
                        t={t}
                    />
                </div>

                <div className="lg:col-span-5 space-y-6">
                    <SectionProchaineEtape
                        contratSigneActif={contratSigneActif}
                        prochaineEntrevue={prochaineEntrevue}
                        totalCandidatures={mesCandidaturesOffres.length}
                        nombreOffresDisponibles={offresDisponiblesNonPostulees.length}
                        formatShortDate={formatShortDate}
                        changerOnglet={changerOnglet}
                        t={t}
                    />

                    {!aTrouveStage && offresDisponiblesNonPostulees.length > 0 && (
                        <SectionDecouvrirOffres
                            offresDisponiblesNonPostulees={offresDisponiblesNonPostulees}
                            traduireDiscipline={traduireDiscipline}
                            changerOnglet={changerOnglet}
                            onSelectionnerOffre={onSelectionnerOffre}
                            t={t}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
