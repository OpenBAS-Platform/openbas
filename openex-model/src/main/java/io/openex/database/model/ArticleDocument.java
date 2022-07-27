package io.openex.database.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openex.helper.MonoModelDeserializer;

import javax.persistence.*;

@Entity
@Table(name = "articles_documents")
public class ArticleDocument implements Base {

    @EmbeddedId
    @JsonIgnore
    private ArticleDocumentId compositeId = new ArticleDocumentId();

    @ManyToOne
    @MapsId("articleId")
    @JoinColumn(name = "article_id")
    @JsonProperty("article_id")
    @JsonSerialize(using = MonoModelDeserializer.class)
    private Article article;

    @ManyToOne
    @MapsId("documentId")
    @JoinColumn(name = "document_id")
    @JsonProperty("document_id")
    @JsonSerialize(using = MonoModelDeserializer.class)
    private Document document;

    public ArticleDocumentId getCompositeId() {
        return compositeId;
    }

    public void setCompositeId(ArticleDocumentId compositeId) {
        this.compositeId = compositeId;
    }

    public Article getArticle() {
        return article;
    }

    public void setArticle(Article article) {
        this.article = article;
    }

    public Document getDocument() {
        return document;
    }

    public void setDocument(Document document) {
        this.document = document;
    }

    @Override
    @JsonIgnore
    public String getId() {
        return compositeId.getDocumentId() + "|" + compositeId.getArticleId();
    }
}
