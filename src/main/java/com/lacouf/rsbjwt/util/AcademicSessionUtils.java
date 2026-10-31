package com.lacouf.rsbjwt.util;

import java.time.LocalDate;
import java.time.Month;

public class AcademicSessionUtils {
    private AcademicSessionUtils() {
    }

    public static int getAnnee(LocalDate date) {
        if (date == null) {
            date = LocalDate.now();
        }

        return (date.getMonthValue() >= Month.AUGUST.getValue())
                ? date.getYear() + 1
                : date.getYear();
    }

    public static int getAnneeActuelle() {
        return getAnnee(LocalDate.now());
    }

    public static String getSessionLabel(int annee) {
        return "Hiver " + annee;
    }
}
