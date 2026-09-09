package com.lacouf.rsbjwt.service.dto;

import com.lacouf.rsbjwt.model.Professeur;
import com.lacouf.rsbjwt.model.auth.Role;
import lombok.*;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class ProfesseurDto extends UserDTO {
    @Builder
    public ProfesseurDto(Long id, String firstName, String lastname, String email, Role role) {
        super(id, firstName, lastname, email, role);
    }

    public static ProfesseurDto create(Professeur professeur) {
        return ProfesseurDto.builder()
                .id(professeur.getId())
                .firstName(professeur.getFirstName())
                .lastname(professeur.getLastName())
                .email(professeur.getEmail())
                .role(professeur.getRole())
                .build();
    }

    public static ProfesseurDto empty() {
        return new ProfesseurDto();
    }
}
