package io.openbas.migration;

import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;
import org.springframework.stereotype.Component;

import java.sql.Statement;

@Component
public class V3_79__Add_Notifications extends BaseJavaMigration {

  @Override
  public void migrate(Context context) throws Exception {
    try (Statement statement = context.getConnection().createStatement()) {
      statement.execute(
          """
              CREATE TABLE notifications (
                  notification_id VARCHAR(255) NOT NULL CONSTRAINT notifications_pkey PRIMARY KEY,
                  notification_name VARCHAR(255) NOT NULL,
                  notification_user VARCHAR(255) CONSTRAINT notification_user_fk REFERENCES users (user_id) ON DELETE CASCADE,
                  notification_filter json,
                  notification_outcomes TEXT[],
                  notification_event_types TEXT[],
                  notification_created_at TIMESTAMP DEFAULT now(),
                  notification_updated_at TIMESTAMP DEFAULT now()
              );
              """
      );
    }
  }
}
