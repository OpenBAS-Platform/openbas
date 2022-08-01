package io.openex.database.model;

import javax.persistence.Embeddable;
import java.io.Serial;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class ArticleDocumentId implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;
    private String articleId;
    private String documentId;

    public ArticleDocumentId() {
        // Default constructor
    }

    public String getArticleId() {
        return articleId;
    }

    public void setArticleId(String articleId) {
        this.articleId = articleId;
    }

    public String getDocumentId() {
        return documentId;
    }

    public void setDocumentId(String documentId) {
        this.documentId = documentId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ArticleDocumentId that = (ArticleDocumentId) o;
        return articleId.equals(that.articleId) && documentId.equals(that.documentId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(articleId, documentId);
    }
}
