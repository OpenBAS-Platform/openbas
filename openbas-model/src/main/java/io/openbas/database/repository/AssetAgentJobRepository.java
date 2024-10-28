package io.openbas.database.repository;

import io.openbas.database.model.AssetAgentJob;
import jakarta.validation.constraints.NotNull;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AssetAgentJobRepository
    extends CrudRepository<AssetAgentJob, String>, JpaSpecificationExecutor<AssetAgentJob> {

  @NotNull
  Optional<AssetAgentJob> findById(@NotNull String id);
}
