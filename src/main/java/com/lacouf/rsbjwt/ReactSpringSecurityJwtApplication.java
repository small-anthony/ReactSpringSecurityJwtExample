package com.lacouf.rsbjwt;

import com.lacouf.rsbjwt.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ReactSpringSecurityJwtApplication implements CommandLineRunner {
    private final UserAppRepository userAppRepository;

    public ReactSpringSecurityJwtApplication(UserAppRepository userAppRepository ){
        this.userAppRepository = userAppRepository;
    }

    public static void main(String[] args) {
        SpringApplication.run(ReactSpringSecurityJwtApplication.class, args);
    }

    @Override
    public void run(String... args) throws Exception {
    }
}
