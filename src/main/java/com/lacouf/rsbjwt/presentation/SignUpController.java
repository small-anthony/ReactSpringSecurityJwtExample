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
	public ResponseEntity<Object> signUpEmployeur(@RequestBody Map<String, String> request) {
		try {
			EmployeurDto employeurCree = userService.registerEmployeur(
					request.get("firstName"),
					request.get("lastName"),
					request.get("email"),
					request.get("entreprise"),
					request.get("telephone"),
					request.get("password"),
					request.get("passwordConfirmation")
			);
			return ResponseEntity.status(HttpStatus.CREATED).body(employeurCree);
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
		}
	}
}
