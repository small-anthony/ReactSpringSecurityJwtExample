package com.lacouf.rsbjwt.presentation;

import com.lacouf.rsbjwt.presentation.RequestDto.AcceptationOffreDto;
import com.lacouf.rsbjwt.presentation.RequestDto.AssignationProfesseurRequest;
import com.lacouf.rsbjwt.presentation.RequestDto.DecisionCvRequest;
import com.lacouf.rsbjwt.presentation.RequestDto.RejetOffreDto;
import com.lacouf.rsbjwt.service.ConvocationService;
import com.lacouf.rsbjwt.service.GestionnaireService;
import com.lacouf.rsbjwt.service.dto.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({ "/gestionnaire" })
public class GestionnaireController {
    private final GestionnaireService gestionnaireService;
    private final ConvocationService convocationService;

    @Autowired
    public GestionnaireController(GestionnaireService gestionnaireService, ConvocationService convocationService) {
        this.gestionnaireService = gestionnaireService;
        this.convocationService = convocationService;
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
    public ResponseEntity<Object> getOffresEnAttente(@RequestParam(required = false) Integer annee) {
        try {
            if (annee != null) {
                return ResponseEntity.ok(gestionnaireService.getOffresEnAttente(annee));
            }
            return ResponseEntity.ok(gestionnaireService.getOffresEnAttente());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/offres")
    public ResponseEntity<Object> getToutesOffres(@RequestParam(required = false) Integer annee) {
        try {
            return ResponseEntity.ok(gestionnaireService.getToutesOffres(annee));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/annees")
    public ResponseEntity<Object> getAnneesDisponibles() {
        try {
            return ResponseEntity.ok(gestionnaireService.getAnneesDisponibles());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/convocations")
    public ResponseEntity<Object> getToutesConvocations(@RequestParam(required = false) Integer annee) {
        try {
            if (annee != null) {
                return ResponseEntity.ok(convocationService.getToutesConvocations(annee));
            }
            return ResponseEntity.ok(convocationService.getToutesConvocations());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/rapports/etudiants-inscrits")
    public ResponseEntity<List<RapportEtudiantDto>> getTousLesEtudiants() {
        return ResponseEntity.ok(gestionnaireService.getTousLesEtudiants());
    }

    @GetMapping("/rapports/etudiants-sans-convocation")
    public ResponseEntity<List<RapportEtudiantDto>> getEtudiantsSansConvocation(@RequestParam(required = false) Integer annee) {
        return ResponseEntity.ok(gestionnaireService.getEtudiantsSansConvocation(annee));
    }

    @GetMapping("/rapports/etudiants-attente-entrevue")
    public ResponseEntity<List<RapportEtudiantDto>> getEtudiantsEnAttenteEntrevue(@RequestParam(required = false) Integer annee) {
        return ResponseEntity.ok(gestionnaireService.getEtudiantsEnAttenteEntrevue(annee));
    }

    @GetMapping("/rapports/etudiants-attente-reponse")
    public ResponseEntity<List<RapportEtudiantDto>> getEtudiantsEnAttenteReponse(@RequestParam(required = false) Integer annee) {
        return ResponseEntity.ok(gestionnaireService.getEtudiantsEnAttenteReponse(annee));
    }

    @GetMapping("/rapports/etudiants-trouve-stage")
    public ResponseEntity<List<RapportEtudiantDto>> getEtudiantsTrouveStage(@RequestParam(required = false) Integer annee) {
        return ResponseEntity.ok(gestionnaireService.getEtudiantsTrouveStage(annee));
    }

    @GetMapping("/assignation-professeurs/etudiants")
    public ResponseEntity<List<EtudiantPourAssignationDto>> getEtudiantsPourAssignation(
            @RequestParam(required = false) Integer annee) {
        return ResponseEntity.ok(gestionnaireService.getEtudiantsPourAssignation(annee));
    }

    @GetMapping("/assignation-professeurs/professeurs")
    public ResponseEntity<List<ProfesseurPourAssignationDto>> getProfesseursPourAssignation(
            @RequestParam(required = false) String nom) {
        return ResponseEntity.ok(gestionnaireService.getProfesseursPourAssignation(nom));
    }

    @PostMapping("/assignation-professeurs")
    public ResponseEntity<?> assignerProfesseur(
            @RequestBody AssignationProfesseurRequest request) {
        try {
            return ResponseEntity.ok(gestionnaireService.assignerProfesseur(
                    request.etudiantId(), request.professeurId(), request.professeurNom()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/assignation-professeurs")
    public ResponseEntity<?> modifierAssignationProfesseur(
            @RequestBody AssignationProfesseurRequest request) {
        try {
            return ResponseEntity.ok(gestionnaireService.assignerProfesseur(
                    request.etudiantId(), request.professeurId(), request.professeurNom()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/assignation-professeurs/{etudiantId}")
    public ResponseEntity<?> desassignerProfesseur(@PathVariable Long etudiantId) {
        try {
            return ResponseEntity.ok(gestionnaireService.desassignerProfesseur(etudiantId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
