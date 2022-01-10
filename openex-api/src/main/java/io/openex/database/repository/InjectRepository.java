package io.openex.database.repository;

import io.openex.database.model.Inject;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;

@Repository
public interface InjectRepository<T> extends CrudRepository<Inject<T>, String>, JpaSpecificationExecutor<Inject<T>>, StatisticRepository {

    @NotNull
    Optional<Inject<T>> findById(@NotNull String id);

    @Override
    @Query("select count(distinct i) from Inject i " +
            "join i.exercise as e " +
            "join e.grants as grant " +
            "join grant.group.users as user " +
            "where user.id = :userId and i.createdAt < :creationDate")
    long userCount(@Param("userId") String userId, @Param("creationDate") Instant creationDate);

    @Override
    @Query("select count(distinct i) from Inject i where i.createdAt < :creationDate")
    long globalCount(@Param("creationDate") Instant creationDate);
}
