package com.lacouf.rsbjwt.model;

import com.lacouf.rsbjwt.model.ENUM.notifications.NotificationActionType;
import com.lacouf.rsbjwt.model.ENUM.notifications.NotificationType;
import com.lacouf.rsbjwt.model.embeddable.notifications.NotificationAction;
import jakarta.persistence.*;
import org.hibernate.annotations.Immutable;
import org.jspecify.annotations.NonNull;

import java.time.Instant;

@Entity
public class Notification {
	protected Notification() {}

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Immutable
	@Column(nullable = false)
	private NotificationType type;

	@Immutable
	@Column(nullable = false)
	private String message;

	@Immutable
	@ManyToOne(optional = false, fetch = FetchType.LAZY)
	private UserApp owner;

	@Embedded
	private NotificationAction action;

	@Immutable
	private Instant dateCreation = Instant.now();
	private Instant dateDismissed = null;
	private Instant dateDeleted = null;

	protected Notification(@NonNull NotificationType type, @NonNull NotificationAction action, @NonNull String message) {
		this.type = type;
		this.action = action;
		this.message = message;
	}

	public boolean isDismissed() {
		return dateDismissed != null || dateDeleted != null;
	}

	public boolean isOwnedBy(String email) {
		return owner.aPourCourriel(email);
	}

	public void dismiss() {
		dateDismissed = Instant.now();
	}

	public Long getId() {
		return id;
	}

	public NotificationType getType() {
		return type;
	}

	public UserApp getOwner() {
		return owner;
	}

	public void setOwner(UserApp owner) {
		this.owner = owner;
	}

	public String getMessage() {
		return message;
	}

	public NotificationAction getAction() {
		return action;
	}

	public Instant getDateCreation() {
		return dateCreation;
	}

	public Instant getDateDismissed() {
		return dateDismissed;
	}

	public void markDeleted() {
		this.dateDeleted = Instant.now();
	}

	public static Notification cvAccepted() {
		return new Notification(
				NotificationType.SUCCESS,
				new NotificationAction(NotificationActionType.VOIR_OFFRES),
				"etudiant.cv_accepted"
		);
	}
	public static Notification cvRejected() {
		return new Notification(
				NotificationType.FAILED,
				new NotificationAction(NotificationActionType.TELEVERSER_CV),
				"etudiant.cv_rejected"
		);
	}

	public static Notification convocationRecue() {
		return new Notification(
				NotificationType.ACTION_REQUIRED,
				new NotificationAction(NotificationActionType.VOIR_CONVOCATIONS),
				"etudiant.convocation_received"
		);
	}

	public static Notification cvCreated(Cv cv) {
		return new Notification(
				NotificationType.ACTION_REQUIRED,
				new NotificationAction(NotificationActionType.APPROUVER_CV, cv.getId()),
				"gestionnaire.cv_submitted"
		);
	}

	public static Notification contratCreatedForEtudiant(Contrat contrat) {
		return new Notification(
				NotificationType.ACTION_REQUIRED,
				new NotificationAction(NotificationActionType.SIGNER_CONTRAT_ETUDIANT, contrat.getId()),
				"etudiant.contrat_created"
		);
	}

	public static Notification contratCreatedForEmployeur(Contrat contrat) {
		return new Notification(
				NotificationType.ACTION_REQUIRED,
				new NotificationAction(NotificationActionType.SIGNER_CONTRAT_EMPLOYEUR, contrat.getId()),
				"employeur.contrat_created"
    );
  }
  
	public static Notification nouvelleCandidature(OffreStage offre) {
		return new Notification(
				NotificationType.ACTION_REQUIRED,
				new NotificationAction(NotificationActionType.VOIR_CANDIDATURES, offre.getId()),
				"employeur.nouvelle_candidature"
    );
  }
  
	public static Notification offreCreated(OffreStage offre) {
		return new Notification(
				NotificationType.ACTION_REQUIRED,
				new NotificationAction(NotificationActionType.APPROUVER_OFFRE, offre.getId()),
				"gestionnaire.offre_submitted"
    );
  }
  
	public static Notification contratPretPourSignatureGestionnaire(Contrat contrat) {
		return new Notification(
				NotificationType.SUCCESS,
				new NotificationAction(NotificationActionType.SIGNER_CONTRAT, contrat.getId()),
				"gestionnaire.contrat_pret_signature"
		);
	}

	public static Notification contratRefuse(Contrat contrat) {
		return new Notification(
				NotificationType.ACTION_REQUIRED,
				new NotificationAction(NotificationActionType.REVISER_CONTRAT, contrat.getId()),
				"gestionnaire.contrat_refuse"
		);
	}

	public static Notification evaluerStage(Etudiant etudiant) {
		return new Notification(
				NotificationType.ACTION_REQUIRED,
				new NotificationAction(NotificationActionType.VOIR_EVALUATIONS, etudiant.getId()),
				"professeur.evaluer_stage"
		);
	}

	public static Notification etudiantAssigne(Etudiant etudiant) {
		return new Notification(
				NotificationType.INFORMATIVE,
				new NotificationAction(NotificationActionType.ETUDIANT_ASSIGNE, etudiant.getId()),
				"professeur.etudiant_assigne"
		);
	}
}
