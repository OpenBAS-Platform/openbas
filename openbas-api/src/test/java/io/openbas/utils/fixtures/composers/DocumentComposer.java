package io.openbas.utils.fixtures.composers;

import io.openbas.database.model.Document;
import io.openbas.database.model.Tag;
import io.openbas.database.repository.DocumentRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class DocumentComposer extends ComposerBase<Document> {
  @Autowired private DocumentRepository documentRepository;

  public class Composer extends InnerComposerBase<Document> {
    private final Document document;
    private final List<TagComposer.Composer> tagComposers = new ArrayList<>();

    public Composer(Document document) {
      this.document = document;
    }

    public Composer withTag(TagComposer.Composer tagComposer) {
      tagComposers.add(tagComposer);
      Set<Tag> tempTags = this.document.getTags();
      tempTags.add(tagComposer.get());
      this.document.setTags(tempTags);
      return this;
    }

    public Composer withId(String id) {
      this.document.setId(id);
      return this;
    }

    @Override
    public Composer persist() {
      this.tagComposers.forEach(TagComposer.Composer::persist);
      documentRepository.save(document);
      return this;
    }

    @Override
    public Composer delete() {
      documentRepository.delete(document);
      this.tagComposers.forEach(TagComposer.Composer::delete);
      return this;
    }

    @Override
    public Document get() {
      return this.document;
    }
  }

  public Composer forDocument(Document document) {
    generatedItems.add(document);
    return new Composer(document);
  }
}
