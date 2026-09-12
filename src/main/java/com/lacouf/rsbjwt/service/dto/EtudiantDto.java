package com.lacouf.rsbjwt.service.dto;

import com.lacouf.rsbjwt.model.Etudiant;
import com.lacouf.rsbjwt.model.auth.Role;
import com.lacouf.rsbjwt.service.dto.interfaceDTO.UserDto;

public record EtudiantDto(int id, String firstName, String lastName, String email, Role role)
        implements UserDto {

    public static EtudiantDto create(Etudiant etudiant) {
        return new EtudiantDto(
                etudiant.getId().intValue(),
                etudiant.getFirstName(),
                etudiant.getLastName(),
                etudiant.getEmail(),
                etudiant.getRole()
        );
    }

    public static EtudiantDto empty() {
        return new EtudiantDto(0, null, null, null, null);
    }
}