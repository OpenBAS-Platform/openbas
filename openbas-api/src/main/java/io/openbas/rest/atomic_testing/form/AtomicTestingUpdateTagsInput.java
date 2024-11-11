package io.openbas.rest.atomic_testing.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class AtomicTestingUpdateTagsInput {

  @JsonProperty("atomic_tags")
  private List<String> tagIds;
}
