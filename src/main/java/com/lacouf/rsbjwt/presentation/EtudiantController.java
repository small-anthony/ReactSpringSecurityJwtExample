package com.lacouf.rsbjwt.presentation;

import com.lacouf.rsbjwt.service.UserAppService;
import com.lacouf.rsbjwt.service.dto.CvDto;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/etudiants")
public class EtudiantController {
    private final UserAppService userAppService;

    public EtudiantController(UserAppService userAppService) {
        this.userAppService = userAppService;
    }

    @PostMapping("/{id}/cv")
    public ResponseEntity<Object> uploadCv(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        try {
            CvDto nouveauCv = userAppService.uploadCv(id, file);
            return ResponseEntity.status(HttpStatus.CREATED).body(nouveauCv);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}
