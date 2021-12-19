package io.openex.database.repository;

import io.openex.database.model.Incident;
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
public interface IncidentRepository extends CrudRepository<Incident, String>, JpaSpecificationExecutor<Incident> {

    @NotNull
    Optional<Incident> findById(@NotNull String id);

    @Async
    @Query("select distinct e from Incident e " +
            "join e.event as event " +
            "join event.exercise as exercise " +
            "where exercise.id = :id")
    CompletableFuture<List<Incident>> asyncFindByExercise(@Param("id") String exerciseId);
}
