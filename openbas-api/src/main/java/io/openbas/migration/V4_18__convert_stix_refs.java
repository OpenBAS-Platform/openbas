package io.openbas.migration;

import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;
import org.springframework.stereotype.Component;

import java.sql.Connection;
import java.sql.Statement;

@Component
public class V4_18__convert_stix_refs extends BaseJavaMigration {

  @Override
  public void migrate(Context context) throws Exception {
    Connection connection = context.getConnection();
    try (Statement statement = connection.createStatement()) {
      statement.execute(
          """
          ALTER TABLE security_assessments
          DROP COLUMN security_assessment_attack_pattern_refs;
               
          ALTER TABLE security_assessments
          DROP COLUMN security_assessment_vulnerabilities_refs;
               
          ALTER TABLE security_assessments
          ADD COLUMN security_assessment_attack_pattern_refs JSONB;
               
          ALTER TABLE security_assessments
          ADD COLUMN security_assessment_vulnerabilities_refs JSONB;
          """);
    }
  }
}
