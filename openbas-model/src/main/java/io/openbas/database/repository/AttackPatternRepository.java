package io.openbas.database.repository;

import io.openbas.database.model.AttackPattern;
import io.openbas.database.raw.RawAttackPattern;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AttackPatternRepository
    extends CrudRepository<AttackPattern, String>, JpaSpecificationExecutor<AttackPattern> {

  @NotNull
  Optional<AttackPattern> findById(@NotNull String id);

  Optional<AttackPattern> findByExternalId(@NotNull String externalId);

  List<AttackPattern> findAllByExternalIdInIgnoreCase(List<String> externalIds);

  Optional<AttackPattern> findByStixId(@NotNull String stixId);

  @Query(
      value =
          "select ap.*, array_remove(array_agg(apphase.phase_id), NULL) as attack_pattern_kill_chain_phases from attack_patterns ap "
              + "left join attack_patterns_kill_chain_phases apphase ON ap.attack_pattern_id = apphase.attack_pattern_id GROUP BY ap.attack_pattern_id",
      nativeQuery = true)
  List<RawAttackPattern> rawAll();
}
