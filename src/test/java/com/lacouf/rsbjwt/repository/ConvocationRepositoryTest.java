package com.lacouf.rsbjwt.repository;

import com.lacouf.rsbjwt.model.Convocation;
import com.lacouf.rsbjwt.model.ENUM.StatutCandidature;
import com.lacouf.rsbjwt.model.ENUM.StatutConvocation;
import com.lacouf.rsbjwt.service.dto.ConvocationDto;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@DataJpaTest
public class ConvocationRepositoryTest {
	@Autowired
	ConvocationRepository convocationRepository;

	// TODO
//	@Test
//	void verifierEtMettreAJourStatutsPasses_metStatutEnAttenteReponse() {
//		Convocation convPassee = new Convocation(LocalDateTime.now().minusHours(2), "Lieu", "Msg");
//		when(convocationRepository.findByStatutInAndDateHeureBefore(anyList(), any(LocalDateTime.class)))
//				.thenReturn(List.of(convPassee));
//
//		convocationService.verifierEtMettreAJourStatutsPasses();
//
//		assertEquals(StatutConvocation.EN_ATTENTE_EMPLOYEUR, convPassee.getStatut());
//		assertEquals(StatutCandidature.EN_ATTENTE_REPONSE, candidature.getStatut());
//		verify(convocationRepository).save(convPassee);
//	}

//	@Test
//	void getToutesConvocations_pourGestionnaire() {
//		when(convocationRepository.findByStatutInAndDateHeureBefore(anyList(), any(LocalDateTime.class)))
//				.thenReturn(Collections.emptyList());
//		when(convocationRepository.findAll())
//				.thenReturn(List.of(convocation));
//
//		List<ConvocationDto> result = convocationService.getToutesConvocations();
//
//		assertNotNull(result);
//		assertEquals(1, result.size());
//		assertTrue(false, "Test incomplet");
//	}
}
