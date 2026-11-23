package com.lacouf.rsbjwt.service;

import com.itextpdf.io.font.constants.StandardFonts;
import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.colors.Color;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.AreaBreak;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Image;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.AreaBreakType;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.layout.properties.VerticalAlignment;
import com.lacouf.rsbjwt.model.Candidature;
import com.lacouf.rsbjwt.model.Contrat;
import com.lacouf.rsbjwt.model.Employeur;
import com.lacouf.rsbjwt.model.Etudiant;
import com.lacouf.rsbjwt.model.embeddable.Signature;
import com.lacouf.rsbjwt.presentation.RequestDto.CreationContratRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.imageio.ImageIO;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;

public class ContratPdfGenerator {

    private static final Logger log = LoggerFactory.getLogger(ContratPdfGenerator.class);
    private static final Color HEADER_BG = new DeviceRgb(235, 238, 242);
    private static final Color BORDER_COLOR = new DeviceRgb(71, 85, 105);
    private static final Color TEXT_PRIMARY = new DeviceRgb(15, 23, 42);
    private static final Color TEXT_MUTED = new DeviceRgb(100, 116, 139);
    private static final Color SIGNATURE_ACCENT = new DeviceRgb(30, 58, 138);

    private ContratPdfGenerator() {
    }

    private record ContratPdfData(
            String anneeContrat,
            String nomGestionnaire,
            String nomEmployeur,
            String nomEtudiant,
            String nomEntreprise,
            String dateDebut,
            String dateFin,
            long nombreSemaines,
            String horaire,
            String salaire,
            String descriptionTaches,
            String conditions,
            Signature<?> signatureEtudiant,
            Signature<?> signatureEmployeur,
            Signature<?> signatureGestionnaire
    ) {
    }

    private record Fonts(PdfFont regular, PdfFont bold, PdfFont italic) {
    }

    public static byte[] generer(Contrat contrat, String nomGestionnaire) throws IOException {
        Candidature candidature = contrat.getCandidature();
        Etudiant etudiant = candidature.getEtudiant();
        Employeur employeur = candidature.getEmployeur();
        String nomEntreprise = safe(employeur.getEntreprise());

        ContratPdfData data = new ContratPdfData(
                String.valueOf(contrat.getAnneeDebut()),
                safe(nomGestionnaire),
                formatNomEmployeur(employeur, nomEntreprise),
                formatNomEtudiant(etudiant),
                nomEntreprise,
                safe(contrat.getDateDebut()),
                safe(contrat.getDateFin()),
                contrat.getNombreSemaines(),
                safe(contrat.getHoraire()),
                safe(contrat.getSalaire()),
                safe(contrat.getDescriptionTaches()),
                safe(contrat.getConditions()),
                contrat.getSignatureEtudiant(),
                contrat.getSignatureEmployeur(),
                contrat.getSignatureGestionnaire()
        );
        return genererDocument(data);
    }

    public static byte[] mettreAJour(Contrat contrat, String nomGestionnaire) throws IOException {
        return generer(contrat, nomGestionnaire);
    }

    public static byte[] generer(Candidature candidature, CreationContratRequest request, String nomGestionnaire) throws IOException {
        Etudiant etudiant = candidature.getEtudiant();
        Employeur employeur = candidature.getEmployeur();
        String nomEntreprise = safe(employeur.getEntreprise());

        ContratPdfData data = new ContratPdfData(
                String.valueOf(request.getAnneeDebut()),
                safe(nomGestionnaire),
                formatNomEmployeur(employeur, nomEntreprise),
                formatNomEtudiant(etudiant),
                nomEntreprise,
                safe(request.dateDebut()),
                safe(request.dateFin()),
                request.getNombreSemaines(),
                safe(request.horaire()),
                safe(request.salaire()),
                safe(request.descriptionTaches()),
                safe(request.conditions()),
                null,
                null,
                null
        );
        return genererDocument(data);
    }

