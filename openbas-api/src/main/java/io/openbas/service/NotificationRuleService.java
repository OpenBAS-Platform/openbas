package io.openbas.service;

import static io.openbas.utils.pagination.PaginationUtils.buildPaginationJPA;

import io.openbas.database.model.NotificationRule;
import io.openbas.database.model.NotificationRuleResourceType;
import io.openbas.database.model.User;
import io.openbas.database.repository.NotificationRuleRepository;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
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

  public Optional<NotificationRule> findById(final String id) {
    return notificationRuleRepository.findById(id);
  }

  public List<NotificationRule> findAll() {
    return StreamSupport.stream(notificationRuleRepository.findAll().spliterator(), false)
        .collect(Collectors.toList());
  }

  public NotificationRule createNotificationRule(final NotificationRule notificationRule) {
    User currentUser = userService.currentUser();
    if (NotificationRuleResourceType.SCENARIO.equals(notificationRule.getResourceType())) {
      if (scenarioService.scenario(notificationRule.getResourceId()) == null) {
        new ElementNotFoundException(
            "Scenario not found with id: " + notificationRule.getResourceId());
      }
    } else {
      throw new UnsupportedOperationException(
          "Unsupported resource type: " + notificationRule.getResourceType().name());
    }
    notificationRule.setOwner(currentUser);
    return notificationRuleRepository.save(notificationRule);
  }

  public NotificationRule updateNotificationRule(final String id, @NotBlank final String subject) {
    // verify that the rule exists
    NotificationRule notificationRule =
        notificationRuleRepository
            .findById(id)
            .orElseThrow(
                () -> new ElementNotFoundException("NotificationRule not found with id: " + id));

    notificationRule.setSubject(subject);

    return notificationRuleRepository.save(notificationRule);
  }

  public void deleteNotificationRule(final String id) {
    // verify that the rule exists
    notificationRuleRepository
        .findById(id)
        .orElseThrow(
            () -> new ElementNotFoundException("NotificationRule not found with id: " + id));

    notificationRuleRepository.deleteById(id);
  }

  public Page<NotificationRule> searchNotificationRule(
      final SearchPaginationInput searchPaginationInput) {
    return buildPaginationJPA(
        notificationRuleRepository::findAll, searchPaginationInput, NotificationRule.class);
  }
}
