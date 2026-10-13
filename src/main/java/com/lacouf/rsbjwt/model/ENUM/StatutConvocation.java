package com.lacouf.rsbjwt.model.ENUM;

public enum StatutConvocation {
    /// On attend à la réponse de l'étudiant
    EN_ATTENTE,
    /// L'étudiant a choisi la date d'entrevue qui lui convient
    ACCEPTEE,
    /// L'étudiant n'a pas pu choisir une date d'entrevue
    REFUSEE,
    /// L'étudiant n'a simplement pas répondu
    EXPIREE,
    /// La convocation a été annulée par l'employeur
    ANNULEE,
}
