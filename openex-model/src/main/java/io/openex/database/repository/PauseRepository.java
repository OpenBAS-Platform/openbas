package io.openex.database.repository;

import io.openex.database.model.Pause;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PauseRepository extends CrudRepository<Pause, String>, JpaSpecificationExecutor<Pause> {

    @NotNull
    Optional<Pause> findById(@NotNull String id);

    @Query(value = "select p from Pause p where p.exercise.id = :exerciseId")
    List<Pause> findAllForExercise(@Param("exerciseId") String exerciseId);
}
