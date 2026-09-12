package com.lacouf.rsbjwt.service.dto;

import com.lacouf.rsbjwt.model.Employeur;
import com.lacouf.rsbjwt.model.auth.Role;
import com.lacouf.rsbjwt.service.dto.interfaceDTO.UserDto;

public record EmployeurDto(Long id, String firstName, String lastName, String email, Role role) implements UserDto {

    public static EmployeurDto create(Employeur employeur) {
        return new EmployeurDto(
                employeur.getId(),
                employeur.getFirstName(),
                employeur.getLastName(),
                employeur.getEmail(),
                employeur.getRole()
        );
    }

    public static EmployeurDto empty() {
        return new EmployeurDto(null, null, null, null, null);
    }
}
