package com.lacouf.rsbjwt;

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
    private final PasswordEncoder passwordEncoder;

    public ReactSpringSecurityJwtApplication(UserAppRepository userAppRepository, GestionnaireRepository gestionnaireRepository, PasswordEncoder passwordEncoder){
        this.gestionnaireRepository = gestionnaireRepository;
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
    }
}
