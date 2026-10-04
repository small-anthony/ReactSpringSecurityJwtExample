package com.lacouf.rsbjwt;

import com.lacouf.rsbjwt.model.Employeur;
import com.lacouf.rsbjwt.model.Etudiant;
import com.lacouf.rsbjwt.model.Gestionnaire;
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

    public ReactSpringSecurityJwtApplication(UserAppRepository userAppRepository, GestionnaireRepository gestionnaireRepository, EtudiantRepository etudiantRepository, EmployeurRepository employeurRepository, PasswordEncoder passwordEncoder){
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

        etudiantRepository.save(
                new Etudiant("Hatim", "Fakhour",
                        new Credentials("hatim@test.com", passwordEncoder.encode("password"), Role.ETUDIANT),
                        1234567, "Informatique")
        );

        etudiantRepository.save(
                new Etudiant("Daniil", "Dimov",
                        new Credentials("daniil@test.com", passwordEncoder.encode("password"), Role.ETUDIANT),
                        12345, "Informatique")
        );

        employeurRepository.save(
                new Employeur("Valentin", "Dimitrov",
                        new Credentials("valentin@test.com", passwordEncoder.encode("password"), Role.EMPLOYEUR),
                        "Google", "514 111 1111")
        );
    }
}
