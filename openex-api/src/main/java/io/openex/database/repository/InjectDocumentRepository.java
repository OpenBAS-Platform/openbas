package io.openex.database.repository;

import io.openex.database.model.InjectDocument;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InjectDocumentRepository extends CrudRepository<InjectDocument, String>, JpaSpecificationExecutor<InjectDocument> {

    @NotNull
    Optional<InjectDocument> findById(@NotNull String id);

    @Modifying
    @Query(value = "insert into injects_documents (inject_id, document_id, document_attached) " +
            "values (:injectId, :documentId, :documentAttached)", nativeQuery = true)
    void addInjectDoc(@Param("injectId") String injectId,
                      @Param("documentId") String docId,
                      @Param("documentAttached") boolean docAttached);
}
