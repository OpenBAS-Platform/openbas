package io.openbas.database.repository;

import io.openbas.database.model.SecurityAssessment;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SecurityAssessmentRepository
    extends CrudRepository<SecurityAssessment, String>,
    JpaSpecificationExecutor<SecurityAssessment> {

  Optional<SecurityAssessment> findByExternalId(String id);
}