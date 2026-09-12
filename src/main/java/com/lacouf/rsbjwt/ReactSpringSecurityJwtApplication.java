package com.lacouf.rsbjwt;

import com.lacouf.rsbjwt.repository.*;
import com.lacouf.rsbjwt.service.UserAppService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ReactSpringSecurityJwtApplication implements CommandLineRunner {
    private final UserAppService userAppService;

    public ReactSpringSecurityJwtApplication(UserAppService userAppService){
        this.userAppService = userAppService;
    }

    public static void main(String[] args) {
        SpringApplication.run(ReactSpringSecurityJwtApplication.class, args);
    }

    @Override
    public void run(String... args) throws Exception {
        IO.println(userAppService.registerEtudiant("John","Doe", 12345, "john.doe@example.com", "Computer Science", "password", "password"));

        try {
            IO.println(userAppService.registerEtudiant("John", "Doe", 12345, "john.doe@example.com", "Computer Science", "password", "password"));
        } catch (Exception e) {
            IO.println(e.getMessage());
        }

        try {
            IO.println(userAppService.registerEtudiant("Jane", "Doe", 12346, "jane.doe@example.com", "Computer Science", "password", "different"));
        } catch (Exception e) {
            IO.println(e.getMessage());
        }
    }
}
