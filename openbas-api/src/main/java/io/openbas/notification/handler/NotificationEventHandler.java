package io.openbas.notification.handler;

import io.openbas.notification.model.NotificationEvent;

public interface NotificationEventHandler {
  void handle(NotificationEvent event);
}
