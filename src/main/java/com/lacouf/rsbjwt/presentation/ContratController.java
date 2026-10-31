package com.lacouf.rsbjwt.presentation;

import com.lacouf.rsbjwt.exceptions.UnexpectedUserException;
import com.lacouf.rsbjwt.presentation.RequestDto.CreationContratRequest;
import com.lacouf.rsbjwt.security.exception.UserNotFoundException;
import com.lacouf.rsbjwt.service.ContratService;
import com.lacouf.rsbjwt.service.dto.CandidaturePourContratDto;
import com.lacouf.rsbjwt.service.dto.ContratDto;
import com.lacouf.rsbjwt.service.dto.ErrorResponse;
import com.lacouf.rsbjwt.service.dto.interfaceDTO.DataTransferObject;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/contrats")
public class ContratController {
	private final ContratService contratService;

	public ContratController(ContratService contratService) {
		this.contratService = contratService;
	}

	@PostMapping()
	public ResponseEntity<?> creerContrat(@RequestBody CreationContratRequest request, Authentication authentication) {
		try {
			String email = authentication != null ? authentication.getName() : null;
			ContratDto contrat = contratService.creerContrat(request, email);
			return ResponseEntity.status(HttpStatus.CREATED).body(contrat);
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
		}
	}

	@GetMapping("/candidatures-acceptees")
	public ResponseEntity<List<CandidaturePourContratDto>> getCandidaturesAccepteesPourContrat() {
		return ResponseEntity.ok(contratService.getCandidaturesPourContrat());
	}

	@GetMapping()
	public ResponseEntity<List<ContratDto>> getTousLesContrats() {
		return ResponseEntity.ok(contratService.getTousLesContrats());
	}

	@GetMapping("/{id}")
	public ResponseEntity<?> getContratById(@PathVariable Long id) {
		try {
			return ResponseEntity.ok(contratService.getContratById(id));
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
		}
	}

	@PostMapping("/{id}/signer")
	public ResponseEntity<DataTransferObject> signerContrat(@PathVariable Long id, @RequestBody MultipartFile signature, Authentication authentication) {
		try {
			String email = authentication != null ? authentication.getName() : null;
			ContratDto contrat = contratService.signerContrat(id, email, signature);
			return ResponseEntity.ok(contrat);
		} catch (UnexpectedUserException | UserNotFoundException e) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ErrorResponse.create(e));
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ErrorResponse.create(e));
		}
	}

	@PostMapping("/{id}/rejeter")
	public ResponseEntity<DataTransferObject> rejeterContrat(@PathVariable Long id, Authentication authentication) {
		try {
			String email = authentication != null ? authentication.getName() : null;
			ContratDto contrat = contratService.rejeterContrat(id, email);
			return ResponseEntity.ok(contrat);
		} catch (UnexpectedUserException | UserNotFoundException e) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ErrorResponse.create(e));
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ErrorResponse.create(e));
		}
	}

	@GetMapping("/{id}/document")
	public ResponseEntity<byte[]> getContratDocument(@PathVariable Long id) {
		try {
			byte[] data = contratService.getContratPdf(id);
			return ResponseEntity.ok()
					.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"contrat-" + id + ".txt\"")
					.contentType(MediaType.TEXT_PLAIN)
					.body(data);
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
		}
	}
}
