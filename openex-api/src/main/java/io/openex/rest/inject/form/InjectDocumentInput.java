package io.openex.rest.inject.form;

import com.fasterxml.jackson.annotation.JsonProperty;

public class InjectDocumentInput {

    @JsonProperty("inject_document_id")
    private String documentId;

    @JsonProperty("inject_document_attached")
    private boolean attached = true;

    public String getDocumentId() {
        return documentId;
    }

    public void setDocumentId(String documentId) {
        this.documentId = documentId;
    }

    public boolean isAttached() {
        return attached;
    }

    public void setAttached(boolean attached) {
        this.attached = attached;
    }
}
