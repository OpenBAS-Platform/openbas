package io.openex.rest.utils.fixtures;

import io.openex.database.model.Document;

public class DocumentFixture {

  public static final String DOCUMENT_NAME = "A document";

  public static Document getDocumentJpeg() {
    Document document = new Document();
    document.setName(DOCUMENT_NAME);
    document.setType("image/jpeg");
    return document;
  }

}
