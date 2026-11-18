package com.lacouf.rsbjwt.model.ENUM;

import java.util.Arrays;
import java.util.List;

public enum CritereEvaluation {
    PLANIFIER_ORGANISER(SectionEvaluation.PRODUCTIVITE),
    COMPRENDRE_DIRECTIVES(SectionEvaluation.PRODUCTIVITE),
    RYTHME_SOUTENU(SectionEvaluation.PRODUCTIVITE),
    ETABLIR_PRIORITES(SectionEvaluation.PRODUCTIVITE),
    RESPECTER_ECHEANCIERS(SectionEvaluation.PRODUCTIVITE),

    RESPECTER_MANDATS(SectionEvaluation.QUALITE_TRAVAIL),
    ATTENTION_DETAILS(SectionEvaluation.QUALITE_TRAVAIL),
    VERIFIER_TRAVAIL(SectionEvaluation.QUALITE_TRAVAIL),
    OCCASIONS_PERFECTIONNEMENT(SectionEvaluation.QUALITE_TRAVAIL),
    ANALYSE_PROBLEMES(SectionEvaluation.QUALITE_TRAVAIL),

    CONTACTS_FACILES(SectionEvaluation.RELATIONS_INTERPERSONNELLES),
    TRAVAIL_EQUIPE(SectionEvaluation.RELATIONS_INTERPERSONNELLES),
    CULTURE_ENTREPRISE(SectionEvaluation.RELATIONS_INTERPERSONNELLES),
    CRITIQUES_CONSTRUCTIVES(SectionEvaluation.RELATIONS_INTERPERSONNELLES),
    RESPECT_ENVERS_LES_GENS(SectionEvaluation.RELATIONS_INTERPERSONNELLES),
    ECOUTE_ACTIVE(SectionEvaluation.RELATIONS_INTERPERSONNELLES),

    INTERET_MOTIVATION(SectionEvaluation.HABILETES_PERSONNELLES),
    EXPRIMER_IDEES(SectionEvaluation.HABILETES_PERSONNELLES),
    INITIATIVE(SectionEvaluation.HABILETES_PERSONNELLES),
    TRAVAIL_SECURITAIRE(SectionEvaluation.HABILETES_PERSONNELLES),
    SENS_RESPONSABILITES(SectionEvaluation.HABILETES_PERSONNELLES),
    PONCTUALITE_ASSIDUITE(SectionEvaluation.HABILETES_PERSONNELLES);

    private final SectionEvaluation section;

    CritereEvaluation(SectionEvaluation section) {
        this.section = section;
    }

    public SectionEvaluation getSection() {
        return section;
    }

    public static List<CritereEvaluation> pourSection(SectionEvaluation section) {
        return Arrays.stream(values()).filter(critere -> critere.section == section).toList();
    }
}