package com.lacouf.rsbjwt.presentation;

import com.lacouf.rsbjwt.service.UserAppService;
import com.lacouf.rsbjwt.service.dto.EtudiantDto;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/etudiant")
public class EtudiantController {
    private final UserAppService userService;

    public EtudiantController(UserAppService userService) {
        this.userService = userService;
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
                    confirmPassword
            );

            return ResponseEntity.status(HttpStatus.CREATED).body(etudiant);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}
