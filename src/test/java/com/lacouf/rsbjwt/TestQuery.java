package com.lacouf.rsbjwt;
import org.springframework.boot.test.context.SpringBootTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import com.lacouf.rsbjwt.repository.OffreStageRepository;
import com.lacouf.rsbjwt.repository.EmployeurRepository;
import com.lacouf.rsbjwt.model.Employeur;
import java.util.List;
import com.lacouf.rsbjwt.model.OffreStage;

@SpringBootTest
public class TestQuery {
    @Autowired OffreStageRepository r1;
    @Autowired EmployeurRepository r2;
    @Test void testIt() {
        Employeur emp = r2.findAll().get(0);
        List<OffreStage> list = r1.findWithCandidaturesByEmployeur(emp);
        System.out.println("SIZE: " + list.size());
    }
}
