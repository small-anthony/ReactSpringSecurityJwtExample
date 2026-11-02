package com.lacouf.rsbjwt.service;

import com.lacouf.rsbjwt.model.Candidature;
import com.lacouf.rsbjwt.model.Employeur;
import com.lacouf.rsbjwt.model.Etudiant;
import com.lacouf.rsbjwt.presentation.RequestDto.CreationContratRequest;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public class ContratPdfGenerator {

    private ContratPdfGenerator() {}

    public static byte[] generer(Candidature candidature, CreationContratRequest request, String nomGestionnaire) {
        Etudiant etudiant = candidature.getEtudiant();
        Employeur employeur = candidature.getEmployeur();

        String nomEtudiant = etudiant.getFirstName() + " " + etudiant.getLastName();
        String nomEntreprise = employeur.getEntreprise();
        String nomEmployeur = employeur.getFirstName() + " " + employeur.getLastName() + " (" + nomEntreprise + ")";
        long nbSemaines = Math.max(1, ChronoUnit.WEEKS.between(request.dateDebut(), request.dateFin()));

        byte[] page1 = construirePage1(String.valueOf(request.dateDebut().getYear()));
        byte[] page2 = construirePage2(nomGestionnaire, nomEmployeur, nomEtudiant, nomEntreprise, request, nbSemaines);
        byte[] page3 = construirePage3(request, nomEtudiant, nomEmployeur, nomGestionnaire);

        return assemblerPdf(List.of(page1, page2, page3));
    }

    private static byte[] construirePage1(String anneeContrat) {
        StringBuilder sb = new StringBuilder();
        drawCenteredText(sb, "F2", 20, 410, "CONTRAT DE STAGE");
        drawCenteredText(sb, "F1", 12, 95, anneeContrat);
        return sb.toString().getBytes(StandardCharsets.ISO_8859_1);
    }

    private static byte[] construirePage2(String nomGestionnaire, String nomEmployeur, String nomEtudiant,
                                          String nomEntreprise, CreationContratRequest request, long nbSemaines) {
        StringBuilder sb = new StringBuilder();
        drawCenteredText(sb, "F2", 12, 640, "ENTENTE DE STAGE INTERVENUE ENTRE LES PARTIES SUIVANTES");
        drawCenteredText(sb, "F1", 11, 592, "Dans le cadre de la formule ATE, les parties citées ci-dessous :");
        drawCenteredText(sb, "F1", 11, 568, "Le gestionnaire de stage, " + nomGestionnaire);
        drawCenteredText(sb, "F2", 11, 524, "et");
        drawCenteredText(sb, "F1", 11, 480, "L'employeur, " + nomEmployeur);
        drawCenteredText(sb, "F2", 11, 436, "et");
        drawCenteredText(sb, "F1", 11, 392, "L'étudiant(e), " + nomEtudiant + ",");
        drawCenteredText(sb, "F1", 11, 348, "Conviennent des conditions de stage suivantes :");

        drawSection(sb, 308, "ENDROIT DU STAGE", "Adresse : " + nomEntreprise);
        drawSection(sb, 262, "DUREE DU STAGE",
                "Date de début : " + request.dateDebut(),
                "Date de fin : " + request.dateFin(),
                "Nombre total de semaines : " + nbSemaines);
        drawSection(sb, 188, "HORAIRE DE TRAVAIL", "Horaire de travail : " + request.horaire());
        drawSection(sb, 128, "SALAIRE", "Salaire horaire : " + request.salaire());

        return sb.toString().getBytes(StandardCharsets.ISO_8859_1);
    }

    private static byte[] construirePage3(CreationContratRequest request, String nomEtudiant,
                                          String nomEmployeur, String nomGestionnaire) {
        StringBuilder sb = new StringBuilder();
        double x = 86;
        double w = 440;

        drawText(sb, "F2", 11, x, 710, "TACHES ET RESPONSABILITES DU STAGIAIRE");
        sb.append(String.format(Locale.US, "q 1 1 1 rg 0 0 0 RG 0.5 w %.1f 636.0 %.1f 62.0 re B Q\n", x, w));
        drawText(sb, "F1", 10, x + 8, 682, request.descriptionTaches());

        drawCenteredText(sb, "F2", 11, 608, "RESPONSABILITES");
        drawText(sb, "F2", 11, x, 584, "Le Collège s'engage à :");
        drawText(sb, "F1", 10, x, 566, "Assurer le suivi pédagogique et l'accompagnement du stagiaire durant le stage.");
        drawText(sb, "F2", 11, x, 534, "L'entreprise s'engage à :");
        drawText(sb, "F1", 10, x, 516, request.conditions());
        drawText(sb, "F2", 11, x, 472, "L'étudiant s'engage à :");
        drawText(sb, "F1", 10, x, 454, "Accomplir les tâches confiées avec professionnalisme et respecter les politiques de l'entreprise.");

        sb.append(String.format(Locale.US, "q 0.90 0.90 0.90 rg %.1f 376.0 %.1f 26.0 re f 0 0 0 RG 0.6 w %.1f 402.0 m %.1f 402.0 l S Q\n", x, w, x, x + w));
        drawText(sb, "F2", 11, x + 6, 385, "SIGNATURES");
        drawCenteredText(sb, "F2", 12, 352, "Les parties s'engagent à respecter cette entente de stage");
        drawText(sb, "F2", 11, x + 6, 324, "En foi de quoi les parties ont signé,");

        drawSignatureBlock(sb, 294, "L'étudiant(e) :", nomEtudiant);
        drawSignatureBlock(sb, 212, "L'employeur :", nomEmployeur);
        drawSignatureBlock(sb, 130, "Le gestionnaire de stage :", nomGestionnaire);

        return sb.toString().getBytes(StandardCharsets.ISO_8859_1);
    }

    private static void drawSection(StringBuilder sb, double headerY, String titre, String... lignes) {
        double x = 86;
        double w = 440;
        double bodyH = lignes.length * 16 + 8;
        double bodyY = headerY - bodyH;
        sb.append(String.format(Locale.US, "q 0.90 0.90 0.90 rg 0 0 0 RG 0.5 w %.1f %.1f %.1f 22.0 re B Q\n", x, headerY, w));
        drawText(sb, "F2", 10.5, x + 6, headerY + 7, titre);
        sb.append(String.format(Locale.US, "q 1 1 1 rg 0 0 0 RG 0.5 w %.1f %.1f %.1f %.1f re B Q\n", x, bodyY, w, bodyH));
        for (int i = 0; i < lignes.length; i++) {
            drawText(sb, "F1", 10.5, x + 6, headerY - 15 - (i * 15), lignes[i]);
        }
    }

    private static void drawSignatureBlock(StringBuilder sb, double labelY, String titreRole, String nomSignataire) {
        double x = 86;
        double lineY = labelY - 36;
        drawText(sb, "F2", 11, x + 6, labelY, titreRole);
        drawText(sb, "F1", 10, x + 6, lineY + 6, "En attente de signature");
        drawText(sb, "F1", 10, x + 225, lineY + 6, "En attente");
        sb.append(String.format(Locale.US, "q 0 0 0 RG 0.5 w %.1f %.1f m %.1f %.1f l S Q\n", x, lineY, x + 440, lineY));
        drawText(sb, "F1", 10, x + 6, lineY - 14, nomSignataire);
        drawText(sb, "F1", 10, x + 225, lineY - 14, "Date");
    }

    private static void drawCenteredText(StringBuilder sb, String font, double size, double y, String text) {
        String safe = nettoyerTextePdf(text);
        double factor = "F2".equals(font) ? 0.55 : 0.50;
        double x = Math.max(40, (612.0 - safe.length() * size * factor) / 2.0);
        drawText(sb, font, size, x, y, safe);
    }

    private static void drawText(StringBuilder sb, String font, double size, double x, double y, String text) {
        String escaped = nettoyerTextePdf(text).replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)");
        sb.append(String.format(Locale.US, "BT /%s %.1f Tf %.1f %.1f Td (%s) Tj ET\n", font, size, x, y, escaped));
    }

    private static String nettoyerTextePdf(String text) {
        return text
                .replace('\u2019', '\'').replace('\u2018', '\'')
                .replace('\u201C', '"').replace('\u201D', '"')
                .replace('\u2013', '-').replace('\u2014', '-');
    }

    private static byte[] assemblerPdf(List<byte[]> pages) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        List<Integer> offsets = new ArrayList<>();
        writeAscii(out, "%PDF-1.4\n");

        offsets.add(out.size());
        writeAscii(out, "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");
        offsets.add(out.size());
        writeAscii(out, "2 0 obj\n<< /Type /Pages /Kids [3 0 R 5 0 R 7 0 R] /Count 3 >>\nendobj\n");

        int objId = 3;
        for (byte[] page : pages) {
            int streamId = objId + 1;
            offsets.add(out.size());
            writeAscii(out, objId + " 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents "
                    + streamId + " 0 R /Resources << /Font << /F1 9 0 R /F2 10 0 R >> >> >>\nendobj\n");
            offsets.add(out.size());
            writeAscii(out, streamId + " 0 obj\n<< /Length " + page.length + " >>\nstream\n");
            out.writeBytes(page);
            writeAscii(out, "endstream\nendobj\n");
            objId += 2;
        }

        offsets.add(out.size());
        writeAscii(out, "9 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n");
        offsets.add(out.size());
        writeAscii(out, "10 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj\n");

        int xrefOffset = out.size();
        writeAscii(out, "xref\n0 " + (offsets.size() + 1) + "\n0000000000 65535 f \n");
        for (int offset : offsets) {
            writeAscii(out, String.format("%010d 00000 n \n", offset));
        }
        writeAscii(out, "trailer\n<< /Size " + (offsets.size() + 1) + " /Root 1 0 R >>\nstartxref\n" + xrefOffset + "\n%%EOF\n");
        return out.toByteArray();
    }

    private static void writeAscii(ByteArrayOutputStream out, String text) {
        out.writeBytes(text.getBytes(StandardCharsets.ISO_8859_1));
    }
}

