package io.openbas.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.verify;

import io.openbas.database.model.NotificationRuleResourceType;
import io.openbas.notification.handler.ScenarioNotificationEventHandler;
import io.openbas.notification.model.NotificationEvent;
import io.openbas.notification.model.NotificationEventType;
import java.time.Instant;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationEventPublisher;

@SpringBootTest
public class NotificationEvenServiceTest {

  @Mock private ApplicationEventPublisher appPublisher;

  @Mock private ScenarioNotificationEventHandler scenarioNotificationEventHandler;

  @InjectMocks private NotificationEventService notificationEventService;

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
