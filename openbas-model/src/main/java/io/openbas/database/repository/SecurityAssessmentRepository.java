package io.openbas.database.repository;

import io.openbas.database.model.SecurityAssessment;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SecurityAssessmentRepository
    extends CrudRepository<SecurityAssessment, String>,
        JpaSpecificationExecutor<SecurityAssessment> {

  Optional<SecurityAssessment> findByExternalId(String id);
}
