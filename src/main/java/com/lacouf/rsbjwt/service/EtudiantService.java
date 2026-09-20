package com.lacouf.rsbjwt.service;

import com.lacouf.rsbjwt.model.Etudiant;
import com.lacouf.rsbjwt.repository.EtudiantRepository;
import com.lacouf.rsbjwt.repository.UserAppRepository;
import com.lacouf.rsbjwt.service.dto.CvDto;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class EtudiantService {
    private final UserAppRepository userAppRepository;
    private final EtudiantRepository etudiantRepository;

    public EtudiantService(UserAppRepository userAppRepository, EtudiantRepository etudiantRepository) {
        this.userAppRepository = userAppRepository;
        this.etudiantRepository = etudiantRepository;
    }

    public CvDto uploadCv(String emailConnecte, MultipartFile file) throws Exception {
        Etudiant etudiant = (Etudiant) userAppRepository.findUserAppByEmail(emailConnecte)
                .orElseThrow(() -> new Exception("Etudiant non trouvé"));

        if (file.isEmpty()) {
            throw new Exception("Veuillez sélectionner un fichier");
        }

        String contentType = file.getContentType();

        if (contentType == null || !contentType.equals("application/pdf")) {
            throw new Exception("Le fichier doit être un PDF");
        }

        etudiant.setCv(file.getBytes());

        Etudiant etudiantSauvegarde = etudiantRepository.save(etudiant);

        return CvDto.create(etudiantSauvegarde.getCv());
    }
}
