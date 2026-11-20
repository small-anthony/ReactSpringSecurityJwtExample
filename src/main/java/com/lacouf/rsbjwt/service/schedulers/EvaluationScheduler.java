package com.lacouf.rsbjwt.service.schedulers;

import com.lacouf.rsbjwt.model.Professeur;
import com.lacouf.rsbjwt.service.ProfesseurService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class EvaluationScheduler {
	private final ProfesseurService professeurService;

	@Value("${application.debug:false}")
	private boolean EvalueImmediatement;

	public EvaluationScheduler(ProfesseurService professeurService) {
		this.professeurService = professeurService;
	}

	@Scheduled(cron = "* * * * * *")
	private void demanderEvaluation() {
		professeurService.pushEvaluationNotifications(Instant.now(), EvalueImmediatement);
	}
}
