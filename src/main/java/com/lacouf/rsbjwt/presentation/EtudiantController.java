package com.lacouf.rsbjwt.presentation;

import com.lacouf.rsbjwt.service.UserAppService;
import com.lacouf.rsbjwt.service.dto.CvDto;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/etudiants")
public class EtudiantController {
    private final UserAppService userAppService;

    public EtudiantController(UserAppService userAppService) {
        this.userAppService = userAppService;
    }

    @PostMapping("/cv")
    public ResponseEntity<Object> uploadCv(@RequestParam("file") MultipartFile file, Authentication authentication) {
        try {
            String emailConnecte = authentication.getName();
            CvDto nouveauCv = userAppService.uploadCv(emailConnecte, file);
            return ResponseEntity.status(HttpStatus.CREATED).body(nouveauCv);
        } catch (Exception e) {
            if (e.getMessage().contains("Accès refusé")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}
