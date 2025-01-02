package io.openbas.rest.tag_rule.form;

import io.openbas.database.model.Asset;
import io.openbas.database.model.TagRule;
import java.util.stream.Collectors;

public class TagRuleMapper {
  public static TagRuleOutput toTagRuleOutput(final TagRule tagRule) {
    return TagRuleOutput.builder()
        .id(tagRule.getId())
        .tagName(tagRule.getTag().getName())
        .assets(
            tagRule.getAssets().stream().collect(Collectors.toMap(Asset::getId, Asset::getName)))
        .build();
  }

  private TagRuleMapper() {
    throw new UnsupportedOperationException("Cannot instantiate TagRuleMapper");
  }
}
