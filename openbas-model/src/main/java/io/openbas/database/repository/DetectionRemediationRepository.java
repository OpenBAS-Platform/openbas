package io.openbas.database.repository;

import io.openbas.database.model.DetectionRemediation;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DetectionRemediationRepository
    extends CrudRepository<DetectionRemediation, String>,
        JpaSpecificationExecutor<DetectionRemediation> {}
