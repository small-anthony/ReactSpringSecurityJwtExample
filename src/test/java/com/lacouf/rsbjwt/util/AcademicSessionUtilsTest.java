package com.lacouf.rsbjwt.util;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import java.time.LocalDate;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@ExtendWith(MockitoExtension.class)
public class AcademicSessionUtilsTest {
    @Test
    void getAnnee_datesAutomne_devraitCiblerHiverSuivant() {
//        ARRANGE
        LocalDate premierAout = LocalDate.of(2025, 8, 1);
        LocalDate finOctobre = LocalDate.of(2025, 10, 31);
        LocalDate finAnnee = LocalDate.of(2025, 12, 31);

//        ACT
        int anneeAout = AcademicSessionUtils.getAnnee(premierAout);
        int anneeOctobre = AcademicSessionUtils.getAnnee(finOctobre);
        int anneeDecembre = AcademicSessionUtils.getAnnee(finAnnee);

//        ASSERT
        assertEquals(2026, anneeAout);
        assertEquals(2026, anneeOctobre);
        assertEquals(2026, anneeDecembre);
    }

    @Test
    void getAnnee_datesHiverEtPrintemps_devraitCiblerMemeAnnee() {
//        ARRANGE
        LocalDate jourAn = LocalDate.of(2026, 1, 1);
        LocalDate miMars = LocalDate.of(2026, 3, 15);
        LocalDate dernierJourCycle = LocalDate.of(2026, 7, 31);

//        ACT
        int anneeJanvier = AcademicSessionUtils.getAnnee(jourAn);
        int anneeMars = AcademicSessionUtils.getAnnee(miMars);
        int anneeJuillet = AcademicSessionUtils.getAnnee(dernierJourCycle);

//        ASSERT
        assertEquals(2026, anneeJanvier);
        assertEquals(2026, anneeMars);
        assertEquals(2026, anneeJuillet);
    }
    @Test
    void getAnnee_transitionFinDeCycle_devraitChangerDAnnee() {
//        ARRANGE
        LocalDate finCyclePrecedent = LocalDate.of(2026, 7, 31);
        LocalDate debutNouveauCycle = LocalDate.of(2026, 8, 1);

//        ACT
        int anneeAvantTransition = AcademicSessionUtils.getAnnee(finCyclePrecedent);
        int anneeApresTransition = AcademicSessionUtils.getAnnee(debutNouveauCycle);

//        ASSERT
        assertEquals(2026, anneeAvantTransition);
        assertEquals(2027, anneeApresTransition);
    }

    @Test
    void getAnnee_dateNull_devraitRetournerAnneeActuelle() {
//        ARRANGE & ACT
        int anneeAvecNull = AcademicSessionUtils.getAnnee(null);
        int anneeActuelleAttendue = AcademicSessionUtils.getAnneeActuelle();

//        ASSERT
        assertEquals(anneeActuelleAttendue, anneeAvecNull);
    }

    @Test
    void getSessionLabel_devraitRetournerLibelleFormatte() {
//        ARRANGE & ACT
        String label = AcademicSessionUtils.getSessionLabel(2026);

//        ASSERT
        assertNotNull(label);
        assertEquals("Hiver 2026", label);
    }
}
