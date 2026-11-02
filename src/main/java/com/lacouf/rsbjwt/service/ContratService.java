package com.lacouf.rsbjwt.service;

import com.lacouf.rsbjwt.model.*;
import com.lacouf.rsbjwt.model.ENUM.StatutCandidature;
import com.lacouf.rsbjwt.model.embeddable.Signature;
import com.lacouf.rsbjwt.presentation.RequestDto.CreationContratRequest;
import com.lacouf.rsbjwt.repository.CandidatureRepository;
import com.lacouf.rsbjwt.repository.ContratRepository;
import com.lacouf.rsbjwt.repository.UserAppRepository;
import com.lacouf.rsbjwt.security.exception.AuthenticationException;
import com.lacouf.rsbjwt.security.exception.UserNotFoundException;
import com.lacouf.rsbjwt.service.dto.CandidaturePourContratDto;
import com.lacouf.rsbjwt.service.dto.ContratDto;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class ContratService {

    private final ContratRepository contratRepository;
    private final CandidatureRepository candidatureRepository;
    private final UserAppRepository userAppRepository;

    public ContratService(ContratRepository contratRepository,
            CandidatureRepository candidatureRepository, UserAppRepository userAppRepository) {
        this.contratRepository = contratRepository;
        this.candidatureRepository = candidatureRepository;
        this.userAppRepository = userAppRepository;
    }

    @Transactional(readOnly = true)
    public List<CandidaturePourContratDto> getCandidaturesPourContrat() {
        List<Candidature> candidaturesAcceptees = candidatureRepository.findByStatut(StatutCandidature.ACCEPTEE);
        return candidaturesAcceptees.stream().map(c -> {
            Optional<Contrat> contratOpt = contratRepository.findByCandidatureId(c.getId());
            return CandidaturePourContratDto.create(c, contratOpt);
        }).collect(Collectors.toList());
    }

    @Transactional
    public ContratDto creerContrat(CreationContratRequest request, String gestionnaireEmail) throws Exception {
        if (request == null || request.candidatureId() == null) {
            throw new Exception("Des informations obligatoires manquent dans le contrat.");
        }

        if (request.dateDebut() == null || request.dateFin() == null
                || request.horaire() == null || request.horaire().trim().isEmpty()
                || request.salaire() == null || request.salaire().trim().isEmpty()
                || request.descriptionTaches() == null || request.descriptionTaches().trim().isEmpty()
                || request.conditions() == null || request.conditions().trim().isEmpty()) {
            throw new Exception("Des informations obligatoires manquent dans le contrat.");
        }

        if (request.dateFin().isBefore(request.dateDebut())) {
            throw new Exception("La date de fin ne peut pas être antérieure à la date de début.");
        }

        Candidature candidature = candidatureRepository.findById(request.candidatureId())
                .orElseThrow(
                        () -> new Exception("Candidature introuvable avec l'identifiant : " + request.candidatureId()));

        if (candidature.getStatut() != StatutCandidature.ACCEPTEE) {
            throw new Exception("L'étudiant n'a pas été embauché par l'employeur, impossible de créer un contrat.");
        }

        if (contratRepository.existsByCandidatureId(candidature.getId())) {
            throw new Exception("Un contrat existe déjà pour cet étudiant et cet employeur.");
        }

        String nomGestionnaire = resoudreNomGestionnaire(gestionnaireEmail);
        byte[] documentData = genererContratDocument(candidature, request, nomGestionnaire);

        Contrat contrat = new Contrat(
                candidature,
                documentData,
                request.dateDebut(),
                request.dateFin(),
                request.horaire().trim(),
                request.salaire().trim(),
                request.descriptionTaches().trim(),
                request.conditions().trim());

        Contrat contratSauvegarde = contratRepository.save(contrat);

        return ContratDto.create(contratSauvegarde);
    }

    @Transactional()
    public ContratDto signerContrat(Long contratId, String actorEmail, MultipartFile signatureFile)
            throws AuthenticationException, UserNotFoundException, Exception {
        UserApp utilisateur = userAppRepository.findUserAppByEmail(actorEmail)
                .orElseThrow(UserNotFoundException::new);

        Contrat contrat = contratRepository.findById(contratId)
                .orElseThrow(Exception::new);

        byte[] signatureData = signatureFile.getBytes();
        Signature<?> signature = new Signature<>(utilisateur, signatureData);

        contrat.signer(signature);
        contrat = contratRepository.save(contrat);

        return ContratDto.create(contrat);
    }

    @Transactional(readOnly = true)
    public List<ContratDto> getTousLesContrats() {
        return ContratDto.create(contratRepository.findAllByOrderByDateCreationDesc());
    }

    @Transactional(readOnly = true)
    public ContratDto getContratById(Long id) throws Exception {
        Contrat contrat = contratRepository.findById(id)
                .orElseThrow(() -> new Exception("Contrat introuvable avec l'identifiant : " + id));
        return ContratDto.create(contrat);
    }

    @Transactional(readOnly = true)
    public byte[] getContratPdf(Long id) throws Exception {
        Contrat contrat = contratRepository.findById(id)
                .orElseThrow(() -> new Exception("Contrat introuvable avec l'identifiant : " + id));
        return contrat.getData();
    }

    @Transactional(readOnly = true)
    public List<ContratDto> getContratsEtudiant(String email) {
        return ContratDto.create(contratRepository.findByCandidatureEtudiantEmail(email));
    }

    @Transactional(readOnly = true)
    public List<ContratDto> getContratsEmployeur(String email) {
        return ContratDto.create(contratRepository.findByCandidatureOffreStageEmployeurEmail(email));
    }

    private String resoudreNomGestionnaire(String gestionnaireEmail) {
        if (gestionnaireEmail != null && !gestionnaireEmail.isBlank() && userAppRepository != null) {
            Optional<UserApp> userOpt = userAppRepository.findUserAppByEmail(gestionnaireEmail);
            if (userOpt.isPresent()) {
                UserApp u = userOpt.get();
                String full = ((u.getFirstName() != null ? u.getFirstName() : "") + " "
                        + (u.getLastName() != null ? u.getLastName() : "")).trim();
                if (!full.isEmpty()) {
                    return full;
                }
            }
        }
        return "Gestionnaire de stage";
    }

    private byte[] genererContratDocument(Candidature candidature, CreationContratRequest request,
            String nomGestionnaire) {
        Etudiant etudiant = candidature.getEtudiant();
        OffreStage offre = candidature.getOffreStage();
        Employeur employeur = offre != null ? offre.getEmployeur() : null;

        String nomEtudiant = etudiant != null
                ? (etudiant.getFirstName() + " " + etudiant.getLastName()).trim()
                : "N/A";
        String nomEntreprise = employeur != null && employeur.getEntreprise() != null
                ? employeur.getEntreprise()
                : (offre != null && offre.getNomEntreprise() != null ? offre.getNomEntreprise() : "N/A");
        String nomEmployeur = employeur != null
                ? (employeur.getFirstName() + " " + employeur.getLastName() + " (" + nomEntreprise + ")").trim()
                : nomEntreprise;

        long nbSemaines = Math.max(1, ChronoUnit.WEEKS.between(request.dateDebut(), request.dateFin()));
        String heuresParSemaine = extraireHeuresParSemaine(request.horaire());
        String anneeContrat = String.valueOf(request.dateDebut().getYear());

        byte[] page1 = construirePage1(anneeContrat);
        byte[] page2 = construirePage2(
                nomGestionnaire,
                nomEmployeur,
                nomEtudiant,
                nomEntreprise,
                request.dateDebut().toString(),
                request.dateFin().toString(),
                String.valueOf(nbSemaines),
                request.horaire(),
                heuresParSemaine,
                request.salaire());
        byte[] page3 = construirePage3(
                request.descriptionTaches(),
                request.conditions(),
                nomEtudiant,
                nomEmployeur,
                nomGestionnaire);

        return assemblerPdfTroisPages(page1, page2, page3);
    }

    private String extraireHeuresParSemaine(String horaire) {
        if (horaire == null) {
            return "35h";
        }
        Matcher m = Pattern.compile("(\\d+(?:[.,]\\d+)?)\\s*h", Pattern.CASE_INSENSITIVE).matcher(horaire);
        String lastMatch = null;
        while (m.find()) {
            lastMatch = m.group(1) + "h";
        }
        return lastMatch != null ? lastMatch : "35h";
    }

    private byte[] construirePage1(String anneeContrat) {
        StringBuilder sb = new StringBuilder();
        drawCenteredText(sb, "F2", 20, 410, "CONTRAT DE STAGE");
        drawCenteredText(sb, "F1", 12, 95, anneeContrat);
        return sb.toString().getBytes(StandardCharsets.ISO_8859_1);
    }

    private byte[] construirePage2(
            String nomGestionnaire,
            String nomEmployeur,
            String nomEtudiant,
            String lieuStage,
            String dateDebut,
            String dateFin,
            String nbSemaines,
            String horaire,
            String heuresSemaine,
            String salaire) {
        StringBuilder sb = new StringBuilder();

        drawCenteredText(sb, "F2", 12, 640, "ENTENTE DE STAGE INTERVENUE ENTRE LES PARTIES SUIVANTES");
        drawCenteredText(sb, "F1", 11, 592, "Dans le cadre de la formule ATE, les parties citées ci-dessous :");
        drawCenteredText(sb, "F1", 11, 568, "Le gestionnaire de stage, " + nomGestionnaire);
        drawCenteredText(sb, "F2", 11, 524, "et");
        drawCenteredText(sb, "F1", 11, 480, "L'employeur, " + nomEmployeur);
        drawCenteredText(sb, "F2", 11, 436, "et");
        drawCenteredText(sb, "F1", 11, 392, "L'étudiant(e), " + nomEtudiant + ",");
        drawCenteredText(sb, "F1", 11, 348, "Conviennent des conditions de stage suivantes :");

        double x = 86;
        double w = 440;

        // Section 1 : ENDROIT DU STAGE
        drawGrayHeaderRow(sb, x, 308, w, 22, "ENDROIT DU STAGE");
        drawWhiteRow(sb, x, 284, w, 24);
        drawText(sb, "F1", 10.5, x + 6, 292, "Adresse : " + lieuStage);

        // Section 2 : DUREE DU STAGE
        drawGrayHeaderRow(sb, x, 262, w, 22, "DUREE DU STAGE");
        drawWhiteRow(sb, x, 210, w, 52);
        drawText(sb, "F1", 10.5, x + 6, 247, "Date de début : " + dateDebut);
        drawText(sb, "F1", 10.5, x + 6, 232, "Date de fin : " + dateFin);
        drawText(sb, "F1", 10.5, x + 6, 217, "Nombre total de semaines : " + nbSemaines);

        // Section 3 : HORAIRE DE TRAVAIL
        drawGrayHeaderRow(sb, x, 188, w, 22, "HORAIRE DE TRAVAIL");
        drawWhiteRow(sb, x, 150, w, 38);
        drawText(sb, "F1", 10.5, x + 6, 173, "Horaire de travail: " + horaire);
        drawText(sb, "F1", 10.5, x + 6, 158, "Nombre total d'heures par semaine : " + heuresSemaine);

        // Section 4 : SALAIRE
        drawGrayHeaderRow(sb, x, 128, w, 22, "SALAIRE");
        drawWhiteRow(sb, x, 104, w, 24);
        drawText(sb, "F1", 10.5, x + 6, 112, "Salaire horaire : " + salaire);

        return sb.toString().getBytes(StandardCharsets.ISO_8859_1);
    }

    private byte[] construirePage3(
            String descriptionTaches,
            String conditions,
            String nomEtudiant,
            String nomEmployeur,
            String nomGestionnaire) {
        StringBuilder sb = new StringBuilder();

        double x = 86;
        double w = 440;

        drawText(sb, "F2", 11, x, 710, "TACHES ET RESPONSABILITES DU STAGIAIRE");
        drawWhiteRow(sb, x, 636, w, 62);
        List<String> lignesTaches = decouperTexte(descriptionTaches, 78, 3);
        double ty = 682;
        for (String ligne : lignesTaches) {
            drawText(sb, "F1", 10, x + 8, ty, ligne);
            ty -= 14;
        }

        drawCenteredText(sb, "F2", 11, 608, "RESPONSABILITES");

        drawText(sb, "F2", 11, x, 584, "Le Collège s'engage à :");
        drawText(sb, "F1", 10, x, 566,
                "Assurer le suivi pédagogique et l'accompagnement du stagiaire durant le stage.");

        drawText(sb, "F2", 11, x, 534, "L'entreprise s'engage à :");
        List<String> lignesConditions = decouperTexte(conditions, 82, 2);
        double cy = 516;
        for (String ligne : lignesConditions) {
            drawText(sb, "F1", 10, x, cy, ligne);
            cy -= 14;
        }

        drawText(sb, "F2", 11, x, 472, "L'étudiant s'engage à :");
        drawText(sb, "F1", 10, x, 454,
                "Accomplir les tâches confiées avec professionnalisme et respecter les politiques de l'entreprise.");

        // Bandeau gris SIGNATURES avec bordure supérieure
        sb.append(String.format(Locale.US,
                "q 0.90 0.90 0.90 rg %.1f 376.0 %.1f 26.0 re f 0 0 0 RG 0.6 w %.1f 402.0 m %.1f 402.0 l S Q\n",
                x, w, x, x + w));
        drawText(sb, "F2", 11, x + 6, 385, "SIGNATURES");

        drawCenteredText(sb, "F2", 12, 352, "Les parties s'engagent à respecter cette entente de stage");
        drawText(sb, "F2", 11, x + 6, 324, "En foi de quoi les parties ont signé,");

        // Bloc signature 1 : Étudiant(e)
        drawSignatureBlock(sb, x, w, 294, "L'étudiant(e) :",
                "En attente de signature", "En attente", nomEtudiant);

        // Bloc signature 2 : Employeur
        drawSignatureBlock(sb, x, w, 212, "L'employeur :",
                "En attente de signature", "En attente", nomEmployeur);

        // Bloc signature 3 : Gestionnaire
        drawSignatureBlock(sb, x, w, 130, "Le gestionnaire de stage :",
                "En attente de signature", "En attente", nomGestionnaire);

        return sb.toString().getBytes(StandardCharsets.ISO_8859_1);
    }

    private void drawSignatureBlock(
            StringBuilder sb,
            double x,
            double w,
            double labelY,
            String titreRole,
            String etatSignature,
            String dateSignature,
            String nomSignataire) {
        drawText(sb, "F2", 11, x + 6, labelY, titreRole);
        double lineY = labelY - 36;
        drawText(sb, "F1", 10, x + 6, lineY + 6, etatSignature);
        drawText(sb, "F1", 10, x + 225, lineY + 6, dateSignature);
        sb.append(String.format(Locale.US, "q 0 0 0 RG 0.5 w %.1f %.1f m %.1f %.1f l S Q\n",
                x, lineY, x + w, lineY));
        drawText(sb, "F1", 10, x + 6, lineY - 14, nomSignataire);
        drawText(sb, "F1", 10, x + 225, lineY - 14, "Date");
    }

    private void drawGrayHeaderRow(StringBuilder sb, double x, double y, double w, double h, String title) {
        sb.append(String.format(Locale.US,
                "q 0.90 0.90 0.90 rg 0 0 0 RG 0.5 w %.1f %.1f %.1f %.1f re B Q\n",
                x, y, w, h));
        drawText(sb, "F2", 10.5, x + 6, y + 7, title);
    }

    private void drawWhiteRow(StringBuilder sb, double x, double y, double w, double h) {
        sb.append(String.format(Locale.US,
                "q 1 1 1 rg 0 0 0 RG 0.5 w %.1f %.1f %.1f %.1f re B Q\n",
                x, y, w, h));
    }

    private void drawCenteredText(StringBuilder sb, String font, double size, double y, String text) {
        String safe = normaliserTextePdf(text);
        double factor = "F2".equals(font) ? 0.55 : 0.50;
        double textWidth = safe.length() * size * factor;
        double x = Math.max(40, (612.0 - textWidth) / 2.0);
        drawText(sb, font, size, x, y, safe);
    }

    private void drawText(StringBuilder sb, String font, double size, double x, double y, String text) {
        String escaped = escapePdfString(normaliserTextePdf(text));
        sb.append(String.format(Locale.US, "BT /%s %.1f Tf %.1f %.1f Td (%s) Tj ET\n",
                font, size, x, y, escaped));
    }

    private List<String> decouperTexte(String texte, int maxLen, int maxLines) {
        List<String> lines = new ArrayList<>();
        if (texte == null || texte.isBlank()) {
            lines.add("N/A");
            return lines;
        }
        for (String paragraphe : texte.split("\\r?\\n")) {
            String restant = paragraphe.trim();
            while (restant.length() > maxLen && lines.size() < maxLines) {
                int coupure = restant.lastIndexOf(' ', maxLen);
                if (coupure <= 0) {
                    coupure = maxLen;
                }
                lines.add(restant.substring(0, coupure));
                restant = restant.substring(coupure).trim();
            }
            if (!restant.isEmpty() && lines.size() < maxLines) {
                lines.add(restant);
            }
        }
        return lines;
    }

    private String normaliserTextePdf(String text) {
        if (text == null) {
            return "";
        }
        return text
                .replace('\u2019', '\'')
                .replace('\u2018', '\'')
                .replace('\u201C', '"')
                .replace('\u201D', '"')
                .replace('\u2013', '-')
                .replace('\u2014', '-');
    }

    private String escapePdfString(String text) {
        return text
                .replace("\\", "\\\\")
                .replace("(", "\\(")
                .replace(")", "\\)");
    }

    private byte[] assemblerPdfTroisPages(byte[] page1, byte[] page2, byte[] page3) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        List<Integer> offsets = new ArrayList<>();

        writeAscii(out, "%PDF-1.4\n");

        // 1: Catalog
        offsets.add(out.size());
        writeAscii(out, "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");

        // 2: Pages
        offsets.add(out.size());
        writeAscii(out, "2 0 obj\n<< /Type /Pages /Kids [3 0 R 5 0 R 7 0 R] /Count 3 >>\nendobj\n");

        // 3: Page 1
        offsets.add(out.size());
        writeAscii(out,
                "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 9 0 R /F2 10 0 R >> >> >>\nendobj\n");

        // 4: Page 1 stream
        offsets.add(out.size());
        writeAscii(out, "4 0 obj\n<< /Length " + page1.length + " >>\nstream\n");
        out.writeBytes(page1);
        writeAscii(out, "endstream\nendobj\n");

        // 5: Page 2
        offsets.add(out.size());
        writeAscii(out,
                "5 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 6 0 R /Resources << /Font << /F1 9 0 R /F2 10 0 R >> >> >>\nendobj\n");

        // 6: Page 2 stream
        offsets.add(out.size());
        writeAscii(out, "6 0 obj\n<< /Length " + page2.length + " >>\nstream\n");
        out.writeBytes(page2);
        writeAscii(out, "endstream\nendobj\n");

        // 7: Page 3
        offsets.add(out.size());
        writeAscii(out,
                "7 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 8 0 R /Resources << /Font << /F1 9 0 R /F2 10 0 R >> >> >>\nendobj\n");

        // 8: Page 3 stream
        offsets.add(out.size());
        writeAscii(out, "8 0 obj\n<< /Length " + page3.length + " >>\nstream\n");
        out.writeBytes(page3);
        writeAscii(out, "endstream\nendobj\n");

        // 9: Font F1 (Helvetica)
        offsets.add(out.size());
        writeAscii(out,
                "9 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n");

        // 10: Font F2 (Helvetica-Bold)
        offsets.add(out.size());
        writeAscii(out,
                "10 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj\n");

        int xrefOffset = out.size();
        writeAscii(out, "xref\n0 " + (offsets.size() + 1) + "\n");
        writeAscii(out, "0000000000 65535 f \n");
        for (int offset : offsets) {
            writeAscii(out, String.format("%010d 00000 n \n", offset));
        }

        writeAscii(out, "trailer\n<< /Size " + (offsets.size() + 1) + " /Root 1 0 R >>\n");
        writeAscii(out, "startxref\n" + xrefOffset + "\n%%EOF\n");

        return out.toByteArray();
    }

    private void writeAscii(ByteArrayOutputStream out, String text) {
        out.writeBytes(text.getBytes(StandardCharsets.ISO_8859_1));
    }
}
