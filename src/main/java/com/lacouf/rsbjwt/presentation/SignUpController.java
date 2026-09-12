package com.lacouf.rsbjwt.presentation;

import com.lacouf.rsbjwt.service.UserAppService;
import com.lacouf.rsbjwt.service.dto.EmployeurDto;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/signup")
class SignUpController {
	private final UserAppService userService;

	public SignUpController(UserAppService userService) {
		this.userService = userService;
	}

	@PostMapping("/etudiant")
	public ResponseEntity<Object> signUpEtudiant() {
		return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
	}

	@PostMapping("/gestionnaire")
	public ResponseEntity<Object> signUpGestionnaire() {
		return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
	}

	@PostMapping("/professeur")
	public ResponseEntity<Object> signUpProfesseur() {
		return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
	}

	@PostMapping("/employeur")
	public ResponseEntity<Object> signUpEmployeur(@RequestParam String firstName,
												  @RequestParam String lastName,
												  @RequestParam String email,
												  @RequestParam String entreprise,
												  @RequestParam String telephone,
												  @RequestParam String password,
												  @RequestParam String passwordConfirmation) {
		if (!email.contains("@") || !email.contains(".")) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Le format du courriel n'est pas valide.");
		}

		if (password.length() < 8) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Le mot de passe doit contenir au moins 8 caractères.");
		}

		if (!password.equals(passwordConfirmation)) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Les mots de passe ne correspondent pas.");
		}

		try {
			EmployeurDto employeurCree = userService.registerEmployeur(
					firstName, lastName, email, entreprise, telephone, password, passwordConfirmation
			);
			return ResponseEntity.status(HttpStatus.CREATED).body(employeurCree);
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
		}
	}
}
