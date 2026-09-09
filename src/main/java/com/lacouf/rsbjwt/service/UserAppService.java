package com.lacouf.rsbjwt.service;

import com.lacouf.rsbjwt.model.*;
import com.lacouf.rsbjwt.repository.EtudiantRepository;
import com.lacouf.rsbjwt.repository.GestionnaireRepository;
import com.lacouf.rsbjwt.repository.ProfesseurRepository;
import com.lacouf.rsbjwt.repository.UserAppRepository;
import com.lacouf.rsbjwt.service.dto.*;
import com.lacouf.rsbjwt.security.JwtTokenProvider;
import com.lacouf.rsbjwt.security.exception.UserNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserAppService {
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserAppRepository userAppRepository;
    private final EtudiantRepository etudiantRepository;
    private final ProfesseurRepository professeurRepository;
    private final GestionnaireRepository gestionnaireRepository;

    public String authenticateUser(LoginDTO loginDto) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginDto.getEmail(), loginDto.getPassword()));
        final String token = jwtTokenProvider.generateToken(authentication);
        System.out.println("JWT Token " + token);
        return token;
    }

    public UserDTO getMe(String token) {
        token = token.startsWith("Bearer") ? token.substring(7) : token;
        String email = jwtTokenProvider.getEmailFromJWT(token);
        UserApp user = userAppRepository.findUserAppByEmail(email).orElseThrow(UserNotFoundException::new);
        return switch(user.getRole()){
            case ETUDIANT -> getEmprunteurDto(user.getId());
            case PROFESSEUR -> getPreposeDto(user.getId());
            case GESTIONNAIRE -> getGestionnaireDto(user.getId());
            case EMPLOYEUR -> getEmployeurDto(user.getId());
        };
    }

    private GestionnaireDto getGestionnaireDto(Long id) {
        final Optional<Gestionnaire> gestionnaireOptional = gestionnaireRepository.findById(id);
        return gestionnaireOptional.isPresent() ?
                GestionnaireDto.create(gestionnaireOptional.get()) :
                GestionnaireDto.empty();
    }

    private ProfesseurDto getPreposeDto(Long id) {
        final Optional<Professeur> preposeOptional = professeurRepository.findById(id);
        return preposeOptional.isPresent() ?
                ProfesseurDto.create(preposeOptional.get()) :
                ProfesseurDto.empty();
    }

    private EtudiantDto getEmprunteurDto(Long id) {
        final Optional<Etudiant> emprunteurOptional = etudiantRepository.findById(id);
        return emprunteurOptional.isPresent() ?
                EtudiantDto.create(emprunteurOptional.get()) :
                EtudiantDto.empty();
    }

    private EtudiantDto getEmployeurDto(Long id) {
        final Optional<Etudiant> emprunteurOptional = etudiantRepository.findById(id);
        return emprunteurOptional.isPresent() ?
                EtudiantDto.create(emprunteurOptional.get()) :
                EtudiantDto.empty();
    }
}
