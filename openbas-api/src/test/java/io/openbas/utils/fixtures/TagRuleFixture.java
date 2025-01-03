package io.openbas.utils.fixtures;

import io.openbas.database.model.Asset;
import io.openbas.database.model.Tag;
import io.openbas.database.model.TagRule;
import io.openbas.rest.tag_rule.form.TagRuleInput;
import io.openbas.rest.tag_rule.form.TagRuleOutput;
import java.util.List;
import java.util.Map;

public class TagRuleFixture {
  public static final String TAG_RULE_ID = "tagruleid";
  public static final String TAG_RULE_ID_2 = "tagruleid2";
  public static final String TAG_NAME = "testtag";
  public static final String ASSET_ID_1 = "asset1";
  public static final String ASSET_ID_2 = "asset2";
  public static final String ASSET_NAME_1 = "name 1";
  public static final String ASSET_NAME_2 = "name 2";

  public static TagRule createTagRule(String tagRuleId) {

    Tag tag = new Tag();
    tag.setName(TAG_NAME);

    Asset asset1 = new Asset();
    asset1.setId(ASSET_ID_1);
    asset1.setName(ASSET_NAME_1);
    Asset asset2 = new Asset();
    asset2.setId(ASSET_ID_2);
    asset2.setName(ASSET_NAME_2);

    TagRule rule = new TagRule();
    rule.setAssets(List.of(asset1, asset2));
    rule.setTag(tag);
    rule.setId(tagRuleId);

    return rule;
  }

  public static TagRule createTagRule(String tagRuleId, List<Asset> assets) {
    Tag tag = new Tag();
    tag.setName(TAG_NAME);

    TagRule rule = new TagRule();
    rule.setAssets(assets);
    rule.setTag(tag);
    rule.setId(tagRuleId);

    return rule;
  }

  public static TagRuleOutput createTagRuleOutput() {
    return TagRuleOutput.builder()
        .tagName(TAG_NAME)
        .assets(
            Map.ofEntries(Map.entry(ASSET_ID_1, ASSET_NAME_1), Map.entry(ASSET_ID_2, ASSET_NAME_1)))
        .build();
  }

  public static TagRuleInput createTagRuleInput() {
    return TagRuleInput.builder()
        .tagName(TagRuleFixture.TAG_NAME)
        .assets(List.of(ASSET_ID_1, ASSET_ID_2))
        .build();
  }
}
