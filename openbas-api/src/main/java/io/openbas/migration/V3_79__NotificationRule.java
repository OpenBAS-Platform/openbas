package io.openbas.migration;

import java.sql.Connection;
import java.sql.Statement;
import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;
import org.springframework.stereotype.Component;

@Component
public class V3_79__NotificationRule extends BaseJavaMigration {

  @Override
  public void migrate(Context context) throws Exception {
    Connection connection = context.getConnection();
    Statement select = connection.createStatement();
    select.execute(
        """
                   CREATE TABLE notification_rules (
                       notification_rule_id varchar(255) not null,
                       notification_resource_type varchar(255) not null,
                       notification_resource_id varchar(255) not null,
                       notification_rule_trigger varchar(255) not null,
                       notification_rule_type varchar(255) not null,
                       notification_rule_subject varchar(255) not null,
                       user_id varchar(255) not null,
                       primary key (notification_rule_id)
                   );
               CREATE INDEX idx_resource_id ON notification_rules (notification_resource_id);
                """);
  }
}
