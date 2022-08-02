package io.openex.database.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openex.helper.MonoIdDeserializer;

import javax.persistence.*;
import java.util.Objects;

@Entity
@Table(name = "articles_documents")
public class ArticleDocument {

    @EmbeddedId
    @JsonIgnore
    private ArticleDocumentId compositeId = new ArticleDocumentId();

    @ManyToOne(fetch = FetchType.EAGER)
    @MapsId("articleId")
    @JoinColumn(name = "article_id")
    @JsonProperty("article_id")
    @JsonSerialize(using = MonoIdDeserializer.class)
    private Article article;

    @ManyToOne(fetch = FetchType.EAGER)
    @MapsId("documentId")
    @JoinColumn(name = "document_id")
    @JsonProperty("document_id")
    @JsonSerialize(using = MonoIdDeserializer.class)
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
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ArticleDocument that = (ArticleDocument) o;
        return compositeId.equals(that.compositeId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(compositeId);
    }
}
