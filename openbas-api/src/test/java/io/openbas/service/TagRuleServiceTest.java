package io.openbas.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.TestInstance.Lifecycle.PER_CLASS;
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
import io.openbas.utils.fixtures.TagFixture;
import io.openbas.utils.fixtures.TagRuleFixture;
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
    assertEquals(expected, result);
  }

  @Test
  void testDeleteTagRule() {
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
            expected.getId(), expected.getAssets().stream().map(Asset::getId).toList());
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

    TagRule result =
        tagRuleService.createTagRule(
            expected.getId(), expected.getAssets().stream().map(Asset::getId).toList());
    verify(tagRepository).save(any());
    assertEquals(expected, result);
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
            expected.getId(),
            expected.getAssets().stream().map(Asset::getId).toList());
    assertEquals(expected, result);
  }

  @Test
  void testUpdateTagRule_WITH_non_existing_tag() {
    TagRule expected = TagRuleFixture.createTagRule(TAG_RULE_ID);
    Tag tag = TagFixture.getTag();
    when(tagRuleRepository.save(any())).thenReturn(expected);
    when(tagRepository.findByName(expected.getTag().getName())).thenReturn(null);
    when(tagRepository.save(any())).thenReturn(tag);
    when(tagRuleRepository.findById(expected.getId())).thenReturn(Optional.of(expected));
    expected
        .getAssets()
        .forEach(
            asset -> when(assetRepository.findById(asset.getId())).thenReturn(Optional.of(asset)));

    TagRule result =
        tagRuleService.updateTagRule(
            expected.getId(),
            expected.getId(),
            expected.getAssets().stream().map(Asset::getId).toList());
    verify(tagRepository).save(any());
    assertEquals(expected, result);
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
              expected.getId(),
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
              expected.getId(),
              expected.getAssets().stream().map(Asset::getId).toList());
        });
  }
}
