package io.openex.database.repository;

import io.openex.database.model.Evaluation;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EvaluationRepository extends CrudRepository<Evaluation, String>, JpaSpecificationExecutor<Evaluation> {

    @NotNull
    Optional<Evaluation> findById(@NotNull String id);
}
