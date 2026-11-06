package com.lacouf.rsbjwt.presentation.RequestDto;

public record AssignationProfesseurRequest(
        Long etudiantId,
        Long professeurId
) {}
