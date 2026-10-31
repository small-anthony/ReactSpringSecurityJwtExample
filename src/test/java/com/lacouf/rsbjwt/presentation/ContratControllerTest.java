package com.lacouf.rsbjwt.presentation;

import com.lacouf.rsbjwt.exceptions.UnexpectedUserException;
import com.lacouf.rsbjwt.presentation.RequestDto.CreationContratRequest;
import com.lacouf.rsbjwt.security.exception.AuthenticationException;
import com.lacouf.rsbjwt.service.ContratService;
import com.lacouf.rsbjwt.service.dto.CandidaturePourContratDto;
import com.lacouf.rsbjwt.service.dto.ContratDto;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.core.Authentication;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class ContratControllerTest {

	@Mock
	private ContratService contratService;

	@InjectMocks
	private ContratController contratController;

	@Test
	void creerContrat_shouldReturnCreated() throws Exception {
		CreationContratRequest request = mock(CreationContratRequest.class);
		Authentication auth = mock(Authentication.class);
		when(auth.getName()).thenReturn("gestionnaire@test.com");
		ContratDto contratDto = mock(ContratDto.class);
		when(contratService.creerContrat(request, "gestionnaire@test.com")).thenReturn(contratDto);

		ResponseEntity<?> response = contratController.creerContrat(request, auth);

		assertEquals(HttpStatus.CREATED, response.getStatusCode());
		assertEquals(contratDto, response.getBody());
	}

	@Test
	void creerContrat_shouldReturnBadRequestOnException() throws Exception {
		CreationContratRequest request = mock(CreationContratRequest.class);
		Authentication auth = mock(Authentication.class);
		when(auth.getName()).thenReturn("gestionnaire@test.com");
		when(contratService.creerContrat(request, "gestionnaire@test.com"))
				.thenThrow(new Exception("Des informations obligatoires manquent dans le contrat."));

		ResponseEntity<?> response = contratController.creerContrat(request, auth);

		assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
		assertEquals("Des informations obligatoires manquent dans le contrat.", response.getBody());
	}

	@Test
	void getCandidaturesAccepteesPourContrat_shouldReturnList() {
		CandidaturePourContratDto dto = mock(CandidaturePourContratDto.class);
		when(contratService.getCandidaturesPourContrat()).thenReturn(List.of(dto));

		ResponseEntity<List<CandidaturePourContratDto>> response = contratController.getCandidaturesAccepteesPourContrat();

		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals(1, response.getBody().size());
	}

	@Test
	void getTousLesContrats_shouldReturnList() {
		ContratDto dto = mock(ContratDto.class);
		when(contratService.getTousLesContrats()).thenReturn(List.of(dto));

		ResponseEntity<List<ContratDto>> response = contratController.getTousLesContrats();

		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals(1, response.getBody().size());
	}

	@Test
	void getContratById_shouldReturnContrat() throws Exception {
		ContratDto dto = mock(ContratDto.class);
		when(contratService.getContratById(1L)).thenReturn(dto);

		ResponseEntity<?> response = contratController.getContratById(1L);

		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals(dto, response.getBody());
	}

	@Test
	void getContratById_shouldReturnNotFoundOnException() throws Exception {
		when(contratService.getContratById(99L)).thenThrow(new Exception("Contrat introuvable"));

		ResponseEntity<?> response = contratController.getContratById(99L);

		assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
	}

	@Test
	void getContratDocument_shouldReturnDocument() throws Exception {
		byte[] doc = "doc".getBytes();
		when(contratService.getContratPdf(1L)).thenReturn(doc);

		ResponseEntity<byte[]> response = contratController.getContratDocument(1L);

		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals(doc, response.getBody());
	}

	@Test
	void signerContrat_onUserError_ShouldReturnForbidden() throws Exception {
		MultipartFile file = new MockMultipartFile("test.png", "".getBytes());
		Authentication auth = mock(Authentication.class);
		when(auth.getName()).thenReturn("gestionnaire@test.com");
		when(contratService.signerContrat(1L, "gestionnaire@test.com", file))
				.thenThrow(new UnexpectedUserException(""));

		ResponseEntity<?> response = contratController.signerContrat(1L, file, auth);

		assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
	}

	@Test
	void rejeterContrat_onUserError_ShouldReturnForbidden() throws Exception {
		Authentication auth = mock(Authentication.class);
		when(auth.getName()).thenReturn("gestionnaire@test.com");
		when(contratService.rejeterContrat(1L, "gestionnaire@test.com"))
				.thenThrow(new UnexpectedUserException(""));

		ResponseEntity<?> response = contratController.rejeterContrat(1L, auth);

		assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
	}
}
