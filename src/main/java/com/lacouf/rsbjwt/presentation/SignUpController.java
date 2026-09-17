package com.lacouf.rsbjwt.presentation;

import com.lacouf.rsbjwt.service.UserAppService;
import com.lacouf.rsbjwt.service.dto.EtudiantDto;
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
