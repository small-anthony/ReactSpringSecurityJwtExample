package com.lacouf.rsbjwt.service;

import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfReader;
import com.itextpdf.kernel.pdf.canvas.parser.PdfTextExtractor;
import com.lacouf.rsbjwt.model.Candidature;
import com.lacouf.rsbjwt.model.Contrat;
import com.lacouf.rsbjwt.model.Employeur;
import com.lacouf.rsbjwt.model.Etudiant;
import com.lacouf.rsbjwt.model.Gestionnaire;
import com.lacouf.rsbjwt.model.OffreStage;
import com.lacouf.rsbjwt.model.ENUM.StatutCandidature;
import com.lacouf.rsbjwt.model.auth.Credentials;
import com.lacouf.rsbjwt.model.auth.Role;
import com.lacouf.rsbjwt.model.embeddable.Signature;
import com.lacouf.rsbjwt.presentation.RequestDto.CreationContratRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

class ContratPdfGeneratorTest {

    private Etudiant etudiant;
    private Employeur employeur;
    private Gestionnaire gestionnaire;
    private Candidature candidature;
    private CreationContratRequest request;

    @BeforeEach
    void setUp() {
        etudiant = new Etudiant("Jean", "Tremblay",
                new Credentials("jean@test.com", "pass", Role.ETUDIANT), 1234567, "Informatique");
        employeur = new Employeur("Bob", "Employeur",
                new Credentials("bob@cgi.com", "pass", Role.EMPLOYEUR), "CGI Inc.", "514-555-1234");
        gestionnaire = new Gestionnaire("John", "Gestion",
                new Credentials("gestionnaire@test.com", "bib", Role.GESTIONNAIRE));

        OffreStage offre = new OffreStage("Développeur Java", "Stage backend", "CGI Inc.");
        offre.setEmployeur(employeur);

        candidature = new Candidature(etudiant, offre);
        candidature.setId(1L);
        candidature.setStatut(StatutCandidature.EMBAUCHEE);

        request = new CreationContratRequest(
                1L,
                LocalDate.of(2027, 1, 11),
                LocalDate.of(2027, 4, 23),
                "Du lundi au vendredi, 9h à 17h",
                "25.00 $/h",
                "Développement d'APIs REST avec Spring Boot et interface utilisateur React.",
                "Télétravail hybride (2 jours au bureau) et matériel fourni."
        );
    }

    @Test
    void generer_creePdfValideAvecTroisPagesEtContenuAttendu() throws Exception {
        // Act
        byte[] pdfBytes = ContratPdfGenerator.generer(candidature, request, "John Gestion");

        // Assert
        assertNotNull(pdfBytes);
        assertTrue(pdfBytes.length > 0);

        try (PdfDocument pdfDoc = new PdfDocument(new PdfReader(new ByteArrayInputStream(pdfBytes)))) {
            assertEquals(3, pdfDoc.getNumberOfPages());

            String page1 = PdfTextExtractor.getTextFromPage(pdfDoc.getPage(1));
            assertTrue(page1.contains("CONTRAT DE STAGE"));
            assertTrue(page1.contains("2027"));

            String page2 = PdfTextExtractor.getTextFromPage(pdfDoc.getPage(2));
            assertTrue(page2.contains("John Gestion"));
            assertTrue(page2.contains("Bob Employeur (CGI Inc.)"));
            assertTrue(page2.contains("Jean Tremblay"));
            assertTrue(page2.contains("25.00 $/h"));
            assertTrue(page2.contains("2027-01-11"));

            String page3 = PdfTextExtractor.getTextFromPage(pdfDoc.getPage(3));
            assertTrue(page3.contains("Développement d'APIs REST"));
            assertTrue(page3.contains("Télétravail hybride"));
            assertTrue(page3.contains("En attente de signature"));
        }
    }

    @Test
    void mettreAJour_avecSignatureTexteEtImagePng_integreLesSignatures() throws Exception {
        Contrat contrat = new Contrat(
                candidature,
                request.dateDebut(), request.dateFin(),
                request.horaire(), request.salaire(),
                request.descriptionTaches(), request.conditions()
        );

        BufferedImage img = new BufferedImage(120, 40, BufferedImage.TYPE_INT_ARGB);
        ByteArrayOutputStream pngOut = new ByteArrayOutputStream();
        ImageIO.write(img, "png", pngOut);

        contrat.signer(new Signature<>(etudiant, pngOut.toByteArray()));
        contrat.signer(new Signature<>(employeur, "signature_texte_fallback".getBytes()));

        byte[] updatedPdf = ContratPdfGenerator.generer(contrat, "John Gestion");

        // Assert
        assertNotNull(updatedPdf);
        try (PdfDocument pdfDoc = new PdfDocument(new PdfReader(new ByteArrayInputStream(updatedPdf)))) {
            assertEquals(3, pdfDoc.getNumberOfPages());
            String page3 = PdfTextExtractor.getTextFromPage(pdfDoc.getPage(3));
            assertTrue(page3.contains("Signé électroniquement"));
            assertTrue(page3.contains("En attente de signature"));
        }
    }
}
