package io.openbas.database.repository;

import io.openbas.database.model.Exercise;
import io.openbas.database.model.SecurityCoverageSendJob;
import jakarta.validation.constraints.NotBlank;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SecurityCoverageSendJobRepository
    extends CrudRepository<SecurityCoverageSendJob, String>,
        JpaSpecificationExecutor<SecurityCoverageSendJob> {

  @Query("select scsj from SecurityCoverageSendJob scsj where scsj.simulation = ?1")
  Optional<SecurityCoverageSendJob> findBySimulation(@NotBlank Exercise simulation);
}
