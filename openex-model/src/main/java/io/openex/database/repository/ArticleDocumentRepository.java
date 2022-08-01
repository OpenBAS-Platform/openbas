package io.openex.database.repository;

import io.openex.database.model.ArticleDocument;
import io.openex.database.model.ArticleDocumentId;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import javax.validation.constraints.NotNull;
import java.util.Optional;

@Repository
public interface ArticleDocumentRepository extends CrudRepository<ArticleDocument, ArticleDocumentId>, JpaSpecificationExecutor<ArticleDocument> {

    @NotNull
    Optional<ArticleDocument> findById(@NotNull ArticleDocumentId id);


    @Modifying
    @Query(value = "delete from articles_documents i where i.document_id = :documentId", nativeQuery = true)
    void deleteDocumentFromAllReferences(@Param("documentId") String docId);

    @Modifying
    @Query(value = "delete from articles_documents i where i.article_id = :articleId", nativeQuery = true)
    void deleteDocumentsFromArticle(@Param("articleId") String articleId);

    @Modifying
    @Query(value = "insert into articles_documents (article_id, document_id) " +
            "values (:articleId, :documentId)", nativeQuery = true)
    void addArticleDoc(@Param("articleId") String articleId,
                       @Param("documentId") String docId);

}
