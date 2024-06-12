package io.openbas.database.repository;

import io.openbas.database.model.Evaluation;
import io.openbas.database.raw.RawEvaluation;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EvaluationRepository extends CrudRepository<Evaluation, String>, JpaSpecificationExecutor<Evaluation> {

    @NotNull
    Optional<Evaluation> findById(@NotNull String id);

    @Query(value="SELECT * FROM evaluations WHERE evaluation_objective IN :ids ;", nativeQuery = true)
    List<RawEvaluation> rawByObjectiveIds(@Param("ids") List<String> ids);
}
