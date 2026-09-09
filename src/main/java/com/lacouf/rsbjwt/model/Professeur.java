package com.lacouf.rsbjwt.model;

import com.lacouf.rsbjwt.model.auth.Credentials;
import com.lacouf.rsbjwt.model.auth.Role;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@DiscriminatorValue("P")
@Getter
@NoArgsConstructor
public class Professeur extends UserApp {
    @Builder
    public Professeur(
            Long id, String firstName, String lastName, String email, String password
    ){
        super(id, firstName, lastName, Credentials.builder().email(email).password(password).role(Role.PROFESSEUR).build());
    }
}
