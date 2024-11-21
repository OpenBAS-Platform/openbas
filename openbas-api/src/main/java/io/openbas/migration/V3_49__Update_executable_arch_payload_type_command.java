package io.openbas.migration;

import java.sql.Connection;
import java.sql.Statement;
import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;
import org.springframework.stereotype.Component;

@Component
public class V3_49__Update_executable_arch_payload_type_command extends BaseJavaMigration {

  @Override
  public void migrate(Context context) throws Exception {
    Connection connection = context.getConnection();
    Statement statement = connection.createStatement();
    statement.execute(
        "UPDATE payloads SET executable_arch = 'All' WHERE payload_type ='Command';");

    statement.execute(
        """
           ALTER TABLE payloads
           ADD CONSTRAINT chk_arch_payload_cmd_exe_consistency
           CHECK (
               (payload_type IN ('Command', 'Executable') AND executable_arch IS NOT NULL)
               OR (payload_type NOT IN ('Command', 'Executable'))
           )
           """);
  }
}
