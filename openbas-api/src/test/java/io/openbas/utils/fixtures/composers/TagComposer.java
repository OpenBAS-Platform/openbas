package io.openbas.utils.fixtures.composers;

import io.openbas.database.model.Tag;
import io.openbas.database.repository.TagRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class TagComposer {
  @Autowired private TagRepository tagRepository;

  public class Composer extends InnerComposerBase<Tag> {
    private final Tag tag;

    public Composer(Tag tag) {
      this.tag = tag;
    }

    @Override
    public Composer persist() {
      tagRepository.save(tag);
      return this;
    }

    @Override
    public Tag get() {
      return this.tag;
    }
  }

  public Composer forTag(Tag tag) {
    return new Composer(tag);
  }
}
