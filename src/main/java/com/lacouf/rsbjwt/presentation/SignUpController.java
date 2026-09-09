package com.lacouf.rsbjwt.presentation;

import com.lacouf.rsbjwt.service.UserAppService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;

@RequiredArgsConstructor
@RestController
@RequestMapping("/signup")
class SignUpController {
	private final UserAppService userService;

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
}
