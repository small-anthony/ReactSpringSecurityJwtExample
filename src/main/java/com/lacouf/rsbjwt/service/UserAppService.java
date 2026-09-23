package com.lacouf.rsbjwt.service;

import com.lacouf.rsbjwt.model.*;
import com.lacouf.rsbjwt.repository.*;
import com.lacouf.rsbjwt.repository.EtudiantRepository;
import com.lacouf.rsbjwt.repository.GestionnaireRepository;
import com.lacouf.rsbjwt.repository.ProfesseurRepository;
import com.lacouf.rsbjwt.repository.UserAppRepository;
import com.lacouf.rsbjwt.security.exception.AuthenticationException;
import com.lacouf.rsbjwt.service.dto.*;
import com.lacouf.rsbjwt.security.JwtTokenProvider;
import com.lacouf.rsbjwt.security.exception.UserNotFoundException;
import com.lacouf.rsbjwt.service.dto.interfaceDTO.UserDto;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.lacouf.rsbjwt.model.auth.Credentials;
import com.lacouf.rsbjwt.model.auth.Role;

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

    public String authenticateUser(LoginDto loginDto)
        throws AuthenticationException {
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
        return switch (user.getRole()) {
            case ETUDIANT -> EtudiantDto.create((Etudiant) user);
            case PROFESSEUR -> ProfesseurDto.create((Professeur) user);
            case GESTIONNAIRE -> GestionnaireDto.create((Gestionnaire) user);
            case EMPLOYEUR -> EmployeurDto.create((Employeur) user);
        };
    }

    public EtudiantDto registerStudent(String firstName, String lastName, int matricule, String email, String discipline, String password, String confirmPassword) throws Exception {

        if (!email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$")) {
            throw new Exception("Le format de l'email est invalide");
        }

        if (checkIfEmailExists(email)) {
            throw new Exception("Un compte avec cet email existe déjà");
        }

        if (checkIfMatriculeExists(matricule)) {
            throw new Exception("Un compte avec ce matricule existe déjà");
        }

        if (password.length() < 8) {
            throw new Exception("Le mot de passe doit contenir au moins 8 caractères");
        }

        if (!password.equals(confirmPassword)) {
            throw new Exception("Les mots de passe ne correspondent pas");
        }

        String passwordEncoded = passwordEncoder.encode(password);

        Credentials credentials = new Credentials(email, passwordEncoded, Role.ETUDIANT);
        Etudiant etudiant = new Etudiant(firstName, lastName, credentials, matricule, discipline);

        return EtudiantDto.create(etudiantRepository.save(etudiant));
    }

    public EmployeurDto registerEmployeur(String firstName, String lastName,
                                          String email, String entreprise, String telephone,
                                          String password, String passwordConfirmation) throws Exception
    {
        if (!email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$")) {
            throw new Exception("Le format du courriel n'est pas valide");
        }

        if (checkIfEmailExists(email)) {
            throw new Exception("Un compte avec cet email existe déjà");
        }

        if (password.length() < 8) {
            throw new Exception("Le mot de passe doit contenir au moins 8 caractères");
        }

        if (!password.equals(passwordConfirmation)) {
            throw new Exception("Les mots de passe ne correspondent pas");
        }

        String passwordEncode = passwordEncoder.encode(password);
        Credentials credentials = new Credentials(email, passwordEncode, Role.EMPLOYEUR);

        Employeur nouvelEmployeur = new Employeur(firstName, lastName, credentials, entreprise, telephone);

        return EmployeurDto.create(employeurRepository.save(nouvelEmployeur));
    }

    public ProfesseurDto registerProfesseur(String firstName, String lastName,
                                            String email, String password,
                                            String passwordConfirmation) throws Exception
    {
        if (!email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$")) {
            throw new Exception("Le format du courriel n'est pas valide.");
        }

        if (checkIfEmailExists(email)) {
            throw new Exception("Un compte avec cet email existe déjà");
        }

        if (password.length() < 8) {
            throw new Exception("Le mot de passe doit contenir au moins 8 caractères.");
        }

        if (!password.equals(passwordConfirmation)) {
            throw new Exception("Les mots de passe ne correspondent pas");
        }

        Credentials credentials = new Credentials(email, passwordEncoder.encode(password), Role.PROFESSEUR);

        Professeur nouveauProfesseur = new Professeur(firstName, lastName, credentials);

        return ProfesseurDto.create(professeurRepository.save(nouveauProfesseur));
    }

    private boolean checkIfEmailExists(String email) {
        return userAppRepository.findUserAppByEmail(email).isPresent();
    }

    private boolean checkIfMatriculeExists(int matricule) {
        return etudiantRepository.existsByMatricule(matricule);
    }
}
