package io.openbas.database.repository;

import io.openbas.database.model.Mitigation;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MitigationRepository extends CrudRepository<Mitigation, String>, JpaSpecificationExecutor<Mitigation> {

  @NotNull
  Optional<Mitigation> findById(@NotNull String id);

  Optional<Mitigation> findByExternalId(@NotNull String externalId);

  List<Mitigation> findAllByExternalIdInIgnoreCase(List<String> externalIds);

  Optional<Mitigation> findByStixId(@NotNull String stixId);
}
