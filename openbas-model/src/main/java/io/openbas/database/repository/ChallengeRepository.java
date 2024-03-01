package io.openbas.database.repository;

import io.openbas.database.model.Challenge;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.Optional;

@Repository
public interface ChallengeRepository extends CrudRepository<Challenge, String>, JpaSpecificationExecutor<Challenge> {

    @NotNull
    Optional<Challenge> findById(@NotNull String id);

    List<Challenge> findByNameIgnoreCase(String name);
}
