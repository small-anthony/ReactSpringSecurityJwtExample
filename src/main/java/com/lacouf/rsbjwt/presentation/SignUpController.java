package com.lacouf.rsbjwt.presentation;

import com.lacouf.rsbjwt.service.UserAppService;
import com.lacouf.rsbjwt.service.dto.EtudiantDto;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;

@RestController
@RequestMapping("/signup")
class SignUpController {
	private final UserAppService userService;

	public SignUpController(UserAppService userService) {
		this.userService = userService;
	}

	@PostMapping("/etudiant")
	public ResponseEntity<Object> signUpEtudiant(
			@RequestParam String firstName,
			@RequestParam String lastName,
			@RequestParam int matricule,
			@RequestParam String email,
			@RequestParam String discipline,
			@RequestParam String password,
			@RequestParam String confirmPassword) throws Exception {

		try {
			EtudiantDto etudiant = userService.registerEtudiant(firstName, lastName, matricule, email, discipline, password, confirmPassword);

			return ResponseEntity.status(HttpStatus.CREATED).body(etudiant);

		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
		}
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
	public ResponseEntity<Object> signUpEmployeur() {
		return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
	}
}
