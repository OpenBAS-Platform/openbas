package io.openbas.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import io.openbas.database.model.Asset;
import io.openbas.database.model.Tag;
import io.openbas.database.model.TagRule;
import io.openbas.database.repository.AssetRepository;
import io.openbas.database.repository.TagRepository;
import io.openbas.database.repository.TagRuleRepository;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.utils.fixtures.AssetFixture;
import io.openbas.utils.fixtures.TagFixture;
import io.openbas.utils.fixtures.TagRuleFixture;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
public class TagRuleServiceTest {
  private static final String TAG_RULE_ID = "tagruleid";
  private static final String TAG_RULE_ID_2 = "tagruleid2";

  @Mock private TagRuleRepository tagRuleRepository;

  @Mock private AssetRepository assetRepository;

  @Mock private TagRepository tagRepository;

  @InjectMocks private TagRuleService tagRuleService;

  @Test
  void testFindById() {
    TagRule expected = TagRuleFixture.createTagRule(TAG_RULE_ID);
    when(tagRuleRepository.findById(TAG_RULE_ID)).thenReturn(Optional.of(expected));
    Optional<TagRule> result = tagRuleService.findById(TAG_RULE_ID);
    assertEquals(expected, result.get());
  }

  @Test
  void testFindAll() {
    List<TagRule> expected =
        List.of(
            TagRuleFixture.createTagRule(TAG_RULE_ID), TagRuleFixture.createTagRule(TAG_RULE_ID_2));
    when(tagRuleRepository.findAll()).thenReturn(expected);

    List<TagRule> result = tagRuleService.findAll();
    assertEquals(new HashSet<>(expected), new HashSet<>(result));
  }

  @Test
  void testDeleteTagRule() {
    TagRule expected = TagRuleFixture.createTagRule(TAG_RULE_ID);
    when(tagRuleRepository.findById(TAG_RULE_ID)).thenReturn(Optional.of(expected));
    tagRuleService.deleteTagRule(TAG_RULE_ID);
    verify(tagRuleRepository).deleteById(TAG_RULE_ID);
  }

  @Test
  void testCreateTagRule() {
    TagRule expected = TagRuleFixture.createTagRule(TAG_RULE_ID);
    when(tagRuleRepository.save(any())).thenReturn(expected);
    when(tagRepository.findByName(expected.getTag().getName()))
        .thenReturn(Optional.of(TagFixture.getTag()));
    expected
        .getAssets()
        .forEach(
            asset -> when(assetRepository.findById(asset.getId())).thenReturn(Optional.of(asset)));

    TagRule result =
        tagRuleService.createTagRule(
            expected.getTag().getName(), expected.getAssets().stream().map(Asset::getId).toList());
    assertEquals(expected, result);
  }

  @Test
  void testCreateTagRule_WITH_non_existing_tag() {
    TagRule expected = TagRuleFixture.createTagRule(TAG_RULE_ID);
    Tag tag = TagFixture.getTag();
    when(tagRuleRepository.save(any())).thenReturn(expected);
    when(tagRepository.findByName(expected.getTag().getName())).thenReturn(null);
    when(tagRepository.save(any())).thenReturn(tag);
    expected
        .getAssets()
        .forEach(
            asset -> when(assetRepository.findById(asset.getId())).thenReturn(Optional.of(asset)));
    assertThrows(
        ElementNotFoundException.class,
        () -> {
          tagRuleService.createTagRule(
              expected.getId(), expected.getAssets().stream().map(Asset::getId).toList());
        });
  }

  @Test
  void testCreateTagRule_WITH_non_existing_asset() {
    TagRule expected = TagRuleFixture.createTagRule(TAG_RULE_ID);
    when(tagRuleRepository.save(any())).thenReturn(expected);
    when(tagRepository.findByName(expected.getTag().getName()))
        .thenReturn(Optional.of(TagFixture.getTag()));
    expected
        .getAssets()
        .forEach(
            asset -> when(assetRepository.findById(asset.getId())).thenReturn(Optional.empty()));
    assertThrows(
        ElementNotFoundException.class,
        () -> {
          TagRule result =
              tagRuleService.createTagRule(
                  expected.getId(), expected.getAssets().stream().map(Asset::getId).toList());
        });
  }

