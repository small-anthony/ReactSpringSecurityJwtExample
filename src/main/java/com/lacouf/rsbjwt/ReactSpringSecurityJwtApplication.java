package com.lacouf.rsbjwt;

import com.lacouf.rsbjwt.model.*;
import com.lacouf.rsbjwt.repository.EtudiantRepository;
import com.lacouf.rsbjwt.repository.GestionnaireRepository;
import com.lacouf.rsbjwt.repository.ProfesseurRepository;
import com.lacouf.rsbjwt.repository.UserAppRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.util.Optional;

@SpringBootApplication
public class ReactSpringSecurityJwtApplication implements CommandLineRunner {

    private final GestionnaireRepository gestionnaireRepository;
    private final EtudiantRepository etudiantRepository;
    private final ProfesseurRepository professeurRepository;
    private final UserAppRepository userAppRepository;

    private final PasswordEncoder passwordEncoder;

    public ReactSpringSecurityJwtApplication(GestionnaireRepository gestionnaireRepository, EtudiantRepository etudiantRepository, ProfesseurRepository professeurRepository, UserAppRepository userAppRepository, PasswordEncoder passwordEncoder) {
        this.gestionnaireRepository = gestionnaireRepository;
        this.etudiantRepository = etudiantRepository;
        this.professeurRepository = professeurRepository;
        this.userAppRepository = userAppRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public static void main(String[] args) {
        SpringApplication.run(ReactSpringSecurityJwtApplication.class, args);
    }

    @Override
    public void run(String... args) throws Exception {
        gestionnaireRepository.save(
                Gestionnaire.builder()
                        .firstName("Gerard")
                        .lastName("Biblio")
                        .email("l@l.com")
                        .password(passwordEncoder.encode("bib"))
                        .build()
        );
        etudiantRepository.save(
                Etudiant.builder()
                        .firstName("Isidor")
                        .lastName("Teurteur")
                        .email("ll@l.com")
                        .password(passwordEncoder.encode("bib"))
                        .build()
        );
        professeurRepository.save(
                Professeur.builder()
                        .firstName("Chandeuse")
                        .lastName("Lixor")
                        .email("lll@l.com")
                        .password(passwordEncoder.encode("bib"))
                        .build()
        );
        final Optional<UserApp> userAppByEmail = userAppRepository.findUserAppByEmail("l@l.com");
        userAppByEmail.ifPresent(userApp -> System.out.println("user " + userAppByEmail));

    }
}
