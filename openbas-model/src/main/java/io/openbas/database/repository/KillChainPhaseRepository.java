package io.openbas.database.repository;

import io.openbas.database.model.KillChainPhase;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface KillChainPhaseRepository extends CrudRepository<KillChainPhase, String>, JpaSpecificationExecutor<KillChainPhase> {

    @NotNull
    Optional<KillChainPhase> findById(@NotNull String id);

    @Query("SELECT k FROM KillChainPhase k WHERE k.shortName IN (:names)")
    List<KillChainPhase> findAllByShortName(@NotNull List<String> names);

    Optional<KillChainPhase> findByKillChainNameAndShortName(@NotNull String killChainName, @NotNull String shortName);
}
