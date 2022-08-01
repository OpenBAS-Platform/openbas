package io.openex.database.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openex.helper.MonoModelDeserializer;

import javax.persistence.*;
import java.util.Objects;

@Entity
@Table(name = "injects_documents")
public class InjectDocument {

    @EmbeddedId
    @JsonIgnore
    private InjectDocumentId compositeId = new InjectDocumentId();

    @ManyToOne
    @MapsId("injectId")
    @JoinColumn(name = "inject_id")
    @JsonProperty("inject_id")
    @JsonSerialize(using = MonoModelDeserializer.class)
    private Inject inject;

    @ManyToOne
    @MapsId("documentId")
    @JoinColumn(name = "document_id")
    @JsonProperty("document_id")
    @JsonSerialize(using = MonoModelDeserializer.class)
    private Document document;

    @Column(name = "document_attached")
    @JsonProperty("document_attached")
    private boolean attached = true;

    public boolean isAttached() {
        return attached;
    }

    public void setAttached(boolean attached) {
        this.attached = attached;
    }

    public InjectDocumentId getCompositeId() {
        return compositeId;
    }

    public void setCompositeId(InjectDocumentId compositeId) {
        this.compositeId = compositeId;
    }

    public Inject getInject() {
        return inject;
    }

    public void setInject(Inject inject) {
        this.inject = inject;
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
        InjectDocument that = (InjectDocument) o;
        return compositeId.equals(that.compositeId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(compositeId);
    }
}
