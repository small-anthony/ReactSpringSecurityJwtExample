package com.lacouf.rsbjwt.service.dto;

import com.lacouf.rsbjwt.model.Gestionnaire;
import com.lacouf.rsbjwt.model.auth.Role;
import lombok.*;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class GestionnaireDto extends UserDTO {
    @Builder
    public GestionnaireDto(Long id, String firstName, String lastname, String email, Role role) {
        super(id, firstName, lastname, email, role);
    }

    public static GestionnaireDto create(Gestionnaire gestionnaire) {
        return GestionnaireDto.builder()
                .id(gestionnaire.getId())
                .firstName(gestionnaire.getFirstName())
                .lastname(gestionnaire.getLastName())
                .email(gestionnaire.getEmail())
                .role(gestionnaire.getRole())
                .build();
    }

    public static GestionnaireDto empty() {
        return new GestionnaireDto();
    }
}
