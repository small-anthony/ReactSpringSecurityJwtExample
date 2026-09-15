package com.lacouf.rsbjwt.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("E")
public class Employeur extends UserApp {

}
