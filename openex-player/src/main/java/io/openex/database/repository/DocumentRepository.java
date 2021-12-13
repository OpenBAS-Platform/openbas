package io.openex.database.repository;

import io.openex.database.model.Document;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DocumentRepository extends CrudRepository<Document, String>, JpaSpecificationExecutor<Document> {

    @NotNull
    Optional<Document> findById(@NotNull String id);
}
