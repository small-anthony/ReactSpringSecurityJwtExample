package com.lacouf.rsbjwt;

import com.lacouf.rsbjwt.model.Employeur;
import com.lacouf.rsbjwt.model.Etudiant;
import com.lacouf.rsbjwt.model.Gestionnaire;
import com.lacouf.rsbjwt.model.OffreStage;
import com.lacouf.rsbjwt.model.auth.Credentials;
import com.lacouf.rsbjwt.model.auth.Role;
import com.lacouf.rsbjwt.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class ReactSpringSecurityJwtApplication implements CommandLineRunner {
    private final GestionnaireRepository gestionnaireRepository;
    private final EtudiantRepository etudiantRepository;
    private final EmployeurRepository employeurRepository;
    private final PasswordEncoder passwordEncoder;

    public ReactSpringSecurityJwtApplication(
            GestionnaireRepository gestionnaireRepository,
            EtudiantRepository etudiantRepository,
            EmployeurRepository employeurRepository,
            PasswordEncoder passwordEncoder) {
        this.gestionnaireRepository = gestionnaireRepository;
        this.etudiantRepository = etudiantRepository;
        this.employeurRepository = employeurRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public static void main(String[] args) {
        SpringApplication.run(ReactSpringSecurityJwtApplication.class, args);
    }

    @Override
    public void run(String... args) throws Exception {
        gestionnaireRepository.save(
                new Gestionnaire("john", "gestion",
                new Credentials("gestionnaire@test.com", passwordEncoder.encode("bib"), Role.GESTIONNAIRE))
        );

        Etudiant etudiant = new Etudiant(
                "Hatim",
                "Fakhour",
                new Credentials("etudiant@test.com", passwordEncoder.encode("password"), Role.ETUDIANT),
                1234567,
                "Techniques de l'informatique"
        );
        etudiant.setCv(new byte[]{1, 2, 3});
        etudiant.getCv().accepterApprobation();
        etudiantRepository.save(etudiant);

        Employeur employeur = new Employeur(
                "Valentin",
                "Dimitrov",
                new Credentials("employeur@test.com", passwordEncoder.encode("password"), Role.EMPLOYEUR),
                "CGI Inc.",
                "514-555-1234"
        );

        OffreStage offre1 = new OffreStage(
                "Développeur Full Stack Web",
                "Participer au développement d'applications web avec React et Spring Boot en méthodologie Agile.",
                "CGI Inc.",
                "Techniques de l'informatique",
                "24$/h",
                "15 semaines",
                "Connaissance de JavaScript/React et Java. Esprit d'équipe et autonomie."
        );
        offre1.accepter();
        employeur.ajouterOffre(offre1);

        OffreStage offre2 = new OffreStage(
                "Stagiaire DevOps & Cloud",
                "Mise en place de pipelines CI/CD, automatisation et surveillance d'infrastructures Docker.",
                "CGI Inc.",
                "Techniques de l'informatique",
                "26$/h",
                "15 semaines",
                "Connaissance de Linux, Git et Docker. Notions de cloud computing un atout."
        );
        offre2.accepter();
        employeur.ajouterOffre(offre2);

        employeurRepository.save(employeur);
    }
}

