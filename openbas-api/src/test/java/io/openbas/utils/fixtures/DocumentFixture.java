package io.openbas.utils.fixtures;

import io.openbas.database.model.Document;
import io.openbas.utils.fixtures.files.BaseFile;

public class DocumentFixture {

  public static final String DOCUMENT_NAME = "A document";
  public static final String TXT_DOCUMENT_NAME = "My text document";

  public static Document getDocumentJpeg() {
    Document document = new Document();
    document.setName(DOCUMENT_NAME);
    document.setType("image/jpeg");
    return document;
  }

  public static Document getDocumentTxt(BaseFile<String> plainTextFile) {
    Document document = new Document();
    document.setName(TXT_DOCUMENT_NAME);
    document.setType(plainTextFile.getMimeType());
    document.setTarget(plainTextFile.getFileName());
    return document;
  }
}
