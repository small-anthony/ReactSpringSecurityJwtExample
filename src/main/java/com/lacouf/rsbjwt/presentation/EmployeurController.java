package com.lacouf.rsbjwt.presentation;

import com.lacouf.rsbjwt.service.EmployeurService;
import com.lacouf.rsbjwt.service.UserAppService;
import com.lacouf.rsbjwt.service.dto.EmployeurDto;
import com.lacouf.rsbjwt.service.dto.OffreStageDto;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/employeur")
public class EmployeurController {
    private final UserAppService userService;
    private final EmployeurService employeurService;

    public EmployeurController(UserAppService userService, EmployeurService employeurService) {
        this.userService = userService;
        this.employeurService = employeurService;
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
    public ResponseEntity<Object> creerOffre(@RequestBody Map<String, String> request) throws Exception {
        try {
            OffreStageDto offreCree = employeurService.createOffreStage(
                    request.get("titre"),
                    request.get("nomEntreprise"),
                    request.get("description"),
                    request.get("employeurId")
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(offreCree);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}
