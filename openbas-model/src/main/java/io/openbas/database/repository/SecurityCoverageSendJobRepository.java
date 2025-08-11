package io.openbas.database.repository;

import io.openbas.database.model.Exercise;
import io.openbas.database.model.SecurityCoverageSendJob;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface SecurityCoverageSendJobRepository
    extends CrudRepository<SecurityCoverageSendJob, String>,
        JpaSpecificationExecutor<SecurityCoverageSendJob> {

  @Query("select scsj from SecurityCoverageSendJob scsj where scsj.simulation = ?1")
  Optional<SecurityCoverageSendJob> findBySimulation(@NotBlank Exercise simulation);

  // TODO: SELECT FOR UPDATE SKIP LOCKED;
  List<SecurityCoverageSendJob> findByStatusAndUpdatedAtBefore(String status, Instant updatedAtBefore);
}
