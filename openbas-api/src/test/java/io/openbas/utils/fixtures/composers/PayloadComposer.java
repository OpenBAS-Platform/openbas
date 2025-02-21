package io.openbas.utils.fixtures.composers;

import io.openbas.database.model.Executable;
import io.openbas.database.model.FileDrop;
import io.openbas.database.model.Payload;
import io.openbas.database.model.Tag;
import io.openbas.database.repository.PayloadRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class PayloadComposer extends ComposerBase<Payload> {
  @Autowired PayloadRepository payloadRepository;

  public class Composer extends InnerComposerBase<Payload> {
    private final Payload payload;
    private final List<TagComposer.Composer> tagComposers = new ArrayList<>();
    private Optional<DocumentComposer.Composer> documentComposer = Optional.empty();

    public Composer(Payload payload) {
      this.payload = payload;
    }

    public Composer withTag(TagComposer.Composer tagComposer) {
      tagComposers.add(tagComposer);
      Set<Tag> tempTags = payload.getTags();
      tempTags.add(tagComposer.get());
      payload.setTags(tempTags);
      return this;
    }

    public Composer withFileDrop(DocumentComposer.Composer newDocumentComposer) {
      if(!(payload instanceof FileDrop)) { throw new IllegalArgumentException("Payload is not a FileDrop"); }
      documentComposer = Optional.of(newDocumentComposer);
      ((FileDrop) payload).setFileDropFile(newDocumentComposer.get());
      return this;
    }

    public Composer withExecutable(DocumentComposer.Composer newDocumentComposer) {
      if(!(payload instanceof Executable)) { throw new IllegalArgumentException("Payload is not a Executable"); }
      documentComposer = Optional.of(newDocumentComposer);
      ((Executable) payload).setExecutableFile(newDocumentComposer.get());
      return this;
    }

    @Override
    public Composer persist() {
      documentComposer.ifPresent(DocumentComposer.Composer::persist);
      tagComposers.forEach(TagComposer.Composer::persist);
      payload.setId(null);
      payloadRepository.save(payload);
      return this;
    }

    @Override
    public Composer delete() {
      documentComposer.ifPresent(DocumentComposer.Composer::delete);
      tagComposers.forEach(TagComposer.Composer::delete);
      payloadRepository.delete(payload);
      return this;
    }

    @Override
    public Payload get() {
      return this.payload;
    }
  }

  public Composer forPayload(Payload payload) {
    this.generatedItems.add(payload);
    return new Composer(payload);
  }
}
