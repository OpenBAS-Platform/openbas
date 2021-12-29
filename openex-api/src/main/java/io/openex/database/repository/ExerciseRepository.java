package io.openex.database.repository;

import io.openex.database.model.Exercise;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Repository
public interface ExerciseRepository extends CrudRepository<Exercise, String>, StatisticRepository {

    @NotNull
    Optional<Exercise> findById(@NotNull String id);

    @Query("select distinct e from Exercise e " +
            "join e.grants as grant " +
            "join grant.group.users as user " +
            "where user.id = :userId")
    List<Exercise> findAllGranted(@Param("userId") String userId);

    @Override
    @Query("select count(distinct e) from Exercise e " +
            "join e.grants as grant " +
            "join grant.group.users as user " +
            "where user.id = :userId and e.createdAt < :creationDate")
    long userCount(@Param("userId") String userId, @Param("creationDate") Date creationDate);

    @Override
    @Query("select count(distinct e) from Exercise e where e.createdAt < :creationDate")
    long globalCount(@Param("creationDate") Date creationDate);
}
