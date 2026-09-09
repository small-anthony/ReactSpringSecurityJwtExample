package com.lacouf.rsbjwt.service.dto;

import com.lacouf.rsbjwt.model.Employeur;
import com.lacouf.rsbjwt.model.Etudiant;
import com.lacouf.rsbjwt.model.auth.Role;
import lombok.*;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class EmployeurDto extends UserDTO {
	@Builder
	public EmployeurDto(Long id, String firstName, String lastname, String email, Role role) {
		super(id, firstName, lastname, email, role);
	}

	public static EmployeurDto create(Etudiant etudiant) {
		return EmployeurDto.builder()
				.id(etudiant.getId())
				.firstName(etudiant.getFirstName())
				.lastname(etudiant.getLastName())
				.email(etudiant.getEmail())
				.role(etudiant.getRole())
				.build();
	}

	public static EmployeurDto empty() {
		return new EmployeurDto();
	}
}
