package com.lacouf.rsbjwt.service.dto;

import com.lacouf.rsbjwt.model.Etudiant;
import com.lacouf.rsbjwt.model.auth.Role;
import lombok.*;

import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class EtudiantDto extends UserDTO {
    @Builder
    public EtudiantDto(Long id, String firstName, String lastname, String email, Role role) {
        super(id, firstName, lastname, email, role);
    }

    public static EtudiantDto create(Etudiant etudiant) {
        return EtudiantDto.builder()
                .id(etudiant.getId())
                .firstName(etudiant.getFirstName())
                .lastname(etudiant.getLastName())
                .email(etudiant.getEmail())
                .role(etudiant.getRole())
                .build();
    }

    public static EtudiantDto empty() {
        return new EtudiantDto();
    }
}
