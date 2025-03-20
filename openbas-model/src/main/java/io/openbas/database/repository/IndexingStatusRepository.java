package io.openbas.database.repository;

import io.openbas.database.model.IndexingStatus;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IndexingStatusRepository
    extends CrudRepository<IndexingStatus, String>, JpaSpecificationExecutor<IndexingStatus> {

  @NotNull
  Optional<IndexingStatus> findByType(@NotNull String type);
}
