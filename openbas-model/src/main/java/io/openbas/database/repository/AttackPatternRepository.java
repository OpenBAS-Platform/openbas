package io.openbas.database.repository;

import io.openbas.database.model.AttackPattern;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AttackPatternRepository extends CrudRepository<AttackPattern, String>, JpaSpecificationExecutor<AttackPattern> {

  @NotNull
  Optional<AttackPattern> findById(@NotNull String id);

  Optional<AttackPattern> findByExternalId(@NotNull String externalId);

  Optional<AttackPattern> findByStixId(@NotNull String stixId);
}
