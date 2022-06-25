package io.openex.database.repository;

import io.openex.database.model.Challenge;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import javax.validation.constraints.NotNull;
import java.util.Optional;

@Repository
public interface ChallengeRepository extends CrudRepository<Challenge, String>, JpaSpecificationExecutor<Challenge> {

    @NotNull
    Optional<Challenge> findById(@NotNull String id);
}
