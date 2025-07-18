package io.openbas.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.verify;

import io.openbas.IntegrationTest;
import io.openbas.database.model.NotificationRuleResourceType;
import io.openbas.notification.handler.ScenarioNotificationEventHandler;
import io.openbas.notification.model.NotificationEvent;
import io.openbas.notification.model.NotificationEventType;
import java.time.Instant;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;

@SpringBootTest
public class NotificationEvenServiceTest extends IntegrationTest {

  @Mock private ApplicationEventPublisher appPublisher;
  @Mock private ScenarioNotificationEventHandler scenarioNotificationEventHandler;
  @Mock private ThreadPoolTaskScheduler taskScheduler;

  private NotificationEventService notificationEventService;

  @BeforeEach
  public void setUp() {
    notificationEventService =
        new NotificationEventService(appPublisher, scenarioNotificationEventHandler, taskScheduler);
  }

  @AfterEach
  void teardown() {
    globalTeardown();
  }

  @Test
  public void test_handleEvent() {
    NotificationEvent notificationEvent =
        NotificationEvent.builder()
            .eventType(NotificationEventType.SIMULATION_COMPLETED)
            .resourceType(NotificationRuleResourceType.SCENARIO)
            .timestamp(Instant.now())
            .resourceId("id")
            .build();
    notificationEventService.handleNotificationEvent(notificationEvent);
    verify(scenarioNotificationEventHandler).handle(notificationEvent);
  }

  @Test
  public void test_send_event() {
    NotificationEvent notificationEvent =
        NotificationEvent.builder()
            .eventType(NotificationEventType.SIMULATION_COMPLETED)
            .resourceType(NotificationRuleResourceType.SCENARIO)
            .timestamp(Instant.now())
            .resourceId("id")
            .build();
    notificationEventService.sendNotificationEvent(notificationEvent);
    verify(appPublisher).publishEvent(notificationEvent);
  }
}
