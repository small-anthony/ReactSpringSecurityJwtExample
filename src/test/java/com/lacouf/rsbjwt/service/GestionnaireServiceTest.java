package com.lacouf.rsbjwt.service;

import com.lacouf.rsbjwt.model.Cv;
import com.lacouf.rsbjwt.model.ENUM.StatusAcceptation;
import com.lacouf.rsbjwt.repository.CvRepository;
import com.lacouf.rsbjwt.service.dto.CvDto;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.List;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class GestionnaireServiceTest {
    @Mock
    private CvRepository cvRepository;

    @InjectMocks
    private GestionnaireService gestionnaireService;

    @Test
    void getCvEnAttente_shouldReturnListCvEnAttente() {
//        ARRANGE
        Cv cv1 = new Cv();
        cv1.setId(1L);
        Cv cv2 = new Cv();
        cv2.setId(2L);

        when(cvRepository.findByApprobationStatus(StatusAcceptation.EN_ATTENTE))
                .thenReturn(List.of(cv1, cv2));

//        ACT
        List<CvDto> resultat = gestionnaireService.getCvEnAttente();

//        ASSERT
        assertEquals(2, resultat.size());
        assertEquals(1L, resultat.get(0).id());
        assertEquals(2L, resultat.get(1).id());
    }

    @Test
    void accepterCv_shouldChangeCvStatus_WhenCvExists() throws Exception {
//         ARRANGE
        Cv cv = new Cv();
        cv.setId(1L);

        when(cvRepository.findById(1L)).thenReturn(java.util.Optional.of(cv));

        when(cvRepository.save(cv)).thenReturn(cv);

//        ACT
        CvDto resultat = gestionnaireService.accepterCv(1L);

//        ASSERT
        assertEquals(StatusAcceptation.ACCEPTE, resultat.status());
    }

    @Test
    void refuserCv_shouldChangeCvStatusSetMessage_WhenCvExists() throws Exception {
//         ARRANGE
        Cv cv = new Cv();
        cv.setId(1L);
        String messageRefus = "Message de refus";

        when(cvRepository.findById(1L))
                .thenReturn(java.util.Optional.of(cv));

        when(cvRepository.save(cv)).thenReturn(cv);

//        ACT
        CvDto resultat = gestionnaireService.refuserCv(1L, messageRefus);

//        ASSERT
        assertEquals(StatusAcceptation.REFUSE, resultat.status());
        assertEquals("Message de refus", resultat.message());
    }

    @Test
    void accepterCv_shouldThrowException_WhenCvDoesNotExist() {
//        ARRANGE
        when(cvRepository.findById(1L))
                .thenReturn(Optional.empty());

//        ACT
        Exception exception = assertThrows(Exception.class, () -> gestionnaireService.accepterCv(1L));

//        ASSERT
        assertEquals("CV non trouvé", exception.getMessage());
    }
}
