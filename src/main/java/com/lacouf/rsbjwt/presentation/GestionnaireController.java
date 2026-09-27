package com.lacouf.rsbjwt.presentation;

import com.lacouf.rsbjwt.presentation.RequestDto.AcceptationOffreDto;
import com.lacouf.rsbjwt.presentation.RequestDto.RejetOffreDto;
import com.lacouf.rsbjwt.service.GestionnaireService;
import com.lacouf.rsbjwt.service.dto.OffreStageDto;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/gestionnaire")
public class GestionnaireController {

    private final GestionnaireService gestionnaireService;

    public GestionnaireController(GestionnaireService gestionnaireService) {
        this.gestionnaireService = gestionnaireService;
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
}
