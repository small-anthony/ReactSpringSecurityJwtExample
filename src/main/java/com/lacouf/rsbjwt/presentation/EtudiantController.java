package com.lacouf.rsbjwt.presentation;

import com.lacouf.rsbjwt.service.EtudiantService;
import com.lacouf.rsbjwt.service.UserAppService;
import com.lacouf.rsbjwt.service.dto.CvDto;
import com.lacouf.rsbjwt.service.dto.EtudiantDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping({ "/etudiant" })
public class EtudiantController {
    private final UserAppService userService;
    private final EtudiantService etudiantService;

    @Autowired
    public EtudiantController(UserAppService userService, EtudiantService etudiantService) {
        this.userService = userService;
        this.etudiantService = etudiantService;
    }

    public EtudiantController(UserAppService userService) {
        this(userService, null);
    }

    public EtudiantController(EtudiantService etudiantService) {
        this(null, etudiantService);
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
}
