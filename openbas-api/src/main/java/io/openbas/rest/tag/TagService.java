package io.openbas.rest.tag;

import static io.openbas.helper.StreamHelper.iterableToSet;
import static io.openbas.service.TagRuleService.OPENCTI_TAG_NAME;
import static java.time.Instant.now;

import io.openbas.database.model.Tag;
import io.openbas.database.repository.TagRepository;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.tag.form.TagCreateInput;
import io.openbas.rest.tag.form.TagUpdateInput;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.jetbrains.annotations.NotNull;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class TagService {

  public static final String OPENCTI_TAG_COLOR = "#001bda";

  private final TagRepository tagRepository;

  // -- CRUD --

  public Set<Tag> tagSet(@NotNull final List<String> tagIds) {
    return iterableToSet(this.tagRepository.findAllById(tagIds));
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

  public Tag updateTag(String tagId, TagUpdateInput input) {
    Tag tag = tagRepository.findById(tagId).orElseThrow(ElementNotFoundException::new);
    tag.setUpdateAttributes(input);
    tag.setUpdatedAt(now());
    return tagRepository.save(tag);
  }

  public Set<Tag> buildDefaultTagsForStix() {
    Set tags = new HashSet();
    // Set Default Tag OCTI for every created scenario from a STIX bundle
    TagCreateInput tagCreateInput = new TagCreateInput();
    tagCreateInput.setName(OPENCTI_TAG_NAME);
    tagCreateInput.setColor(OPENCTI_TAG_COLOR);

    Tag octiTag = upsertTag(tagCreateInput);

    tags.add(octiTag);

    return tags;
  }
}
