package io.openbas.migration;

import java.sql.Statement;
import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;
import org.springframework.stereotype.Component;

@Component
public class V3_74__Add_Output_parser extends BaseJavaMigration {

  @Override
  public void migrate(Context context) throws Exception {
    try (Statement statement = context.getConnection().createStatement()) {
      statement.execute(
          """
              CREATE TABLE output_parsers (
                    output_parser_id VARCHAR(255) NOT NULL PRIMARY KEY,
                    output_parser_mode VARCHAR(50) NOT NULL,
                    output_parser_type VARCHAR(50) NOT NULL,
                    output_parser_rule TEXT NOT NULL,
                    output_parser_payload_id VARCHAR(255) NOT NULL,
                    output_parser_created_at TIMESTAMP DEFAULT now(),
                    output_parser_updated_at TIMESTAMP DEFAULT now(),
                    CONSTRAINT output_parser_payload_id_fk FOREIGN KEY (output_parser_payload_id)
                        REFERENCES payloads ON DELETE CASCADE
                );
              """);
    }
  }
}
