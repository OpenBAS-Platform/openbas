package io.openex.database.repository;

import io.openex.database.model.InjectDocument;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InjectDocumentRepository extends CrudRepository<InjectDocument, String>, JpaSpecificationExecutor<InjectDocument> {

    @NotNull
    Optional<InjectDocument> findById(@NotNull String id);
}
