package io.openbas.rest.notification_rule;

import static io.openbas.database.model.User.ROLE_ADMIN;

import io.openbas.aop.LogExecutionTime;
import io.openbas.aop.UserRoleDescription;
import io.openbas.rest.notification_rule.form.CreateNotificationRuleInput;
import io.openbas.rest.notification_rule.form.NotificationRuleMapper;
import io.openbas.rest.notification_rule.form.NotificationRuleOutput;
import io.openbas.rest.notification_rule.form.UpdateNotificationRuleInput;
import io.openbas.service.NotificationRuleService;
import io.openbas.utils.pagination.SearchPaginationInput;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@UserRoleDescription
@Tag(
    name = "Notification rules management",
    description =
        "Endpoints to manage NotificationRules. NotificationRules are used to subscribe to notifications. As of today, only scenario degradation score is supported.")
public class NotificationRuleApi {

  public static final String NOTIFICATION_RULE_URI = "/api/notification-rules";

  private final NotificationRuleService notificationRuleService;
  private final NotificationRuleMapper notificationRuleMapper;

  public NotificationRuleApi(
      NotificationRuleService notificationRuleService,
      NotificationRuleMapper notificationRuleMapper) {
    super();
    this.notificationRuleService = notificationRuleService;
    this.notificationRuleMapper = notificationRuleMapper;
  }

  @Secured(ROLE_ADMIN)
  @LogExecutionTime
  @GetMapping(NOTIFICATION_RULE_URI + "/{notificationRuleId}")
  @Operation(description = "Get NotificationRule by Id", summary = "Get NotificationRule")
  @ApiResponses(value = {@ApiResponse(responseCode = "200", description = "The NotificationRule")})
  public NotificationRuleOutput findNotificationRule(
      @PathVariable @NotBlank @Schema(description = "ID of the notification rule")
          final String notificationRuleId) {
    return notificationRuleService
        .findById(notificationRuleId)
        .map(notificationRuleMapper::toNotificationRuleOutput)
        .orElse(null);
  }

  @Secured(ROLE_ADMIN)
  @LogExecutionTime
  @GetMapping(NOTIFICATION_RULE_URI)
  @Operation(description = "Get All NotificationRules", summary = "Get NotificationRules")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "200", description = "The list of all NotificationRules")
      })
  public List<NotificationRuleOutput> notificationRules() {
    return notificationRuleService.findAll().stream()
        .map(notificationRuleMapper::toNotificationRuleOutput)
        .toList();
  }

  @Secured(ROLE_ADMIN)
  @LogExecutionTime
  @DeleteMapping(NOTIFICATION_RULE_URI + "/{notificationRuleId}")
  @Transactional(rollbackFor = Exception.class)
  @Operation(summary = "Delete NotificationRule", description = "NotificationRule needs to exists")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "200", description = "NotificationRule deleted"),
        @ApiResponse(responseCode = "404", description = "NotificationRule not found")
      })
  @PreAuthorize("isScenarioPlanner(#scenarioId)")
  public void deleteNotificationRule(
      @PathVariable @NotBlank @Schema(description = "ID of the notification rule")
          final String notificationRuleId) {
    notificationRuleService.deleteNotificationRule(notificationRuleId);
  }

  @Secured(ROLE_ADMIN)
  @LogExecutionTime
  @PostMapping(NOTIFICATION_RULE_URI)
  @Transactional(rollbackFor = Exception.class)
  @Operation(summary = "Create NotificationRule", description = "Create a NotificationRule")
  @ApiResponses(
          value = {
                  @ApiResponse(responseCode = "200", description = "NotificationRule created"),
                  @ApiResponse(responseCode = "404", description = "Resource not found")
          })
  public NotificationRuleOutput createNotificationRule(
      @Valid @RequestBody final CreateNotificationRuleInput input) {
    return notificationRuleMapper.toNotificationRuleOutput(
        notificationRuleService.createNotificationRule(
            notificationRuleMapper.toNotificationRule(input)));
  }

  @Secured(ROLE_ADMIN)
  @LogExecutionTime
  @PutMapping(NOTIFICATION_RULE_URI + "/{notificationRuleId}")
  @Transactional(rollbackFor = Exception.class)
  @Operation(summary = "Update NotificationRule", description = "Update a NotificationRule")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "200", description = "NotificationRule updated"),
        @ApiResponse(responseCode = "404", description = "NotificationRule not found")
      })
  public NotificationRuleOutput updateNotificationRule(
      @PathVariable @NotBlank @Schema(description = "ID of the notification rule")
          final String notificationRuleId,
      @Valid @RequestBody final UpdateNotificationRuleInput input) {
    return notificationRuleMapper.toNotificationRuleOutput(
        notificationRuleService.updateNotificationRule(notificationRuleId, input.getSubject()));
  }

  @Secured(ROLE_ADMIN)
  @LogExecutionTime
  @PostMapping(NOTIFICATION_RULE_URI + "/search")
  @Operation(
      description = "Search NotificationRules corresponding to search criteria",
      summary = "Search NotificationRules")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "The list of all NotificationRules corresponding to the search criteria")
      })
  public Page<NotificationRuleOutput> searchNotificationRules(
      @RequestBody @Valid SearchPaginationInput searchPaginationInput) {
    return notificationRuleService
        .searchNotificationRule(searchPaginationInput)
        .map(notificationRuleMapper::toNotificationRuleOutput);
  }
}
