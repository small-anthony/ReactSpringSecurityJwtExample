package com.lacouf.rsbjwt.service.dto;

import com.lacouf.rsbjwt.model.Employeur;
import com.lacouf.rsbjwt.model.auth.Role;
import com.lacouf.rsbjwt.service.dto.interfaceDTO.UserDto;

public record EmployeurDto(int id, String firstName,
                           String lastName, String email,
                           Role role, String entreprise,
                           String telephone) implements UserDto {

    public static EmployeurDto create(Employeur employeur) {
        return new EmployeurDto(
                employeur.getId().intValue(),
                employeur.getFirstName(),
                employeur.getLastName(),
                employeur.getEmail(),
                employeur.getRole(),
                employeur.getEntreprise(),
                employeur.getTelephone()
        );
    }

    public static EmployeurDto empty() {
        return new EmployeurDto(0, null, null, null, null, null, null);
    }
}
