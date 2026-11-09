import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
    aDesCandidaturesEnCours,
    calculerScoreStatut,
    construireStatutParcours,
    estConvocationActive,
    extrairePremiereCandidature,
    obtenirStatutCandidature,
    trouverContratSigneActif
} from "./tableauDeBordEtudiant/helpers.js";
import { construireActionsPrioritaires } from "./tableauDeBordEtudiant/construireActionsPrioritaires.js";
import SectionActionsPrioritaires from "./tableauDeBordEtudiant/SectionActionsPrioritaires.jsx";
import SectionCandidaturesRecentes from "./tableauDeBordEtudiant/SectionCandidaturesRecentes.jsx";
import SectionProchaineEtape from "./tableauDeBordEtudiant/SectionProchaineEtape.jsx";
import SectionDecouvrirOffres from "./tableauDeBordEtudiant/SectionDecouvrirOffres.jsx";

export {
    extrairePremiereCandidature,
    obtenirStatutCandidature,
    trouverContratSigneActif,
    construireStatutParcours,
    construireActionsPrioritaires,
    estConvocationActive,
    aDesCandidaturesEnCours
};

export default function TableauDeBordEtudiant({
    actionsPrioritaires,
    mesCandidaturesOffres,
    offresDisponiblesNonPostulees,
    candidaturesParOffre,
    contrats = [],
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
                const stA = obtenirStatutCandidature(a, candidaturesParOffre, contrats);
                const stB = obtenirStatutCandidature(b, candidaturesParOffre, contrats);
                return calculerScoreStatut(stB) - calculerScoreStatut(stA);
            })
            .slice(0, 3);
    }, [mesCandidaturesOffres, candidaturesParOffre, contrats]);

    const contratRefuse = useMemo(() => {
        return contrats.find((c) => c.statut === "REFUSE") || null;
    }, [contrats]);

    const prochaineEntrevue = useMemo(() => {
        const entrevuesConfirmeesActives = convocationsConfirmees.filter((c) =>
            estConvocationActive(c, contrats, candidaturesParOffre)
        );
        if (entrevuesConfirmeesActives.length > 0) {
            return entrevuesConfirmeesActives[0];
        }
        const entrevuesEnAttenteActives = convocationsEnAttente.filter((c) =>
            estConvocationActive(c, contrats, candidaturesParOffre)
        );
        if (entrevuesEnAttenteActives.length > 0) {
            return entrevuesEnAttenteActives[0];
        }
        return null;
    }, [convocationsConfirmees, convocationsEnAttente, contrats, candidaturesParOffre]);

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
                        contratRefuse={contratRefuse}
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
