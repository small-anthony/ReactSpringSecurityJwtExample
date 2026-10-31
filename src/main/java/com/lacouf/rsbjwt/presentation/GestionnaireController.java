package com.lacouf.rsbjwt.presentation;

import com.lacouf.rsbjwt.presentation.RequestDto.AcceptationOffreDto;
import com.lacouf.rsbjwt.presentation.RequestDto.CreationContratRequest;
import com.lacouf.rsbjwt.presentation.RequestDto.DecisionCvRequest;
import com.lacouf.rsbjwt.presentation.RequestDto.RejetOffreDto;
import com.lacouf.rsbjwt.service.ContratService;
import com.lacouf.rsbjwt.service.ConvocationService;
import com.lacouf.rsbjwt.service.GestionnaireService;
import com.lacouf.rsbjwt.service.dto.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({ "/gestionnaire" })
public class GestionnaireController {
    private final GestionnaireService gestionnaireService;
    private final ConvocationService convocationService;
    private final ContratService contratService;

    public GestionnaireController(GestionnaireService gestionnaireService,
                                  ConvocationService convocationService,
                                  ContratService contratService) {
        this.gestionnaireService = gestionnaireService;
        this.convocationService = convocationService;
        this.contratService = contratService;
    }

    @PutMapping("/cv/accepter")
    public ResponseEntity<Object> acceptCv(@RequestBody DecisionCvRequest request) {
        try {
            CvDto cvDto = gestionnaireService.accepterCv(request.id());
            return ResponseEntity.status(HttpStatus.CREATED).body(cvDto);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PutMapping("/cv/refuser")
    public ResponseEntity<Object> refuseCv(@RequestBody DecisionCvRequest request) {
        try {
            CvDto cvDto = gestionnaireService.refuserCv(request.id(), request.message());
            return ResponseEntity.status(HttpStatus.CREATED).body(cvDto);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/cv/en-attente")
    public ResponseEntity<Object> getCvEnAttente() {
        try {
            return ResponseEntity.status(HttpStatus.OK).body(gestionnaireService.getCvEnAttente());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping(value = "/cv/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> getCvPdf(@RequestBody DecisionCvRequest request) {
        try {
            byte[] pdfData = gestionnaireService.getCvPdf(request.id());
            return ResponseEntity.status(HttpStatus.OK).body(pdfData);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @PutMapping("/offre/accepterOffre")
    public ResponseEntity<?> accepterOffreStage(@RequestBody AcceptationOffreDto request) {
        try {
            return ResponseEntity.ok(gestionnaireService.accepterOffreStage(request.id(), request.etudiantsIds()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/offre/refuserOffre")
    public ResponseEntity<?> refuserOffreStage(@RequestBody RejetOffreDto request) {
        try {
            return ResponseEntity.ok(gestionnaireService.refuserOffreStage(request.id(), request.commentaire()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/offre/pending")
    public ResponseEntity<List<OffreStageDto>> getOffresEnAttente() {
        try {
            return ResponseEntity.ok(gestionnaireService.getOffresEnAttente());
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/convocations")
    public ResponseEntity<List<ConvocationDto>> getToutesConvocations() {
        return ResponseEntity.ok(convocationService.getToutesConvocations());
    }

    @GetMapping("/rapports/etudiants-inscrits")
    public ResponseEntity<List<RapportEtudiantDto>> getTousLesEtudiants() {
        return ResponseEntity.ok(gestionnaireService.getTousLesEtudiants());
    }
    @GetMapping("/rapports/etudiants-sans-convocation")
    public ResponseEntity<List<RapportEtudiantDto>> getEtudiantsSansConvocation() {
        return ResponseEntity.ok(gestionnaireService.getEtudiantsSansConvocation());
    }
    @GetMapping("/rapports/etudiants-attente-entrevue")
    public ResponseEntity<List<RapportEtudiantDto>> getEtudiantsEnAttenteEntrevue() {
        return ResponseEntity.ok(gestionnaireService.getEtudiantsEnAttenteEntrevue());
    }
    @GetMapping("/rapports/etudiants-attente-reponse")
    public ResponseEntity<List<RapportEtudiantDto>> getEtudiantsEnAttenteReponse() {
        return ResponseEntity.ok(gestionnaireService.getEtudiantsEnAttenteReponse());
    }
    @GetMapping("/rapports/etudiants-trouve-stage")
    public ResponseEntity<List<RapportEtudiantDto>> getEtudiantsTrouveStage() {
        return ResponseEntity.ok(gestionnaireService.getEtudiantsTrouveStage());
    }
}
