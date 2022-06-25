package io.openex.database.repository;

import io.openex.database.model.InjectExpectationExecution;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import javax.validation.constraints.NotNull;
import java.util.List;
import java.util.Optional;

@Repository
public interface InjectExpectationExecutionRepository extends CrudRepository<InjectExpectationExecution, String>, JpaSpecificationExecutor<InjectExpectationExecution> {

    @NotNull
    Optional<InjectExpectationExecution> findById(@NotNull String id);

    @Query(value = "select i from InjectExpectationExecution i where i.exercise.id = :exerciseId")
    List<InjectExpectationExecution> findAllForExercise(@Param("exerciseId") String exerciseId);
}
