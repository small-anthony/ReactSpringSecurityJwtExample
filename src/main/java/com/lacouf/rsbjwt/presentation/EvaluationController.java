package com.lacouf.rsbjwt.presentation;

import com.lacouf.rsbjwt.presentation.RequestDto.EvaluationRequest;
import com.lacouf.rsbjwt.service.EvaluationService;
import com.lacouf.rsbjwt.service.dto.ErrorResponse;
import com.lacouf.rsbjwt.service.dto.StagiaireDto;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/evaluations")
public class EvaluationController {
    private final EvaluationService evaluationService;

    public EvaluationController(EvaluationService evaluationService) {
        this.evaluationService = evaluationService;
    }

    @GetMapping("/stagiaires")
    public ResponseEntity<List<StagiaireDto>> getStagiaires(Authentication authentication) {
        return ResponseEntity.ok(evaluationService.getStagiaires(emailDe(authentication)));
    }

    @GetMapping("/stagiaires/{contratId}")
    public ResponseEntity<?> getStagiaire(@PathVariable Long contratId, Authentication authentication) {
        try {
            return ResponseEntity.ok(evaluationService.getStagiaire(contratId, emailDe(authentication)));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ErrorResponse.create(e));
        }
    }

    @GetMapping("/contrats/{contratId}")
    public ResponseEntity<?> getEvaluation(@PathVariable Long contratId, Authentication authentication) {
        try {
            return ResponseEntity.ok(evaluationService.getEvaluation(contratId, emailDe(authentication)));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ErrorResponse.create(e));
        }
    }

    @PostMapping("/contrats/{contratId}")
    public ResponseEntity<?> evaluer(@PathVariable Long contratId,
                                     @RequestBody EvaluationRequest requete,
                                     Authentication authentication) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(evaluationService.evaluer(contratId, emailDe(authentication), requete));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ErrorResponse.create(e));
        }
    }

    private static String emailDe(Authentication authentication) {
        return authentication != null ? authentication.getName() : null;
    }
}