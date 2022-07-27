package io.openex.database.repository;

import io.openex.database.model.ArticleDocument;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import javax.validation.constraints.NotNull;
import java.util.Optional;

@Repository
public interface ArticleDocumentRepository extends CrudRepository<ArticleDocument, String>, JpaSpecificationExecutor<ArticleDocument> {

    @NotNull
    Optional<ArticleDocument> findById(@NotNull String id);

    @Modifying
    @Query(value = "insert into articles_documents (article_id, document_id) " +
            "values (:articleId, :documentId)", nativeQuery = true)
    void addArticleDoc(@Param("articleId") String articleId,
                       @Param("documentId") String docId);
}
