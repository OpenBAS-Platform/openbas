package io.openbas.rest.tag;

import static io.openbas.helper.StreamHelper.iterableToSet;
import static io.openbas.utils.StringUtils.generateRandomColor;
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

  /**
   * Generate a list of tag from a list of labels
   *
   * @param labels
   * @return list of tags
   */
  public Set<Tag> fetchTagsFromLabels(List<String> labels) {
    Set<Tag> tags = new HashSet();

    if (labels != null) {
      for (String label : labels) {
        if (label == null || label.isBlank()) {
          continue;
        }
        TagCreateInput tagCreateInput = new TagCreateInput();
        tagCreateInput.setName(label);
        tagCreateInput.setColor(generateRandomColor());

        tags.add(upsertTag(tagCreateInput));
      }
    }

    return tags;
  }
}
