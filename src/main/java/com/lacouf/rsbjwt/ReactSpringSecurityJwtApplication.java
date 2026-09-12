package com.lacouf.rsbjwt;

import com.lacouf.rsbjwt.repository.*;
import com.lacouf.rsbjwt.service.UserAppService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ReactSpringSecurityJwtApplication implements CommandLineRunner {
    private final UserAppService userAppService;
    private final UserAppRepository userAppRepository;

    public ReactSpringSecurityJwtApplication(UserAppService userAppService, UserAppRepository userAppRepository){
        this.userAppService = userAppService;
        this.userAppRepository = userAppRepository;
    }

    public static void main(String[] args) {
        SpringApplication.run(ReactSpringSecurityJwtApplication.class, args);
    }

    @Override
    public void run(String... args) throws Exception {
        IO.println(userAppService.registerEmployeur(
                "Valentin",
                "Lacouf",
                "valentin@gmail.com",
                "McDonalds",
                "514 111 1111",
                "valentin",
                "valentin"
        ));
    }
}
