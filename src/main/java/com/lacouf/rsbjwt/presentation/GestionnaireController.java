package com.lacouf.rsbjwt.presentation;

import com.lacouf.rsbjwt.presentation.RequestDto.AccepterCvDto;
import com.lacouf.rsbjwt.presentation.RequestDto.RefuserCvDto;
import com.lacouf.rsbjwt.service.GestionnaireService;
import com.lacouf.rsbjwt.service.dto.CvDto;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/gestionnaire"})
public class GestionnaireController {
    private final GestionnaireService gestionnaireService;

    public GestionnaireController(GestionnaireService gestionnaireService) {
        this.gestionnaireService = gestionnaireService;
    }

    @PutMapping("/cv/accepter")
    public ResponseEntity<Object> acceptCv(@RequestBody AccepterCvDto dto) {
        try {
            CvDto cvDto = gestionnaireService.accepterCv(dto.id());

            return ResponseEntity.status(HttpStatus.CREATED).body(cvDto);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PutMapping("/cv/refuser")
    public ResponseEntity<Object> refuseCv(@RequestBody RefuserCvDto dto) {
        try {
            CvDto cvDto = gestionnaireService.refuserCv(dto.id(), dto.message());

            return ResponseEntity.status(HttpStatus.CREATED).body(cvDto);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/cv/en-attente")
    public ResponseEntity<Object> getCvEnAttente() {
        try {
            return ResponseEntity.status(HttpStatus.OK).body(gestionnaireService.getCvEnAttente());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}
