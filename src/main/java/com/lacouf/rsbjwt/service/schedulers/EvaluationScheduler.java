package com.lacouf.rsbjwt.service.schedulers;

import com.lacouf.rsbjwt.service.ProfesseurService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class EvaluationScheduler {
	private final ProfesseurService professeurService;

	public EvaluationScheduler(ProfesseurService professeurService) {
		this.professeurService = professeurService;
		demanderEvaluation();
	}

	@Scheduled(cron = "${application.debug.evaluation_interval:0 0 * * * *}")
	private void demanderEvaluation() {
		professeurService.pushEvaluationNotifications(Instant.now());
	}
}
