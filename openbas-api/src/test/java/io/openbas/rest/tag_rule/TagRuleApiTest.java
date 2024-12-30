package io.openbas.rest.tag_rule;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import io.openbas.database.model.TagRule;
import io.openbas.rest.tag_rule.form.TagRuleMapper;
import io.openbas.rest.tag_rule.form.TagRuleOutput;
import io.openbas.service.TagRuleService;
import io.openbas.utils.fixtures.PaginationFixture;
import io.openbas.utils.fixtures.TagRuleFixture;
import io.openbas.utils.pagination.SearchPaginationInput;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;

@SpringBootTest
public class TagRuleApiTest {
  private static final String TAG_RULE_ID = "tagruleid";
  private static final String TAG_RULE_ID_2 = "tagruleid2";

  @Mock private TagRuleService tagRuleService;

  @InjectMocks private TagRuleApi tagRuleApi;

  @Test
  void testCreateTagRule() {
    when(tagRuleService.createTagRule(any(), any()))
        .thenReturn(TagRuleFixture.createTagRule(TAG_RULE_ID));

    tagRuleApi.createTagRule(TagRuleFixture.createTagRuleInput());
    verify(tagRuleService)
        .createTagRule(
            TagRuleFixture.TAG_NAME, List.of(TagRuleFixture.ASSET_ID_1, TagRuleFixture.ASSET_ID_2));
  }

  @Test
  void testUpdateTagRule() {
    when(tagRuleService.updateTagRule(
            TAG_RULE_ID,
            TagRuleFixture.TAG_NAME,
            List.of(TagRuleFixture.ASSET_ID_1, TagRuleFixture.ASSET_ID_2)))
        .thenReturn(TagRuleFixture.createTagRule(TAG_RULE_ID));

    tagRuleApi.updateTagRule(TAG_RULE_ID, TagRuleFixture.createTagRuleInput());
    verify(tagRuleService)
        .updateTagRule(
            TAG_RULE_ID,
            TagRuleFixture.TAG_NAME,
            List.of(TagRuleFixture.ASSET_ID_1, TagRuleFixture.ASSET_ID_2));
  }

  @Test
  void testDeleteTagRule() {
    tagRuleApi.deleteTagRule(TAG_RULE_ID);
    verify(tagRuleService).deleteTagRule(TAG_RULE_ID);
  }

  @Test
  void testSearchTagRule() {
    SearchPaginationInput searchPaginationInput = PaginationFixture.getDefault().size(1110).build();

    List<TagRule> tagRules =
        List.of(
            TagRuleFixture.createTagRule(TAG_RULE_ID),
            TagRuleFixture.createTagRule(TagRuleFixture.TAG_RULE_ID_2));
    List<TagRuleOutput> expected = tagRules.stream().map(TagRuleMapper::toTagRuleOutput).toList();
    when(tagRuleService.searchTagRule(searchPaginationInput))
        .thenReturn(PaginationFixture.pagedOutput(tagRules));

    Page<TagRuleOutput> result = tagRuleApi.searchTagRules(searchPaginationInput);
    verify(tagRuleService).searchTagRule(searchPaginationInput);
    assertEquals(expected, result.get().toList());
  }

  @Test
  void testGetTagRule() {
    TagRule tagRule = TagRuleFixture.createTagRule(TAG_RULE_ID);
    when(tagRuleService.findById(TAG_RULE_ID)).thenReturn(Optional.of(tagRule));

    TagRuleOutput result = tagRuleApi.findTagRule(TAG_RULE_ID);
    verify(tagRuleService).findById(TAG_RULE_ID);
    assertEquals(TagRuleMapper.toTagRuleOutput(tagRule), result);
  }

  @Test
  void testGetTagRule_WHEN_empty() {
    when(tagRuleService.findById(TAG_RULE_ID)).thenReturn(Optional.empty());

    TagRuleOutput result = tagRuleApi.findTagRule(TAG_RULE_ID);
    verify(tagRuleService).findById(TAG_RULE_ID);
    assertNull(result);
  }

  @Test
  void testGetTagRules() {
    List<TagRule> tagRules =
        List.of(
            TagRuleFixture.createTagRule(TAG_RULE_ID), TagRuleFixture.createTagRule(TAG_RULE_ID_2));
    when(tagRuleService.findAll()).thenReturn(tagRules);

    List<TagRuleOutput> result = tagRuleApi.tags();
    List<TagRuleOutput> expected = tagRules.stream().map(TagRuleMapper::toTagRuleOutput).toList();
    assertEquals(new HashSet<>(expected), new HashSet<>(result));

  }
}
