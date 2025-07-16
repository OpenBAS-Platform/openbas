package io.openbas.service;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import io.openbas.IntegrationTest;
import io.openbas.database.model.NotificationRule;
import io.openbas.database.model.NotificationRuleResourceType;
import io.openbas.database.model.NotificationRuleTrigger;
import io.openbas.database.model.NotificationRuleType;
import io.openbas.database.repository.NotificationRuleRepository;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
public class NotificationRuleServiceTest extends IntegrationTest {

  @Mock private NotificationRuleRepository notificationRuleRepository;

  @Mock private EmailNotificationService emailNotificationService;

  @Mock private UserService userService;

  @Mock private ScenarioService scenarioService;

  @Mock private PlatformSettingsService platformSettingsService;

  @InjectMocks private NotificationRuleService notificationRuleService;

  @AfterEach
  void teardown() {
    globalTeardown();
  }

  @Test
  public void test_activateNotificationRules() {

    Map<String, String> data = new HashMap<>();
    NotificationRule rule = new NotificationRule();
    rule.setResourceId("id");
    rule.setResourceType(NotificationRuleResourceType.SCENARIO);
    rule.setType(NotificationRuleType.EMAIL);
    rule.setSubject("subject");
    rule.setTrigger(NotificationRuleTrigger.DIFFERENCE);
    when(notificationRuleRepository.findNotificationRuleByResourceAndTrigger(
            rule.getResourceId(), rule.getTrigger()))
        .thenReturn(List.of(rule));

    notificationRuleService.activateNotificationRules(
        rule.getResourceId(), rule.getTrigger(), data);

    verify(emailNotificationService).sendNotification(rule, data);
  }
}
