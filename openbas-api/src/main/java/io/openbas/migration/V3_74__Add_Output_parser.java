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
                    output_parser_payload_id VARCHAR(255) NOT NULL,
                    output_parser_created_at TIMESTAMP DEFAULT now(),
                    output_parser_updated_at TIMESTAMP DEFAULT now(),

                    CONSTRAINT output_parser_payload_id_fk
                          FOREIGN KEY (output_parser_payload_id)
                          REFERENCES payloads (payload_id)
                          ON DELETE CASCADE
                );
              """);

      statement.execute(
          """

              CREATE TABLE contract_output_elements (
                   contract_output_element_id VARCHAR(255) NOT NULL,
                   contract_output_element_rule TEXT NOT NULL,
                   contract_output_element_name VARCHAR(50) NOT NULL,
                   contract_output_element_key VARCHAR(255) NOT NULL,
                   contract_output_element_type VARCHAR(50) NOT NULL,
                   contract_output_element_output_parser_id VARCHAR(255) NOT NULL,
                   contract_output_element_created_at TIMESTAMP DEFAULT now(),
                   contract_output_element_updated_at TIMESTAMP DEFAULT now(),

                    -- Foreign key constraint to output_parsers table
                   CONSTRAINT contract_output_element_output_parser_id_fk
                        FOREIGN KEY (contract_output_element_output_parser_id)
                        REFERENCES output_parsers (output_parser_id)
                        ON DELETE CASCADE,

                    -- Composite primary key constraint
                   CONSTRAINT contract_output_element_key_output_parser_unique
                        PRIMARY KEY (contract_output_element_output_parser_id, contract_output_element_key)
);
              """);
    }
  }
}
