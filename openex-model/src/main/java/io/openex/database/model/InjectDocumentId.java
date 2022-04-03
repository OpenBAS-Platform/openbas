package io.openex.database.model;

import javax.persistence.Embeddable;
import java.io.Serializable;

@Embeddable
public class InjectDocumentId implements Serializable {

    private String injectId;
    private String documentId;

    public InjectDocumentId() {
        // Default constructor
    }

    public String getInjectId() {
        return injectId;
    }

    public void setInjectId(String injectId) {
        this.injectId = injectId;
    }

    public String getDocumentId() {
        return documentId;
    }

    public void setDocumentId(String documentId) {
        this.documentId = documentId;
    }
}
