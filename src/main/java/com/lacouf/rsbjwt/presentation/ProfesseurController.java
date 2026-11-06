package com.lacouf.rsbjwt.presentation;

import com.lacouf.rsbjwt.model.ENUM.StatusAcceptation;
import com.lacouf.rsbjwt.model.OffreStage;
import com.lacouf.rsbjwt.repository.CandidatureRepository;
import com.lacouf.rsbjwt.repository.OffreStageRepository;
import com.lacouf.rsbjwt.service.ProfesseurService;
import com.lacouf.rsbjwt.service.UserAppService;
import com.lacouf.rsbjwt.service.dto.CandidatureDto;
import com.lacouf.rsbjwt.service.dto.EtudiantSuperviseDto;
import com.lacouf.rsbjwt.service.dto.OffreStageDto;
import com.lacouf.rsbjwt.service.dto.ProfesseurDto;
import com.lacouf.rsbjwt.util.AcademicSessionUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/professeur")
public class ProfesseurController {
    private final UserAppService userService;
    private final OffreStageRepository offreStageRepository;
    private final CandidatureRepository candidatureRepository;
    private final ProfesseurService professeurService;

    @Autowired
    public ProfesseurController(UserAppService userService,
                                OffreStageRepository offreStageRepository,
                                CandidatureRepository candidatureRepository,
                                ProfesseurService professeurService) {
        this.userService = userService;
        this.offreStageRepository = offreStageRepository;
        this.candidatureRepository = candidatureRepository;
        this.professeurService = professeurService;
    }

    public ProfesseurController(UserAppService userService,
                                OffreStageRepository offreStageRepository,
                                CandidatureRepository candidatureRepository) {
        this(userService, offreStageRepository, candidatureRepository, null);
    }

    public ProfesseurController(UserAppService userService) {
        this(userService, null, null, null);
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
        try {
            if (offreStageRepository == null) {
                return ResponseEntity.ok(List.of());
            }
            List<OffreStage> offres = (annee != null)
                    ? offreStageRepository.findByApprobationStatusAndAnnee(StatusAcceptation.ACCEPTE, annee)
                    : offreStageRepository.findByApprobationStatus(StatusAcceptation.ACCEPTE);
            return ResponseEntity.ok(OffreStageDto.create(offres));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @GetMapping("/candidatures")
    public ResponseEntity<List<CandidatureDto>> getCandidatures(@RequestParam(required = false) Integer annee) {
        try {
            if (candidatureRepository == null) {
                return ResponseEntity.ok(List.of());
            }
            var candidatures = (annee != null)
                    ? candidatureRepository.findByAnnee(annee)
                    : candidatureRepository.findAll();
            return ResponseEntity.ok(CandidatureDto.create(candidatures));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @GetMapping("/annees")
    public ResponseEntity<Object> getAnnees() {
        try {
            Set<Integer> annees = new TreeSet<>(Collections.reverseOrder());
            annees.add(AcademicSessionUtils.getAnneeActuelle());
            if (offreStageRepository != null) {
                annees.addAll(offreStageRepository.findDistinctAnnees());
            }
            return ResponseEntity.ok(new ArrayList<>(annees));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/etudiants-assignes")
    public ResponseEntity<?> getMesEtudiants(
            Authentication authentication,
            @RequestParam(required = false) Integer annee) {
        try {
            if (professeurService == null) {
                return ResponseEntity.ok(List.of());
            }
            String email = authentication != null ? authentication.getName() : null;
            return ResponseEntity.ok(professeurService.getEtudiantsAssignes(email, annee));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/etudiants-assignes/{id}")
    public ResponseEntity<?> getMonEtudiantDetail(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            if (professeurService == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
            String email = authentication != null ? authentication.getName() : null;
            return ResponseEntity.ok(professeurService.getEtudiantDetail(id, email));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
