package io.openex.database.model;

import javax.persistence.Embeddable;
import java.io.Serializable;

@Embeddable
public class ArticleDocumentId implements Serializable {

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
}
