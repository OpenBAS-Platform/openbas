package io.openbas.rest.tag;

import static io.openbas.helper.StreamHelper.fromIterable;

import io.openbas.database.model.Tag;
import io.openbas.database.repository.TagRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.jetbrains.annotations.NotNull;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class TagService {

  private final TagRepository tagRepository;

  // -- CRUD --

  public List<Tag> tags(@NotNull final List<String> tagIds) {
    return fromIterable(this.tagRepository.findAllById(tagIds));
  }
}
