package com.lacouf.rsbjwt.presentation;

import com.lacouf.rsbjwt.service.UserAppService;
import com.lacouf.rsbjwt.service.dto.EmployeurDto;
import com.lacouf.rsbjwt.service.dto.ProfesseurDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/signup")
public class ProfesseurController {
    private final UserAppService userService;

    public ProfesseurController(UserAppService userService) {
        this.userService = userService;
    }


    @PostMapping("/professeur")
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
}