  @Test
  void testUpdateTagRule() {
    TagRule expected = TagRuleFixture.createTagRule(TAG_RULE_ID);
    when(tagRuleRepository.save(any())).thenReturn(expected);
    when(tagRepository.findByName(expected.getTag().getName()))
        .thenReturn(Optional.of(TagFixture.getTag()));
    when(tagRuleRepository.findById(expected.getId())).thenReturn(Optional.of(expected));
    expected
        .getAssets()
        .forEach(
            asset -> when(assetRepository.findById(asset.getId())).thenReturn(Optional.of(asset)));

    TagRule result =
        tagRuleService.updateTagRule(
            expected.getId(),
            expected.getTag().getName(),
            expected.getAssets().stream().map(Asset::getId).toList());
    assertEquals(expected, result);
  }

  @Test
  void testUpdateTagRule_WITH_non_existing_tag() {
    TagRule expected = TagRuleFixture.createTagRule(TAG_RULE_ID);
    Tag tag = TagFixture.getTag();
    when(tagRuleRepository.save(any())).thenReturn(expected);
    when(tagRepository.findByName(expected.getTag().getName())).thenReturn(Optional.empty());
    when(tagRepository.save(any())).thenReturn(tag);
    when(tagRuleRepository.findById(expected.getId())).thenReturn(Optional.of(expected));
    expected
        .getAssets()
        .forEach(
            asset -> when(assetRepository.findById(asset.getId())).thenReturn(Optional.of(asset)));
    assertThrows(
        ElementNotFoundException.class,
        () -> {
          tagRuleService.updateTagRule(
              expected.getId(),
              expected.getTag().getName(),
              expected.getAssets().stream().map(Asset::getId).toList());
        });
  }

  @Test
  void testUpdateTagRule_WITH_non_existing_asset() {
    TagRule expected = TagRuleFixture.createTagRule(TAG_RULE_ID);
    when(tagRuleRepository.save(any())).thenReturn(expected);
    when(tagRepository.findByName(expected.getTag().getName()))
        .thenReturn(Optional.of(TagFixture.getTag()));
    when(tagRuleRepository.findById(expected.getId())).thenReturn(Optional.of(expected));
    expected
        .getAssets()
        .forEach(
            asset -> when(assetRepository.findById(asset.getId())).thenReturn(Optional.empty()));
    assertThrows(
        ElementNotFoundException.class,
        () -> {
          tagRuleService.updateTagRule(
              expected.getId(),
              expected.getTag().getName(),
              expected.getAssets().stream().map(Asset::getId).toList());
        });
  }

  @Test
  void testUpdateTagRule_WITH_non_existing_tag_rule() {
    TagRule expected = TagRuleFixture.createTagRule(TAG_RULE_ID);
    when(tagRuleRepository.findById(expected.getId())).thenReturn(Optional.empty());
    assertThrows(
        ElementNotFoundException.class,
        () -> {
          tagRuleService.updateTagRule(
              expected.getId(),
              expected.getTag().getName(),
              expected.getAssets().stream().map(Asset::getId).toList());
        });
  }

  @Test
  void testGetAssetsFromTagIds() {
    List<String> tagIds = List.of("tag1");
    TagRule tagRule = TagRuleFixture.createTagRule(TAG_RULE_ID);
    when(tagRuleRepository.findByTags(tagIds)).thenReturn(List.of(tagRule));
    assertEquals(
        new HashSet<>(tagRule.getAssets()),
        new HashSet<>(tagRuleService.getAssetsFromTagIds(tagIds)));
  }

  @Test
  void testApplyTagRuleToInjectCreation() throws Exception {
    Asset asset1 = AssetFixture.createDefaultAsset("asset1");
    Asset asset2 = AssetFixture.createDefaultAsset("asset2");
    Asset asset3 = AssetFixture.createDefaultAsset("asset3");
    Asset asset4 = AssetFixture.createDefaultAsset("asset4");

    Tag tag1 = TagFixture.getTag("tag2");
    Tag tag2 = TagFixture.getTag("tag3");

    List<Asset> currentAssets = List.of(asset1, asset2);
    List<Asset> defaultAssets = List.of(asset2, asset3, asset4);
    TagRule tagRule = TagRuleFixture.createTagRule("tag_rule1", defaultAssets);

    when(tagRuleRepository.findByTags(List.of(tag1.getId(), tag2.getId())))
        .thenReturn(List.of(tagRule));

    List<Asset> result =
        tagRuleService.applyTagRuleToInjectCreation(
            List.of(tag1.getId(), tag2.getId()), currentAssets);
    List<Asset> expected = List.of(asset1, asset2, asset3, asset4);
    assertEquals(new HashSet<>(expected), new HashSet<>(result));
  }
}
