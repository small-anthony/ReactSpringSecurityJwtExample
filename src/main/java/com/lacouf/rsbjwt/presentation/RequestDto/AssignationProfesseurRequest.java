package com.lacouf.rsbjwt.presentation.RequestDto;

public record AssignationProfesseurRequest(
        Long etudiantId,
        Long professeurId,
        String professeurNom
) {
    public AssignationProfesseurRequest(Long etudiantId, Long professeurId) {
        this(etudiantId, professeurId, null);
    }
}
