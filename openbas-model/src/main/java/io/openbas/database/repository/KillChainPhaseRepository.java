package io.openbas.database.repository;

import io.openbas.database.model.KillChainPhase;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.validation.constraints.NotNull;

import java.util.Optional;

@Repository
public interface KillChainPhaseRepository extends CrudRepository<KillChainPhase, String>, JpaSpecificationExecutor<KillChainPhase> {

    @NotNull
    Optional<KillChainPhase> findById(@NotNull String id);

    Optional<KillChainPhase> findByStixId(@NotNull String stixId);

    Optional<KillChainPhase> findByKillChainNameAndShortName(@NotNull String killChainName, @NotNull String shortName);
}
