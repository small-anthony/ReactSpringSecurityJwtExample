package com.lacouf.rsbjwt.service;

import com.lacouf.rsbjwt.model.*;
import com.lacouf.rsbjwt.model.auth.Credentials;
import com.lacouf.rsbjwt.model.auth.Role;
import com.lacouf.rsbjwt.repository.*;
import com.lacouf.rsbjwt.service.dto.*;
import com.lacouf.rsbjwt.security.JwtTokenProvider;
import com.lacouf.rsbjwt.security.exception.UserNotFoundException;
import com.lacouf.rsbjwt.service.dto.interfaceDTO.UserDto;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class UserAppService {
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserAppRepository userAppRepository;
    private final EtudiantRepository etudiantRepository;
    private final ProfesseurRepository professeurRepository;
    private final GestionnaireRepository gestionnaireRepository;
    private final EmployeurRepository employeurRepository;
    private final PasswordEncoder passwordEncoder;

    public UserAppService(AuthenticationManager authenticationManager,
                          JwtTokenProvider jwtTokenProvider,
                          UserAppRepository userAppRepository,
                          EtudiantRepository etudiantRepository,
                          ProfesseurRepository professeurRepository,
                          GestionnaireRepository gestionnaireRepository,
                          EmployeurRepository employeurRepository,
                          PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
        this.userAppRepository = userAppRepository;
        this.etudiantRepository = etudiantRepository;
        this.professeurRepository = professeurRepository;
        this.gestionnaireRepository = gestionnaireRepository;
        this.employeurRepository = employeurRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public String authenticateUser(LoginDto loginDto) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginDto.email(), loginDto.password()));
        final String token = jwtTokenProvider.generateToken(authentication);
        System.out.println("JWT Token " + token);
        return token;
    }

    public UserDto getMe(String token) {
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

    public EmployeurDto registerEmployeur(String firstName,String lastName,
                                          String email,String entreprise,
                                          String posteOccupe,String telephone,
                                          String password,String passwordConfirmation) throws Exception
    {
        if (checkIfEmailExists(email)) {
            throw new Exception("Un compte avec cet email existe déjà");
        }

        if (!password.equals(passwordConfirmation)) {
            throw new Exception("Les mots de passe ne correspondent pas");
        }

        if (userAppRepository.findUserAppByEmail(email).isPresent()) {
            throw new Exception("Cette adresse courriel existe déjà dans le système");
        }

        Credentials credentials = new Credentials(email, passwordEncoder.encode(password), Role.EMPLOYEUR);

        Employeur nouvelEmployeur = new Employeur(
                firstName,
                lastName,
                credentials,
                entreprise,
                posteOccupe,
                telephone
        );

        return EmployeurDto.create(employeurRepository.save(nouvelEmployeur));
    }

    private EmployeurDto getEmployeurDto(Long id) {
        final Optional<Employeur> emprunteurOptional = employeurRepository.findById(id);
        return emprunteurOptional.isPresent() ?
                EmployeurDto.create(emprunteurOptional.get()) :
                null;
    }

    private boolean checkIfEmailExists(String email) {
        return userAppRepository.findUserAppByEmail(email).isPresent();
    }
}
