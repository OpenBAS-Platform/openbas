package io.openbas.engine.model.tag;

import io.openbas.database.raw.RawTag;
import io.openbas.database.repository.TagRepository;
import io.openbas.engine.Handler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import static io.openbas.engine.EsUtils.buildRestrictions;

@Service
public class TagHandler implements Handler<EsTag> {

  private TagRepository tagRepository;

  @Autowired
  public void setTagRepository(TagRepository tagRepository) {
    this.tagRepository = tagRepository;
  }

  @Override
  public List<EsTag> fetch(Instant from) {
    Instant queryFrom = from != null ? from : Instant.ofEpochMilli(0);
    List<RawTag> forIndexing = tagRepository.findForIndexing(queryFrom);
    return forIndexing.stream()
        .map(
                tag -> {
              EsTag esTag = new EsTag();
              // Base
              esTag.setBase_id(tag.getTag_id());
              esTag.setBase_representative(tag.getTag_name());
              esTag.setBase_created_at(tag.getTag_created_at());
              esTag.setBase_updated_at(tag.getTag_updated_at());
              // not sure what to put here, if anything
              esTag.setBase_restrictions(buildRestrictions(tag.getTag_id()));

              esTag.setTag_color(tag.getTag_color());
              esTag.setBase_dependencies(new ArrayList<>());
              return esTag;
            })
        .toList();
  }
}
