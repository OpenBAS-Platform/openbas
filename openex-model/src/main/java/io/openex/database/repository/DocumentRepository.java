package io.openex.database.repository;

import io.openex.database.model.Document;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentRepository extends CrudRepository<Document, String>, JpaSpecificationExecutor<Document> {

    @NotNull
    Optional<Document> findById(@NotNull String id);
    List<Document> removeById(@NotNull String id);

    @NotNull
    Optional<Document> findByTarget(@NotNull String target);

    @Query("select d from Document d " +
            "join d.exercises as exercise " +
            "join exercise.grants as grant " +
            "join grant.group as g " +
            "join g.users as user " +
            "where d.id = :id and user.id = :userId")
    Optional<Document> findByIdGranted(@Param("id") String documentId, @Param("userId") String userId);

    @Query("select distinct d from Document d " +
            "join d.exercises as exercise " +
            "join exercise.grants as grant " +
            "join grant.group as g " +
            "join g.users as user " +
            "where user.id = :userId")
    List<Document> findAllGranted(@Param("userId") String userId);
}
