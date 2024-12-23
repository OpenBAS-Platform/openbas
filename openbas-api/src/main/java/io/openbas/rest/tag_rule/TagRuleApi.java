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
  @Operation(summary = "Delete TagRule")
  public void deleteTagRule(@PathVariable @NotBlank final String tagRuleId) {
    this.tagRuleService.deleteTagRule(tagRuleId);
  }

  @Secured(ROLE_ADMIN)
  @LogExecutionTime
  @PostMapping(TagRuleApi.TAG_RULE_URI)
  @Transactional(rollbackFor = Exception.class)
  @Operation(
      summary = "Create TagRule",
      description = "If the Tag doesn't exist, it will be created")
  public TagRuleOutput createTagRule(@Valid @RequestBody final TagRuleInput input) {
    return TagRuleMapper.toTagRuleOutput(
        this.tagRuleService.createTagRule(input.getTagName(), input.getAssets()));
  }

  @Secured(ROLE_ADMIN)
  @LogExecutionTime
  @PutMapping(TagRuleApi.TAG_RULE_URI + "/{tagRuleId}")
  @Transactional(rollbackFor = Exception.class)
  @Operation(
      summary = "Update TagRule",
      description = "If the Tag doesn't exist, it will be created")
  public TagRuleOutput updateTagRule(
      @PathVariable @NotBlank final String tagRuleId,
      @Valid @RequestBody final TagRuleInput input) {
    return TagRuleMapper.toTagRuleOutput(
        this.tagRuleService.updateTagRule(tagRuleId, input.getTagName(), input.getAssets()));
  }

  @LogExecutionTime
  @PostMapping(TagRuleApi.TAG_RULE_URI + "/search")
  @Operation(
      summary = "Search TagRule",
      description = "Tries to connect to dependencies (DB/Minio/RabbitMQ)")
  public Page<TagRuleOutput> searchTagRules(
      @RequestBody @Valid SearchPaginationInput searchPaginationInput) {
    return this.tagRuleService
        .searchTagRule(searchPaginationInput)
        .map(TagRuleMapper::toTagRuleOutput);
  }
}