    private static byte[] genererDocument(ContratPdfData data) throws IOException {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            try (PdfWriter writer = new PdfWriter(out);
                 PdfDocument pdfDoc = new PdfDocument(writer);
                 Document document = new Document(pdfDoc, PageSize.LETTER)) {

                Fonts fonts = new Fonts(
                        PdfFontFactory.createFont(StandardFonts.HELVETICA),
                        PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD),
                        PdfFontFactory.createFont(StandardFonts.HELVETICA_OBLIQUE)
                );

                document.setMargins(50, 65, 50, 65);
                document.setFont(fonts.regular());
                document.setFontColor(TEXT_PRIMARY);

                ajouterPageCouverture(document, fonts, data.anneeContrat());
                document.add(new AreaBreak(AreaBreakType.NEXT_PAGE));

                ajouterPageConditions(document, fonts, data);
                document.add(new AreaBreak(AreaBreakType.NEXT_PAGE));

                ajouterPageTachesEtSignatures(document, fonts, data);
                document.close();
            }
            return out.toByteArray();
        }
    }

    private static void ajouterPageCouverture(Document document, Fonts fonts, String anneeContrat) {
        document.add(new Paragraph("CONTRAT DE STAGE")
                .setFont(fonts.bold())
                .setFontSize(22)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginTop(250));

        float usableWidth = PageSize.LETTER.getWidth() - 130;
        document.add(new Paragraph(anneeContrat)
                .setFont(fonts.regular())
                .setFontSize(13)
                .setTextAlignment(TextAlignment.CENTER)
                .setFixedPosition(1, 65, 75, usableWidth));
    }

    private static void ajouterPageConditions(Document document, Fonts fonts, ContratPdfData data) {
        document.add(new Paragraph("ENTENTE DE STAGE INTERVENUE ENTRE LES PARTIES SUIVANTES")
                .setFont(fonts.bold())
                .setFontSize(12)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginTop(30)
                .setMarginBottom(22));

        document.add(centeredPreamble("Dans le cadre de la formule ATE, les parties citées ci-dessous :", fonts.regular(), 10));
        document.add(centeredPreamble("Le gestionnaire de stage, " + data.nomGestionnaire(), fonts.regular(), 8));
        document.add(centeredPreamble("et", fonts.bold(), 8));
        document.add(centeredPreamble("L'employeur, " + data.nomEmployeur(), fonts.regular(), 8));
        document.add(centeredPreamble("et", fonts.bold(), 8));
        document.add(centeredPreamble("L'étudiant(e), " + data.nomEtudiant(), fonts.regular(), 8));
        document.add(centeredPreamble("conviennent des conditions de stage suivantes :", fonts.regular(), 22));

        ajouterSectionEncadree(document, fonts, "ENDROIT DU STAGE",
                "Adresse : " + data.nomEntreprise());

        ajouterSectionEncadree(document, fonts, "DURÉE DU STAGE",
                "Date de début : " + data.dateDebut(),
                "Date de fin : " + data.dateFin(),
                "Nombre total de semaines : " + data.nombreSemaines());

        ajouterSectionEncadree(document, fonts, "HORAIRE DE TRAVAIL",
                "Horaire de travail : " + data.horaire());

        ajouterSectionEncadree(document, fonts, "SALAIRE",
                "Salaire horaire : " + data.salaire());
    }

    private static void ajouterPageTachesEtSignatures(Document document, Fonts fonts, ContratPdfData data) {
        ajouterSectionEncadree(document, fonts, "TÂCHES ET RESPONSABILITÉS DU STAGIAIRE",
                data.descriptionTaches());

        document.add(new Paragraph("RESPONSABILITÉS")
                .setFont(fonts.bold())
                .setFontSize(11)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginTop(8)
                .setMarginBottom(10));

        ajouterResponsabilite(document, fonts, "Le Collège s'engage à :",
                "Assurer le suivi pédagogique et l'accompagnement du stagiaire durant le stage.");
        ajouterResponsabilite(document, fonts, "L'entreprise s'engage à :",
                data.conditions());
        ajouterResponsabilite(document, fonts, "L'étudiant s'engage à :",
                "Accomplir les tâches confiées avec professionnalisme et respecter les politiques de l'entreprise.");

        Table bandeauSignatures = new Table(UnitValue.createPercentArray(new float[]{1}))
                .useAllAvailableWidth()
                .setMarginTop(14)
                .setMarginBottom(10);
        bandeauSignatures.addCell(new Cell()
                .add(new Paragraph("SIGNATURES").setFont(fonts.bold()).setFontSize(11))
                .setBackgroundColor(HEADER_BG)
                .setBorder(Border.NO_BORDER)
                .setBorderTop(new SolidBorder(BORDER_COLOR, 0.8f))
                .setPadding(6));
        document.add(bandeauSignatures);

        document.add(new Paragraph("Les parties s'engagent à respecter cette entente de stage")
                .setFont(fonts.bold())
                .setFontSize(11)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(8));

        document.add(new Paragraph("En foi de quoi les parties ont signé,")
                .setFont(fonts.bold())
                .setFontSize(10.5f)
                .setMarginBottom(10));

        ajouterBlocSignature(document, fonts, "L'étudiant(e) :", data.nomEtudiant(), data.signatureEtudiant());
        ajouterBlocSignature(document, fonts, "L'employeur :", data.nomEmployeur(), data.signatureEmployeur());
        ajouterBlocSignature(document, fonts, "Le gestionnaire de stage :", data.nomGestionnaire(), data.signatureGestionnaire());
    }

    private static Paragraph centeredPreamble(String texte, PdfFont font, float marginBottom) {
        return new Paragraph(texte)
                .setFont(font)
                .setFontSize(11)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginTop(0)
                .setMarginBottom(marginBottom);
    }

    private static void ajouterSectionEncadree(Document document, Fonts fonts, String titre, String... lignes) {
        Table table = new Table(UnitValue.createPercentArray(new float[]{1}))
                .useAllAvailableWidth()
                .setMarginBottom(12);

        table.addCell(new Cell()
                .add(new Paragraph(titre).setFont(fonts.bold()).setFontSize(10.5f))
                .setBackgroundColor(HEADER_BG)
                .setBorder(new SolidBorder(BORDER_COLOR, 0.6f))
                .setPaddingTop(5)
                .setPaddingBottom(5)
                .setPaddingLeft(8)
                .setPaddingRight(8));

        Cell bodyCell = new Cell()
                .setBorder(new SolidBorder(BORDER_COLOR, 0.6f))
                .setPaddingTop(6)
                .setPaddingBottom(6)
                .setPaddingLeft(8)
                .setPaddingRight(8);

        for (int i = 0; i < lignes.length; i++) {
            Paragraph p = new Paragraph(safe(lignes[i]))
                    .setFont(fonts.regular())
                    .setFontSize(10)
                    .setMarginTop(0)
                    .setMarginBottom(i == lignes.length - 1 ? 0 : 3);
            bodyCell.add(p);
        }

        table.addCell(bodyCell);
        document.add(table);
    }

    private static void ajouterResponsabilite(Document document, Fonts fonts, String titre, String contenu) {
        document.add(new Paragraph(titre)
                .setFont(fonts.bold())
                .setFontSize(10.5f)
                .setMarginTop(0)
                .setMarginBottom(2));

        document.add(new Paragraph(safe(contenu))
                .setFont(fonts.regular())
                .setFontSize(10)
                .setMarginTop(0)
                .setMarginBottom(8));
    }

    private static void ajouterBlocSignature(Document document, Fonts fonts, String titreRole, String nomSignataire,
                                             Signature<?> signature) {
        boolean estSigne = signature != null && signature.isValid();

        document.add(new Paragraph(titreRole)
                .setFont(fonts.bold())
                .setFontSize(10.5f)
                .setMarginTop(6)
                .setMarginBottom(4));

        Table table = new Table(UnitValue.createPercentArray(new float[]{60, 40}))
                .useAllAvailableWidth()
                .setMarginBottom(8);

        Cell sigCell = new Cell()
                .setBorder(Border.NO_BORDER)
                .setBorderBottom(new SolidBorder(BORDER_COLOR, 0.6f))
                .setVerticalAlignment(VerticalAlignment.BOTTOM)
                .setPaddingBottom(4)
                .setMinHeight(26);

        Cell dateValueCell = new Cell()
                .setBorder(Border.NO_BORDER)
                .setBorderBottom(new SolidBorder(BORDER_COLOR, 0.6f))
                .setVerticalAlignment(VerticalAlignment.BOTTOM)
                .setPaddingBottom(4)
                .setPaddingLeft(12);

        if (estSigne) {
            ajouterVisuelSignature(sigCell, fonts, signature.getData());
            dateValueCell.add(new Paragraph(LocalDate.now().toString())
                    .setFont(fonts.regular())
                    .setFontSize(10)
                    .setMarginBottom(0));
        } else {
            sigCell.add(new Paragraph("En attente de signature")
                    .setFont(fonts.italic())
                    .setFontSize(9.5f)
                    .setFontColor(TEXT_MUTED)
                    .setMarginBottom(0));
            dateValueCell.add(new Paragraph("En attente")
                    .setFont(fonts.italic())
                    .setFontSize(9.5f)
                    .setFontColor(TEXT_MUTED)
                    .setMarginBottom(0));
        }

        table.addCell(sigCell);
        table.addCell(dateValueCell);

        table.addCell(new Cell()
                .setBorder(Border.NO_BORDER)
                .setPaddingTop(3)
                .add(new Paragraph(safe(nomSignataire)).setFont(fonts.regular()).setFontSize(9.5f)));

        table.addCell(new Cell()
                .setBorder(Border.NO_BORDER)
                .setPaddingTop(3)
                .setPaddingLeft(12)
                .add(new Paragraph("Date").setFont(fonts.regular()).setFontSize(9.5f)));

        document.add(table);
    }

    private static void ajouterVisuelSignature(Cell sigCell, Fonts fonts, byte[] imageBytes) {
        if (estImageSupportee(imageBytes)) {
            Image signatureImg = new Image(ImageDataFactory.create(imageBytes));
            signatureImg.scaleToFit(140, 32);
            sigCell.add(signatureImg);
            return;
        }
        sigCell.add(new Paragraph("Signé électroniquement")
                .setFont(fonts.bold())
                .setFontSize(10)
                .setFontColor(SIGNATURE_ACCENT)
                .setMarginBottom(0));
    }

    private static boolean estImageSupportee(byte[] imageBytes) {
        if (imageBytes == null || imageBytes.length < 8 || !ImageDataFactory.isSupportedType(imageBytes)) {
            return false;
        }
        try (ByteArrayInputStream input = new ByteArrayInputStream(imageBytes)) {
            return ImageIO.read(input) != null;
        } catch (IOException e) {
            log.warn("Impossible de lire l'image de signature dans le PDF, repli sur la mention textuelle : {}",
                    e.getMessage());
            return false;
        }
    }

    private static String formatNomEtudiant(Etudiant etudiant) {
        return safe(etudiant.getFirstName()) + " " + safe(etudiant.getLastName());
    }

    private static String formatNomEmployeur(Employeur employeur, String nomEntreprise) {
        return safe(employeur.getFirstName()) + " " + safe(employeur.getLastName()) + " (" + nomEntreprise + ")";
    }

    private static String safe(Object value) {
        return value == null ? "" : value.toString()
                .replace('\u2019', '\'')
                .replace('\u2018', '\'')
                .replace('\u201C', '"')
                .replace('\u201D', '"')
                .replace('\u2013', '-')
                .replace('\u2014', '-');
    }
}
