package io.openex.database.repository;

import io.openex.database.model.SubObjective;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;

@Repository
public interface SubObjectiveRepository extends CrudRepository<SubObjective, String>, JpaSpecificationExecutor<SubObjective> {

    @NotNull
    Optional<SubObjective> findById(@NotNull String id);

    @Async
    @Query("select distinct s from SubObjective s join s.objective as objective where objective.exercise.id = :id")
    CompletableFuture<List<SubObjective>> asyncFindByExercise(@Param("id") String exerciseId);
}
