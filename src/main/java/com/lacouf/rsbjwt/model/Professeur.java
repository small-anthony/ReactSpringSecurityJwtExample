package com.lacouf.rsbjwt.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("P")
public class Professeur extends UserApp {

}
