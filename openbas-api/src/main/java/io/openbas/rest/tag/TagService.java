package io.openbas.rest.tag;

import static io.openbas.helper.StreamHelper.fromIterable;

import io.openbas.database.model.Tag;
import io.openbas.database.repository.TagRepository;

import java.util.List;
import java.util.Optional;

import io.openbas.rest.tag.form.TagCreateInput;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.jetbrains.annotations.NotNull;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;

@RequiredArgsConstructor
@Service
public class TagService {

  private final TagRepository tagRepository;

  // -- CRUD --

  public List<Tag> tags(@NotNull final List<String> tagIds) {
    return fromIterable(this.tagRepository.findAllById(tagIds));
  }

  public Tag upsertTag(TagCreateInput input) {
    Optional<Tag> tag = tagRepository.findByName(input.getName());
    if (tag.isPresent()) {
      return tag.get();
    } else {
      Tag newTag = new Tag();
      newTag.setUpdateAttributes(input);
      return tagRepository.save(newTag);
    }
  }
}
