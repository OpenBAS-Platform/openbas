package io.openbas.utils.fixtures.composers;

import io.openbas.database.model.Document;
import io.openbas.database.repository.DocumentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class DocumentComposer {
  @Autowired private DocumentRepository documentRepository;

  public class Composer extends InnerComposerBase<Document> {
    private final Document document;

    public Composer(Document document) {
      this.document = document;
    }

    @Override
    public Composer persist() {
      documentRepository.save(document);
      return this;
    }

    @Override
    public Document get() {
      return this.document;
    }
  }

  public Composer forDocument(Document document) {
    return new Composer(document);
  }
}
