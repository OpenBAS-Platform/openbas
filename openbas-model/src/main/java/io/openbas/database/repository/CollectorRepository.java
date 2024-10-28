package io.openbas.database.repository;

import io.openbas.database.model.Collector;
import jakarta.validation.constraints.NotNull;
import java.util.Optional;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CollectorRepository extends CrudRepository<Collector, String> {

  @NotNull
  Optional<Collector> findById(@NotNull String id);

  @NotNull
  Optional<Collector> findByType(@NotNull String type);
}
