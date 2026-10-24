package com.lacouf.rsbjwt.presentation;

import com.lacouf.rsbjwt.model.ENUM.StatusAcceptation;
import com.lacouf.rsbjwt.model.OffreStage;
import com.lacouf.rsbjwt.repository.CandidatureRepository;
import com.lacouf.rsbjwt.repository.OffreStageRepository;
import com.lacouf.rsbjwt.service.UserAppService;
import com.lacouf.rsbjwt.service.dto.CandidatureDto;
import com.lacouf.rsbjwt.service.dto.OffreStageDto;
import com.lacouf.rsbjwt.service.dto.ProfesseurDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/professeur")
public class ProfesseurController {
    private final UserAppService userService;
    private final OffreStageRepository offreStageRepository;
    private final CandidatureRepository candidatureRepository;

    @Autowired
    public ProfesseurController(UserAppService userService,
                                OffreStageRepository offreStageRepository,
                                CandidatureRepository candidatureRepository) {
        this.userService = userService;
        this.offreStageRepository = offreStageRepository;
        this.candidatureRepository = candidatureRepository;
    }

    public ProfesseurController(UserAppService userService) {
        this(userService, null, null);
    }

    @PostMapping("/inscription")
    public ResponseEntity<Object> signUpProfesseur(@RequestBody Map<String, String> request) {
        try {
            ProfesseurDto professeurCree = userService.registerProfesseur(
                    request.get("firstName"),
                    request.get("lastName"),
                    request.get("email"),
                    request.get("password"),
                    request.get("passwordConfirmation")
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(professeurCree);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/offres")
    public ResponseEntity<List<OffreStageDto>> getOffres(@RequestParam(required = false) Integer annee) {
        if (offreStageRepository == null) {
            return ResponseEntity.ok(List.of());
        }
        List<OffreStage> offres = (annee != null)
                ? offreStageRepository.findByApprobationStatusAndAnnee(StatusAcceptation.ACCEPTE, annee)
                : offreStageRepository.findByApprobationStatus(StatusAcceptation.ACCEPTE);
        return ResponseEntity.ok(OffreStageDto.create(offres));
    }

    @GetMapping("/candidatures")
    public ResponseEntity<List<CandidatureDto>> getCandidatures(@RequestParam(required = false) Integer annee) {
        if (candidatureRepository == null) {
            return ResponseEntity.ok(List.of());
        }
        var candidatures = (annee != null)
                ? candidatureRepository.findByAnnee(annee)
                : candidatureRepository.findAll();
        return ResponseEntity.ok(CandidatureDto.create(candidatures));
    }

    @GetMapping("/annees")
    public ResponseEntity<List<Integer>> getAnnees() {
        Set<Integer> annees = new TreeSet<>(Collections.reverseOrder());
        annees.add(LocalDate.now().getYear());
        if (offreStageRepository != null) {
            annees.addAll(offreStageRepository.findDistinctAnnees());
        }
        return ResponseEntity.ok(new ArrayList<>(annees));
    }
}