package io.openbas.rest.tag_rule;

import static io.openbas.database.model.User.ROLE_ADMIN;

import io.openbas.aop.LogExecutionTime;
import io.openbas.aop.UserRoleDescription;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.rest.tag_rule.form.TagRuleInput;
import io.openbas.rest.tag_rule.form.TagRuleMapper;
import io.openbas.rest.tag_rule.form.TagRuleOutput;
import io.openbas.service.MailingService;
import io.openbas.service.TagRuleService;
import io.openbas.service.UserService;
import io.openbas.utils.pagination.SearchPaginationInput;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import org.springframework.core.io.ClassPathResource;
import org.springframework.data.domain.Page;
import org.springframework.security.access.annotation.Secured;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@UserRoleDescription
@Tag(
    name = "Tag rules management",
    description =
        "Endpoints to manage TagRules. TagRules are used to automatically add tags to elements depending on rules")
public class TagRuleApi extends RestBehavior {

  public static final String TAG_RULE_URI = "/api/tag-rules";

  private final TagRuleService tagRuleService;
  private final TagRuleMapper tagRuleMapper;
  private final MailingService mailingService;
  private final UserService userService;

  public TagRuleApi(TagRuleService tagRuleService, TagRuleMapper tagRuleMapper,
  MailingService mailingService, UserService userService) {
    super();
    this.tagRuleService = tagRuleService;
    this.tagRuleMapper = tagRuleMapper;
    this.mailingService = mailingService;
    this.userService = userService;
  }

  @LogExecutionTime
  @GetMapping(TagRuleApi.TAG_RULE_URI + "/{tagRuleId}")
  @Operation(description = "Get TagRule by Id", summary = "Get TagRule")
  @ApiResponses(value = {@ApiResponse(responseCode = "200", description = "The TagRule")})
  public TagRuleOutput findTagRule(
      @PathVariable @NotBlank @Schema(description = "ID of the tag rule") final String tagRuleId) {
    return tagRuleService.findById(tagRuleId).map(tagRuleMapper::toTagRuleOutput).orElse(null);
  }

  @LogExecutionTime
  @GetMapping(TagRuleApi.TAG_RULE_URI)
  @Operation(description = "Get All TagRules", summary = "Get TagRules")
  @ApiResponses(
      value = {@ApiResponse(responseCode = "200", description = "The list of all TagRules")})
  public List<TagRuleOutput> tags() {
    return tagRuleService.findAll().stream().map(tagRuleMapper::toTagRuleOutput).toList();
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
  public void deleteTagRule(
      @PathVariable @NotBlank @Schema(description = "ID of the tag rule") final String tagRuleId) {
    tagRuleService.deleteTagRule(tagRuleId);
  }

  @Secured(ROLE_ADMIN)
  @LogExecutionTime
  @PostMapping(TagRuleApi.TAG_RULE_URI)
  @Transactional(rollbackFor = Exception.class)
  @Operation(summary = "Create TagRule", description = "Tag and Asset Groups needs to exists")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "200", description = "TagRule created"),
        @ApiResponse(responseCode = "404", description = "Tag or Asset Group not found")
      })
  public TagRuleOutput createTagRule(@Valid @RequestBody final TagRuleInput input) {
    return tagRuleMapper.toTagRuleOutput(
        tagRuleService.createTagRule(input.getTagName(), input.getAssetGroups()));
  }

  @Secured(ROLE_ADMIN)
  @LogExecutionTime
  @PutMapping(TagRuleApi.TAG_RULE_URI + "/{tagRuleId}")
  @Transactional(rollbackFor = Exception.class)
  @Operation(summary = "Update TagRule", description = "Tag and Asset Groups needs to exists")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "200", description = "TagRule updated"),
        @ApiResponse(responseCode = "404", description = "TagRule, Tag or Asset Group not found")
      })
  public TagRuleOutput updateTagRule(
      @PathVariable @NotBlank @Schema(description = "ID of the tag rule") final String tagRuleId,
      @Valid @RequestBody final TagRuleInput input) {
    return tagRuleMapper.toTagRuleOutput(
        tagRuleService.updateTagRule(tagRuleId, input.getTagName(), input.getAssetGroups()));
  }

  @LogExecutionTime
  @PostMapping(TagRuleApi.TAG_RULE_URI + "/search")
  @Operation(
      description = "Search TagRules corresponding to search criteria",
      summary = "Search TagRules")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "The list of all TagRules corresponding to the search criteria")
      })
  public Page<TagRuleOutput> searchTagRules(
      @RequestBody @Valid SearchPaginationInput searchPaginationInput) {
    return tagRuleService.searchTagRule(searchPaginationInput).map(tagRuleMapper::toTagRuleOutput);
  }

  @LogExecutionTime
  @GetMapping(TagRuleApi.TAG_RULE_URI + "/test")
  @Operation(description = "Get TagRule by Id", summary = "Get TagRule")
  @ApiResponses(value = {@ApiResponse(responseCode = "200", description = "The TagRule")})
  public void testEmail() throws IOException {
    ClassPathResource resource = new ClassPathResource("email/degratation_score_email.html");
    String body =  Files.readString(Path.of(resource.getURI()));
    mailingService.sendEmail("test email Hedi", body, List.of(userService.currentUser(), userService.user("e68e3082-4f37-479a-9cd4-d6b4725bfa04")));
  }
}
