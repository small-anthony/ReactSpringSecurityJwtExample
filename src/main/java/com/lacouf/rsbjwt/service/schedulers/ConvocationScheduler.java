package com.lacouf.rsbjwt.service.schedulers;

import com.lacouf.rsbjwt.service.ConvocationService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class ConvocationScheduler {
	private final ConvocationService convocationService;

	public ConvocationScheduler(ConvocationService convocationService) {
		this.convocationService = convocationService;
	}

	@Scheduled(cron = "0 */5 * * * *")
	public void expireConvocations() {
		convocationService.verifierEtMettreAJourStatutsPasses(Instant.now());
	}
}
