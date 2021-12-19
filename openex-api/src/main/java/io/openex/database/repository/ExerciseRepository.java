package io.openex.database.repository;

import io.openex.database.model.Exercise;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;

@Repository
public interface ExerciseRepository extends CrudRepository<Exercise, String> {

    @NotNull
    Optional<Exercise> findById(@NotNull String id);

    @Async
    @Query("select e from Exercise e where e.id = :id")
    CompletableFuture<Exercise> asyncFindById(@Param("id") @NotNull String id);

    @Query("select distinct e from Exercise e " +
            "join e.grants as grant " +
            "join grant.group.users as user " +
            "where user.id = :userId")
    List<Exercise> findAllGranted(@Param("userId") String userId);
}
