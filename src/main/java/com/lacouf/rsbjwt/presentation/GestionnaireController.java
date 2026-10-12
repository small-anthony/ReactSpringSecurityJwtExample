package com.lacouf.rsbjwt.presentation;

import com.lacouf.rsbjwt.presentation.RequestDto.DecisionCvRequest;
import com.lacouf.rsbjwt.presentation.RequestDto.AcceptationOffreDto;
import com.lacouf.rsbjwt.presentation.RequestDto.RejetOffreDto;
import com.lacouf.rsbjwt.service.ConvocationService;
import com.lacouf.rsbjwt.service.dto.ConvocationDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import com.lacouf.rsbjwt.service.GestionnaireService;
import com.lacouf.rsbjwt.service.dto.CvDto;
import com.lacouf.rsbjwt.service.dto.OffreStageDto;
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

    public GestionnaireController(GestionnaireService gestionnaireService) {
        this(gestionnaireService, null);
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
}
