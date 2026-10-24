package com.lacouf.rsbjwt.presentation;

import com.lacouf.rsbjwt.presentation.RequestDto.ModifierOffreRequest;
import com.lacouf.rsbjwt.service.EmployeurService;
import com.lacouf.rsbjwt.service.UserAppService;
import com.lacouf.rsbjwt.service.dto.ConvocationDto;
import com.lacouf.rsbjwt.service.dto.EmployeurDto;
import com.lacouf.rsbjwt.service.dto.OffreStageDto;
import org.springframework.security.core.Authentication;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.lacouf.rsbjwt.presentation.RequestDto.CreationConvocationRequest;
import com.lacouf.rsbjwt.service.ConvocationService;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/employeur")
public class EmployeurController {
    private final UserAppService userService;
    private final EmployeurService employeurService;
    private final ConvocationService convocationService;

    public EmployeurController(UserAppService userService, EmployeurService employeurService, ConvocationService convocationService) {
        this.userService = userService;
        this.employeurService = employeurService;
        this.convocationService = convocationService;
    }

    @PostMapping("/inscription")
    public ResponseEntity<Object> signUpEmployeur(@RequestBody Map<String, String> request) {
        try {
            EmployeurDto employeurCree = userService.registerEmployeur(
                    request.get("firstName"),
                    request.get("lastName"),
                    request.get("email"),
                    request.get("entreprise"),
                    request.get("telephone"),
                    request.get("password"),
                    request.get("passwordConfirmation")
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(employeurCree);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/creerOffre")
    public ResponseEntity<Object> creerOffre(@RequestBody Map<String, String> request, Authentication authentication) {
        try {
            String email = authentication.getName();
            String discipline = request.get("discipline");
            String duree = request.get("duree");
            String salaire = request.get("salaire");
            String exigences = request.get("exigences");

            Integer annee = null;
            if (request.get("annee") != null && !request.get("annee").trim().isEmpty()) {
                try {
                    annee = Integer.parseInt(request.get("annee").trim());
                } catch (Exception ignored) {}
            }

            OffreStageDto offreCree;
            if (annee != null) {
                offreCree = employeurService.createOffreStage(
                        request.get("titre"),
                        request.get("nomEntreprise"),
                        request.get("description"),
                        discipline,
                        duree,
                        salaire,
                        exigences,
                        email,
                        annee
                );
            } else if (discipline != null || duree != null || salaire != null || exigences != null) {
                offreCree = employeurService.createOffreStage(
                        request.get("titre"),
                        request.get("nomEntreprise"),
                        request.get("description"),
                        discipline,
                        duree,
                        salaire,
                        exigences,
                        email
                );
            } else {
                offreCree = employeurService.createOffreStage(
                        request.get("titre"),
                        request.get("nomEntreprise"),
                        request.get("description"),
                        email
                );
            }
            return ResponseEntity.status(HttpStatus.CREATED).body(offreCree);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    public ResponseEntity<Object> getOffres(Authentication authentication) {
        return getOffres(null, authentication);
    }

    @GetMapping("/offres")
    public ResponseEntity<Object> getOffres(@RequestParam(required = false) Integer annee, Authentication authentication) {
        try {
            List<OffreStageDto> offres = (annee != null)
                    ? employeurService.getOffres(authentication.getName(), annee)
                    : employeurService.getOffres(authentication.getName());
            return ResponseEntity.ok(offres);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/offres/{offreId}/candidatures")
    public ResponseEntity<Object> getCandidatures(@PathVariable Long offreId, Authentication authentication) {
        try {
            return ResponseEntity.ok(employeurService.getCandidatures(offreId, authentication.getName()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/candidatures/{candidatureId}/cv")
    public ResponseEntity<Object> getCvCandidat(@PathVariable Long candidatureId, Authentication authentication) {
        try {
            byte[] cv = employeurService.getCvCandidat(candidatureId, authentication.getName());
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"cv.pdf\"")
                    .body(cv);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PutMapping("/candidatures/{candidatureId}/accepter")
    public ResponseEntity<Object> accepterCandidature(@PathVariable Long candidatureId, Authentication authentication) {
        try {
            return ResponseEntity.ok(employeurService.accepterCandidature(candidatureId, authentication.getName()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PutMapping("/candidatures/{candidatureId}/refuser")
    public ResponseEntity<Object> refuserCandidature(@PathVariable Long candidatureId,
                                                     @RequestBody(required = false) Map<String, String> request,
                                                     Authentication authentication) {
        try {
            String message = request != null ? request.get("message") : null;
            return ResponseEntity.ok(employeurService.refuserCandidature(candidatureId, message, authentication.getName()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/annees")
    public ResponseEntity<Object> getAnnees(Authentication authentication) {
        try {
            return ResponseEntity.ok(employeurService.getAnnees(authentication.getName()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    public ResponseEntity<Object> getHistorique(Authentication authentication) {
        return getHistorique(null, authentication);
    }

    @GetMapping("/historique")
    public ResponseEntity<Object> getHistorique(@RequestParam(required = false) Integer annee, Authentication authentication) {
        if (annee != null) {
            return ResponseEntity.ok(employeurService.getHistorique(authentication.getName(), annee));
        }

        return ResponseEntity.ok(employeurService.getHistorique(authentication.getName()));
    }

    @PostMapping("/candidatures/{candidatureId}/convoquer")
    public ResponseEntity<Object> convoquerCandidat(
            @PathVariable Long candidatureId,
            @RequestBody CreationConvocationRequest request,
            Authentication authentication) {
        try {
            ConvocationDto convocationDto = convocationService.creerConvocation(
                    authentication.getName(),
                    candidatureId,
                    request.rendezVousPossibles(),
                    request.messageEmployeur()
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(convocationDto);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/convocations")
    public ResponseEntity<List<ConvocationDto>> getConvocationsEmployeur(Authentication authentication) {
        return ResponseEntity.ok(convocationService.getConvocationsEmployeur(authentication.getName()));
    }

    @DeleteMapping("/offres/{offreId}")
    public ResponseEntity<Object> deleteOffre(@PathVariable Long offreId, Authentication authentication) {
        try {
            employeurService.deleteOffre(offreId, authentication.getName());
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PutMapping("/modifierOffre")
    public ResponseEntity<Object> updateOffre(@RequestBody ModifierOffreRequest request,
                                              Authentication authentication) {
        try {
            String email = authentication.getName();
            OffreStageDto offreModifiee = employeurService.updateOffreStage(
                    request.id(),
                    request.titre(),
                    request.nomEntreprise(),
                    request.description(),
                    request.discipline(),
                    request.duree(),
                    request.salaire(),
                    request.exigences(),
                    email
            );
            return ResponseEntity.ok(offreModifiee);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}