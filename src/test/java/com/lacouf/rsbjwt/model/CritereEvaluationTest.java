package com.lacouf.rsbjwt.model;

import com.lacouf.rsbjwt.model.ENUM.CritereEvaluation;
import com.lacouf.rsbjwt.model.ENUM.SectionEvaluation;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class CritereEvaluationTest {

    @Test
    void laGrilleContientVingtDeuxCriteres() {
        assertEquals(22, CritereEvaluation.values().length);
    }

    @Test
    void pourSection_retourneLeBonNombreDeCriteresParSection() {
        assertEquals(5, CritereEvaluation.pourSection(SectionEvaluation.PRODUCTIVITE).size());
        assertEquals(5, CritereEvaluation.pourSection(SectionEvaluation.QUALITE_TRAVAIL).size());
        assertEquals(6, CritereEvaluation.pourSection(SectionEvaluation.RELATIONS_INTERPERSONNELLES).size());
        assertEquals(6, CritereEvaluation.pourSection(SectionEvaluation.HABILETES_PERSONNELLES).size());
    }

    @Test
    void pourSection_neRetourneQueDesCriteresDeCetteSection() {
        assertTrue(CritereEvaluation.pourSection(SectionEvaluation.QUALITE_TRAVAIL).stream()
                .allMatch(critere -> critere.getSection() == SectionEvaluation.QUALITE_TRAVAIL));
    }
}