package io.openbas.service;

import static io.openbas.utils.pagination.PaginationUtils.buildPaginationJPA;

import io.openbas.database.model.*;
import io.openbas.database.repository.NotificationRuleRepository;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.transaction.Transactional;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class NotificationRuleService {
  private final NotificationRuleRepository notificationRuleRepository;

  private final UserService userService;
  private final ScenarioService scenarioService;
  private final EmailNotificationService emailNotificationService;
  private final PlatformSettingsService platformSettingsService;

  public Optional<NotificationRule> findById(final String id) {
    return notificationRuleRepository.findById(id);
  }

  public List<NotificationRule> findAll() {
    return StreamSupport.stream(notificationRuleRepository.findAll().spliterator(), false)
        .collect(Collectors.toList());
  }

  public List<NotificationRule> findNotificationRuleByResource(@NotBlank final String resourceId) {
    return notificationRuleRepository.findNotificationRuleByResource(resourceId);
  }

  public List<NotificationRule> findNotificationRuleByResourceAndUser(
      @NotBlank final String resourceId, @NotBlank final String userId) {

    return notificationRuleRepository.findNotificationRuleByResourceAndUser(resourceId, userId);
  }

  public NotificationRule createNotificationRule(@NotNull final NotificationRule notificationRule) {
    User currentUser = userService.currentUser();
    if (NotificationRuleResourceType.SCENARIO.equals(notificationRule.getResourceType())) {
      // verify if the scenario exists
      if (scenarioService.scenario(notificationRule.getResourceId()) == null) {
        new ElementNotFoundException(
            "Scenario not found with id: " + notificationRule.getResourceId());
      }
    } else {
      // currently only scenario is supported
      throw new UnsupportedOperationException(
          "Unsupported resource type: " + notificationRule.getResourceType().name());
    }
    notificationRule.setOwner(currentUser);
    return notificationRuleRepository.save(notificationRule);
  }

  public NotificationRule updateNotificationRule(
      @NotBlank final String id, @NotBlank final String subject) {
    // verify that the rule exists
    NotificationRule notificationRule =
        notificationRuleRepository
            .findById(id)
            .orElseThrow(
                () -> new ElementNotFoundException("NotificationRule not found with id: " + id));

    notificationRule.setSubject(subject);

    return notificationRuleRepository.save(notificationRule);
  }

  public void deleteNotificationRule(@NotBlank final String id) {
    // verify that the rule exists
    notificationRuleRepository
        .findById(id)
        .orElseThrow(
            () -> new ElementNotFoundException("NotificationRule not found with id: " + id));

    notificationRuleRepository.deleteById(id);
  }

  public Page<NotificationRule> searchNotificationRule(
      @NotNull final SearchPaginationInput searchPaginationInput) {
    return buildPaginationJPA(
        notificationRuleRepository::findAll, searchPaginationInput, NotificationRule.class);
  }

  @Transactional
  public void activateNotificationRules(
      @NotNull final String resourceId,
      @NotNull final NotificationRuleTrigger trigger,
      @NotNull final Map<String, String> data) {
    List<NotificationRule> rules =
        notificationRuleRepository.findNotificationRuleByResourceAndTrigger(resourceId, trigger);

    //add data about custom logo and whitemarked platform
    if(!rules.isEmpty()) {
      String b64CustomLogo =
              platformSettingsService
                      .setting(Theme.THEME_KEYS.LOGO_URL.name())
                      .map(setting -> downloadImageAndEncodeBase64(setting.getValue()))
                      .orElse("");
      data.put("custom_logo_b64", b64CustomLogo);
      data.put(
              "hide_filigran_logo", Boolean.toString(platformSettingsService.isPlatformWhiteMarked()));

    }

    for (NotificationRule rule : rules) {
      if (NotificationRuleType.EMAIL.equals(rule.getType())) {
        emailNotificationService.sendNotification(rule, data);
      }
    }
  }


  // TODO find a better place for this code
  private String downloadImageAndEncodeBase64(String imageUrl) {
    try (InputStream inputStream = new URL(imageUrl).openStream()) {
      byte[] imageBytes = inputStream.readAllBytes();
      return Base64.getEncoder().encodeToString(imageBytes);
    } catch (IOException e) {
      throw new RuntimeException("error while downloading custom logo " + imageUrl, e);
    }
  }
}
