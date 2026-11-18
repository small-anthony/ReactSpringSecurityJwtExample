package com.lacouf.rsbjwt.presentation;

import com.lacouf.rsbjwt.presentation.RequestDto.CreationContratRequest;
import com.lacouf.rsbjwt.service.ContratService;
import com.lacouf.rsbjwt.service.dto.CandidaturePourContratDto;
import com.lacouf.rsbjwt.model.ENUM.StatutContrat;
import com.lacouf.rsbjwt.service.dto.ContratDto;
import java.time.Instant;
import com.lacouf.rsbjwt.service.dto.interfaceDTO.DataTransferObject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ContratControllerTest {

	@Mock
	private ContratService contratService;

	@InjectMocks
	private ContratController contratController;

	private CreationContratRequest requestValide;

	private ContratDto createDummyContratDto() {
		return new ContratDto(
				1L, 1L, 1L, "Dev Web", "CGI",
				"Employeur Nom", "employeur@test.com",
				"Martin", "Sophie", "sophie@test.com", 123456,
				LocalDate.now(), LocalDate.now().plusMonths(3),
				"35h / semaine", "20$ / heure", "Developper des applications", "Conditions",
				StatutContrat.EN_ATTENTE_SIGNATURE, Instant.now(),
				false, false, false,
				false, false, false
		);
	}

	private CandidaturePourContratDto createDummyCandidaturePourContratDto() {
		return new CandidaturePourContratDto(
				1L, 1L, "Dev Web", "CGI",
				"Employeur Nom", "employeur@test.com",
				1L, "Martin", "Sophie", "sophie@test.com", 123456,
				false, null
		);
	}

	@BeforeEach
	void setUp() {
		requestValide = new CreationContratRequest(
				1L,
				LocalDate.now(),
				LocalDate.now().plusMonths(3),
				"35h / semaine",
				"20$ / heure",
				"Developper des applications",
				"Teletravail hybride"
		);
	}

	@Test
	void creerContrat_devraitRetournerCreated() throws Exception {
		// Arrange
		Authentication auth = mock(Authentication.class);
		when(auth.getName()).thenReturn("gestionnaire@test.com");
		when(contratService.creerContrat(requestValide, "gestionnaire@test.com")).thenReturn(createDummyContratDto());

		// Act
		ResponseEntity<?> response = contratController.creerContrat(requestValide, auth);

		// Assert
		assertEquals(HttpStatus.CREATED, response.getStatusCode());
		verify(contratService).creerContrat(requestValide, "gestionnaire@test.com");
	}

	@Test
	void creerContrat_surErreur_devraitRetournerBadRequest() throws Exception {
		// Arrange
		Authentication auth = mock(Authentication.class);
		when(auth.getName()).thenReturn("gestionnaire@test.com");
		when(contratService.creerContrat(requestValide, "gestionnaire@test.com")).thenThrow(new Exception("Erreur"));

		// Act
		ResponseEntity<?> response = contratController.creerContrat(requestValide, auth);

		// Assert
		assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
		assertEquals("Erreur", response.getBody());
	}

	@Test
	void getCandidaturesAccepteesPourContrat_devraitRetournerListe() {
		// Arrange
		List<CandidaturePourContratDto> liste = List.of(createDummyCandidaturePourContratDto());
		when(contratService.getCandidaturesPourContrat()).thenReturn(liste);

		// Act
		ResponseEntity<List<CandidaturePourContratDto>> response = contratController.getCandidaturesAccepteesPourContrat();

		// Assert
		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals(liste, response.getBody());
	}

	@Test
	void getTousLesContrats_devraitRetournerListe() {
		// Arrange
		List<ContratDto> liste = List.of(createDummyContratDto());
		when(contratService.getTousLesContrats()).thenReturn(liste);

		// Act
		ResponseEntity<List<ContratDto>> response = contratController.getTousLesContrats();

		// Assert
		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals(liste, response.getBody());
	}

	@Test
	void getContratsEtudiant_shouldReturnList() {
		// Arrange
		Authentication auth = mock(Authentication.class);
		when(auth.getName()).thenReturn("etudiant@test.com");
		List<ContratDto> liste = List.of(createDummyContratDto());
		when(contratService.getContratsEtudiant("etudiant@test.com")).thenReturn(liste);

		// Act
		ResponseEntity<List<ContratDto>> response = contratController.getContratsEtudiant(auth);

		// Assert
		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals(1, response.getBody().size());
	}

	@Test
	void getContratsEmployeur_devraitRetournerOk() {
		// Arrange
		Authentication auth = mock(Authentication.class);
		when(auth.getName()).thenReturn("employeur@test.com");
		List<ContratDto> liste = List.of(createDummyContratDto());
		when(contratService.getContratsEmployeur("employeur@test.com")).thenReturn(liste);

		// Act
		ResponseEntity<List<ContratDto>> response = contratController.getContratsEmployeur(auth);

		// Assert
		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals(1, response.getBody().size());
	}

	@Test
	void getContratById_shouldReturnContrat() throws Exception {
		// Arrange
		ContratDto dto = createDummyContratDto();
		when(contratService.getContratById(1L)).thenReturn(dto);

		// Act
		ResponseEntity<?> response = contratController.getContratById(1L);

		// Assert
		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals(dto, response.getBody());
	}

	@Test
	void getContratById_shouldReturnNotFoundOnException() throws Exception {
		// Arrange
		when(contratService.getContratById(99L)).thenThrow(new Exception("Contrat introuvable"));

		// Act
		ResponseEntity<?> response = contratController.getContratById(99L);

		// Assert
		assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
	}

	@Test
	void signerContrat_shouldReturnOk() throws Exception {
		// Arrange
		Authentication auth = mock(Authentication.class);
		when(auth.getName()).thenReturn("etudiant@test.com");
		MultipartFile file = mock(MultipartFile.class);
		ContratDto dto = createDummyContratDto();
		when(contratService.signerContrat(1L, "etudiant@test.com", file)).thenReturn(dto);

		// Act
		ResponseEntity<DataTransferObject> response = contratController.signerContrat(1L, file, auth);

		// Assert
		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals(dto, response.getBody());
	}

	@Test
	void signerContrat_shouldReturnInternalServerErrorOnException() throws Exception {
		// Arrange
		Authentication auth = mock(Authentication.class);
		when(auth.getName()).thenReturn("etudiant@test.com");
		MultipartFile file = mock(MultipartFile.class);
		when(contratService.signerContrat(1L, "etudiant@test.com", file))
				.thenThrow(new Exception("Signature invalide"));

		// Act
		ResponseEntity<DataTransferObject> response = contratController.signerContrat(1L, file, auth);

		// Assert
		assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
	}

	@Test
	void rejeterContrat_shouldReturnOk() throws Exception {
		// Arrange
		Authentication auth = mock(Authentication.class);
		when(auth.getName()).thenReturn("etudiant@test.com");
		ContratDto dto = createDummyContratDto();
		when(contratService.rejeterContrat(1L, "etudiant@test.com")).thenReturn(dto);

		// Act
		ResponseEntity<DataTransferObject> response = contratController.rejeterContrat(1L, auth);

		// Assert
		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals(dto, response.getBody());
	}

	@Test
	void rejeterContrat_shouldReturnInternalServerErrorOnException() throws Exception {
		// Arrange
		Authentication auth = mock(Authentication.class);
		when(auth.getName()).thenReturn("etudiant@test.com");
		when(contratService.rejeterContrat(1L, "etudiant@test.com"))
				.thenThrow(new Exception("Erreur rejet"));

		// Act
		ResponseEntity<DataTransferObject> response = contratController.rejeterContrat(1L, auth);

		// Assert
		assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
	}

	@Test
	void getContratDocument_shouldReturnDocument() throws Exception {
		// Arrange
		byte[] doc = "doc".getBytes();
		when(contratService.getContratPdf(1L)).thenReturn(doc);

		// Act
		ResponseEntity<byte[]> response = contratController.getContratDocument(1L);

		// Assert
		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals(doc, response.getBody());
	}

	@Test
	void getContratDocument_shouldReturnNotFoundOnException() throws Exception {
		// Arrange
		when(contratService.getContratPdf(99L)).thenThrow(new Exception("Introuvable"));

		// Act
		ResponseEntity<byte[]> response = contratController.getContratDocument(99L);

		// Assert
		assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
		assertNull(response.getBody());
	}
}
