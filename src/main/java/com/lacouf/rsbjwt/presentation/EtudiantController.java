package com.lacouf.rsbjwt.presentation;

import com.lacouf.rsbjwt.service.EtudiantService;
import com.lacouf.rsbjwt.service.UserAppService;
import com.lacouf.rsbjwt.service.dto.*;
import com.lacouf.rsbjwt.presentation.RequestDto.ConflitHoraireRequest;
import com.lacouf.rsbjwt.presentation.RequestDto.RefusConvocationRequest;
import com.lacouf.rsbjwt.service.ConvocationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({ "/etudiant" })
public class EtudiantController {
    private final UserAppService userService;
    private final EtudiantService etudiantService;
    private final ConvocationService convocationService;

    @Autowired
    public EtudiantController(UserAppService userService, EtudiantService etudiantService,
            ConvocationService convocationService) {
        this.userService = userService;
        this.etudiantService = etudiantService;
        this.convocationService = convocationService;
    }

    public EtudiantController(UserAppService userService, EtudiantService etudiantService) {
        this(userService, etudiantService, null);
    }

    public EtudiantController(UserAppService userService) {
        this(userService, null, null);
    }

    public EtudiantController(EtudiantService etudiantService) {
        this(null, etudiantService, null);
    }

    public EtudiantController(com.lacouf.rsbjwt.service.ConvocationService convocationService) {
        this(null, null, convocationService);
    }

    @PostMapping("/inscription")
    public ResponseEntity<Object> signUpEtudiant(@RequestBody Map<String, String> body) {
        try {
            String firstName = body.get("firstName");
            String lastName = body.get("lastName");
            int matricule = Integer.parseInt(body.get("matricule"));
            String email = body.get("email");
            String discipline = body.get("discipline");
            String password = body.get("password");
            String confirmPassword = body.get("confirmPassword");

            EtudiantDto etudiant = userService.registerStudent(
                    firstName,
                    lastName,
                    matricule,
                    email,
                    discipline,
                    password,
                    confirmPassword);

            return ResponseEntity.status(HttpStatus.CREATED).body(etudiant);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/cv")
    public ResponseEntity<Object> uploadCv(@RequestParam("file") MultipartFile file, Authentication authentication) {
        try {
            String emailConnecte = authentication.getName();
            CvDto nouveauCv = etudiantService.uploadCv(emailConnecte, file);
            return ResponseEntity.status(HttpStatus.CREATED).body(nouveauCv);
        } catch (Exception e) {
            if (e.getMessage() != null && e.getMessage().contains("Accès refusé")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/offres/{offreId}")
    public ResponseEntity<Object> postuler(@PathVariable Long offreId, Authentication authentication) {
        try {
            OffreStageDto offre = etudiantService.postuler(offreId, authentication.getName());
            return ResponseEntity.status(HttpStatus.CREATED).body(offre);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/candidatures")
    public ResponseEntity<Object> getMesCandidatures(Authentication authentication) {
        try {
            return ResponseEntity.ok(etudiantService.getMesCandidatures(authentication.getName()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/cv/statut")
    public ResponseEntity<StatutCvDto> getStatutCv(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(etudiantService.getStatutCv(email));
    }

    @GetMapping("/offres")
    public ResponseEntity<List<OffreStageDto>> getOffresDisponibles(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(etudiantService.getOffresDisponibles(email));
    }

    @GetMapping("/offres/{id}")
    public ResponseEntity<OffreStageDto> getOffreDetail(@PathVariable("id") Long id, Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(etudiantService.getOffreDetail(id, email));
    }

    @GetMapping("/convocations")
    public ResponseEntity<List<ConvocationDto>> getConvocations(Authentication authentication) {
        return ResponseEntity.ok(convocationService.getConvocationsEtudiant(authentication.getName()));
    }

    // TODO convocations?statut=accepted
    @GetMapping("/convocations/acceptees")
    public ResponseEntity<List<ConvocationDto>> getConvocationsAcceptees(Authentication authentication) {
        return ResponseEntity.ok(convocationService.getConvocationsAccepteesEtudiant(authentication.getName()));
    }

    @PostMapping("/convocations/{id}/accepter")
    public ResponseEntity<?> accepterConvocation(@PathVariable Long id, @RequestBody(required = false) RendezVousDto rendezVousDto, Authentication authentication) {
        try {
            return ResponseEntity.ok(convocationService.accepterConvocation(authentication.getName(), id, rendezVousDto));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/convocations/{id}/refuser")
    public ResponseEntity<?> refuserConvocation(@PathVariable Long id,
            @RequestBody(required = false) RefusConvocationRequest request, Authentication authentication) {
        try {
            String motif = request != null ? request.getMotif() : null;
            return ResponseEntity.ok(convocationService.refuserConvocation(authentication.getName(), id, motif));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/recherche")
    public ResponseEntity<List<EtudiantDto>> rechercherEtudiants(@RequestParam("motCle") String motCle) {
        List<EtudiantDto> resultats = etudiantService.rechercherEtudiants(motCle);
        return ResponseEntity.ok(resultats);
    }
}
