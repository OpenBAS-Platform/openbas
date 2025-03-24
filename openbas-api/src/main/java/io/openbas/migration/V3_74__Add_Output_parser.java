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
            contract_output_element_id VARCHAR(255) NOT NULL PRIMARY KEY,
            contract_output_element_is_finding bool default true,
            contract_output_element_rule TEXT NOT NULL,
            contract_output_element_name VARCHAR(50) NOT NULL,
            contract_output_element_key VARCHAR(255) NOT NULL,
            contract_output_element_type VARCHAR(50) NOT NULL,
            contract_output_element_output_parser_id VARCHAR(255) NOT NULL
                CONSTRAINT contract_output_element_output_parser_id_fk
                REFERENCES output_parsers
                ON DELETE CASCADE,
            contract_output_element_created_at TIMESTAMP DEFAULT now(),
            contract_output_element_updated_at TIMESTAMP DEFAULT now(),
            UNIQUE (contract_output_element_key, contract_output_element_output_parser_id),
            );
          """);

      statement.execute(
          """
          CREATE TABLE regex_groups (
            regex_group_id VARCHAR(255) NOT NULL PRIMARY KEY,
            regex_group_field VARCHAR(50) NOT NULL,
            regex_group_index int NOT NULL,
            regex_groups_contract_output_element_id VARCHAR(255) NOT NULL
                CONSTRAINT regex_groups_contract_output_element_id_fk
                REFERENCES contract_output_elements
                ON DELETE CASCADE,
            contract_output_element_created_at TIMESTAMP DEFAULT now(),
            contract_output_element_updated_at TIMESTAMP DEFAULT now(),
            );
          """);

      statement.execute(
          """
          CREATE TABLE contract_output_elements_tags (
            contract_output_element_id varchar(255) not null constraint contract_output_element_id_fk references contract_output_elements on delete cascade,
            tag_id varchar(255) not null constraint tag_id_fk references tags on delete cascade,
            primary key (contract_output_element_id, tag_id)
          );
          CREATE INDEX idx_contract_output_elements_tags_contract_output_elements on contract_output_elements_tags (contract_output_element_id);
          CREATE INDEX idx_contract_output_elements_tags_tag on contract_output_elements_tags (tag_id);

          """);

      statement.execute(
          """
          CREATE TABLE findings_tags (
              finding_id varchar(255) not null
                  constraint finding_id_fk
                      references findings
                      on delete cascade,
              tag_id varchar(255) not null
                  constraint tag_id_fk
                      references tags
                      on delete cascade,
              primary key (finding_id, tag_id)
          );
          CREATE INDEX idx_fingings_tags_finding on findings_tags (finding_id);
          CREATE INDEX idx_fingings_tags_tag on findings_tags (tag_id);
      """);
    }
  }
}
