package io.openbas.database.repository;

import io.openbas.database.model.SecurityCoverage;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SecurityCoverageRepository
    extends CrudRepository<SecurityCoverage, String>, JpaSpecificationExecutor<SecurityCoverage> {

  Optional<SecurityCoverage> findByExternalId(String id);
}
