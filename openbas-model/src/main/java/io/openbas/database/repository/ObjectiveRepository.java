package io.openbas.database.repository;

import io.openbas.database.model.Objective;
import io.openbas.database.raw.RawObjective;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ObjectiveRepository extends CrudRepository<Objective, String>, JpaSpecificationExecutor<Objective> {

    @NotNull
    Optional<Objective> findById(@NotNull String id);

    @Query(value = "SELECT * FROM objectives WHERE objective_exercise IN :ids ;", nativeQuery = true)
    List<RawObjective> rawByExerciseIds(@Param("ids") List<String> ids);
}
