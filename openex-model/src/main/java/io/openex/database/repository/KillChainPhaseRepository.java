package io.openex.database.repository;

import io.openex.database.model.KillChainPhase;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import javax.validation.constraints.NotNull;
import java.util.Optional;

@Repository
public interface KillChainPhaseRepository extends CrudRepository<KillChainPhase, String>, JpaSpecificationExecutor<KillChainPhase> {

    @NotNull
    Optional<KillChainPhase> findById(@NotNull String id);
}
