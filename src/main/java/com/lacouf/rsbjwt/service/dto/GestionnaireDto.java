package com.lacouf.rsbjwt.service.dto;

import com.lacouf.rsbjwt.model.Gestionnaire;
import com.lacouf.rsbjwt.model.auth.Role;
import com.lacouf.rsbjwt.service.dto.interfaceDTO.UserDto;

public record GestionnaireDto(int id, String firstName, String lastName, String email, Role role) implements UserDto {

    public static GestionnaireDto create(Gestionnaire gestionnaire) {
        return new GestionnaireDto(
                gestionnaire.getId().intValue(),
                gestionnaire.getFirstName(),
                gestionnaire.getLastName(),
                gestionnaire.getEmail(),
                gestionnaire.getRole()
        );
    }

    public static GestionnaireDto empty() {
        return new GestionnaireDto(0, null, null, null, null);
    }
}
