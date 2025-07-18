package io.openbas.migration;

import java.sql.Connection;
import java.sql.Statement;
import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;
import org.springframework.stereotype.Component;

@Component
public class V4_11__Update_TagRule_Table extends BaseJavaMigration {

  @Override
  public void migrate(Context context) throws Exception {
    Connection connection = context.getConnection();
    try (Statement statement = connection.createStatement()) {

      // 1. Set on delete cascade on the tag rules
      statement.execute(
          """
                ALTER TABLE tag_rules
                DROP CONSTRAINT tag_id_fk;
                ALTER TABLE tag_rules
                ADD CONSTRAINT tag_id_fk FOREIGN KEY (tag_id) REFERENCES tags ON DELETE CASCADE;
            """);
    }
  }
}
