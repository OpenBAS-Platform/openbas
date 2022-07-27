package io.openex.rest.media.form;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ArticleDocumentInput {

    @JsonProperty("document_id")
    private String documentId;

    public String getDocumentId() {
        return documentId;
    }

    public void setDocumentId(String documentId) {
        this.documentId = documentId;
    }
}
