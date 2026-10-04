package com.lacouf.rsbjwt.repository;

import com.lacouf.rsbjwt.model.Cv;
import com.lacouf.rsbjwt.model.ENUM.StatusAcceptation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CvRepository extends JpaRepository<Cv, Long> {
    List<Cv> findByApprobationStatus(StatusAcceptation status);
}
