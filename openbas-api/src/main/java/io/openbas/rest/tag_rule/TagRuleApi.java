package io.openbas.rest.tag_rule;

import static io.openbas.database.model.User.ROLE_ADMIN;

import io.openbas.aop.LogExecutionTime;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.rest.tag_rule.form.TagRuleInput;
import io.openbas.rest.tag_rule.form.TagRuleMapper;
import io.openbas.rest.tag_rule.form.TagRuleOutput;
import io.openbas.service.TagRuleService;
import io.openbas.utils.pagination.SearchPaginationInput;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.security.access.annotation.Secured;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
public class TagRuleApi extends RestBehavior {

  public static final String TAG_RULE_URI = "/api/tag-rules";

  private final TagRuleService tagRuleService;

  public TagRuleApi(TagRuleService tagRuleService) {
    super();
    this.tagRuleService = tagRuleService;
  }

  @LogExecutionTime
  @GetMapping(TagRuleApi.TAG_RULE_URI + "/{tagRuleId}")
  @Operation(summary = "Get TagRule by Id")
  public TagRuleOutput findTagRule(@PathVariable @NotBlank final String tagRuleId) {
    return tagRuleService.findById(tagRuleId).map(TagRuleMapper::toTagRuleOutput).orElse(null);
  }

  @LogExecutionTime
  @GetMapping(TagRuleApi.TAG_RULE_URI)
  @Operation(summary = "Get All TagRules")
  public List<TagRuleOutput> tags() {
    return tagRuleService.findAll().stream().map(TagRuleMapper::toTagRuleOutput).toList();
  }

  @Secured(ROLE_ADMIN)
  @LogExecutionTime
  @DeleteMapping(TagRuleApi.TAG_RULE_URI + "/{tagRuleId}")
  @Transactional(rollbackFor = Exception.class)
  @Operation(summary = "Delete TagRule", description = "TagRule needs to exists")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "200", description = "TagRule deleted"),
        @ApiResponse(responseCode = "404", description = "TagRule not found")
      })
  public void deleteTagRule(@PathVariable @NotBlank final String tagRuleId) {
    this.tagRuleService.deleteTagRule(tagRuleId);
  }

  @Secured(ROLE_ADMIN)
  @LogExecutionTime
  @PostMapping(TagRuleApi.TAG_RULE_URI)
  @Transactional(rollbackFor = Exception.class)
  @Operation(summary = "Create TagRule", description = "Tag and assets needs to exists")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "200", description = "TagRule created"),
        @ApiResponse(responseCode = "404", description = "Tag or Asset not found")
      })
  public TagRuleOutput createTagRule(@Valid @RequestBody final TagRuleInput input) {
    return TagRuleMapper.toTagRuleOutput(
        this.tagRuleService.createTagRule(input.getTagName(), input.getAssets()));
  }

  @Secured(ROLE_ADMIN)
  @LogExecutionTime
  @PutMapping(TagRuleApi.TAG_RULE_URI + "/{tagRuleId}")
  @Transactional(rollbackFor = Exception.class)
  @Operation(summary = "Update TagRule", description = "Tag and assets needs to exists")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "200", description = "TagRule updated"),
        @ApiResponse(responseCode = "404", description = "TagRule, Tag  or Asset not found")
      })
  public TagRuleOutput updateTagRule(
      @PathVariable @NotBlank final String tagRuleId,
      @Valid @RequestBody final TagRuleInput input) {
    return TagRuleMapper.toTagRuleOutput(
        this.tagRuleService.updateTagRule(tagRuleId, input.getTagName(), input.getAssets()));
  }

  @LogExecutionTime
  @PostMapping(TagRuleApi.TAG_RULE_URI + "/search")
  @Operation(summary = "Search TagRule")
  public Page<TagRuleOutput> searchTagRules(
      @RequestBody @Valid SearchPaginationInput searchPaginationInput) {
    return this.tagRuleService
        .searchTagRule(searchPaginationInput)
        .map(TagRuleMapper::toTagRuleOutput);
  }
}
