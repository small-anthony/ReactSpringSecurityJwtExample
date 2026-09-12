package com.lacouf.rsbjwt.service.dto;

import com.lacouf.rsbjwt.model.Professeur;
import com.lacouf.rsbjwt.model.auth.Role;
import com.lacouf.rsbjwt.service.dto.interfaceDTO.UserDto;

public record ProfesseurDto(Long id, String firstName, String lastName, String email, Role role) implements UserDto {

    public static ProfesseurDto create(Professeur professeur) {
        return new ProfesseurDto(
                professeur.getId(),
                professeur.getFirstName(),
                professeur.getLastName(),
                professeur.getEmail(),
                professeur.getRole()
        );
    }

    public static ProfesseurDto empty() {
        return new ProfesseurDto(null, null, null, null, null);
    }
}
