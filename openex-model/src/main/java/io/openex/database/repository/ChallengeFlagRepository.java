package io.openex.database.repository;

import io.openex.database.model.ChallengeFlag;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import javax.validation.constraints.NotNull;
import java.util.Optional;

@Repository
public interface ChallengeFlagRepository extends CrudRepository<ChallengeFlag, String>, JpaSpecificationExecutor<ChallengeFlag> {

    @NotNull
    Optional<ChallengeFlag> findById(@NotNull String id);
}
