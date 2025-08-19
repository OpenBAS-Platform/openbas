package io.openbas.migration;

import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;
import org.springframework.stereotype.Component;

import java.sql.Connection;
import java.sql.Statement;

@Component
public class V4_17__Add_octi_stix_objects extends BaseJavaMigration {

  @Override
  public void migrate(Context context) throws Exception {
    Connection connection = context.getConnection();
    try (Statement statement = connection.createStatement()) {
      statement.execute(
          """
          CREATE TABLE security_assessments (
              security_assessment_id VARCHAR(255) NOT NULL CONSTRAINT security_assessment_pkey PRIMARY KEY,
              security_assessment_external_id VARCHAR(255) NOT NULL,
              security_assessment_scenario VARCHAR(255) REFERENCES scenarios(scenario_id) ON DELETE SET NULL,
              security_assessment_exercise VARCHAR(255),
              security_assessment_name VARCHAR(255) NOT NULL,
              security_assessment_description TEXT,
              security_assessment_security_coverage_submission_url VARCHAR(150) NOT NULL,
              security_assessment_scheduling VARCHAR(50) NOT NULL,
              security_assessment_period_start TIMESTAMPTZ,
              security_assessment_period_end TIMESTAMPTZ,
              security_assessment_threat_context_ref VARCHAR(255) NOT NULL,
              security_assessment_attack_pattern_refs JSONB,
              security_assessment_vulnerabilities_refs JSONB,
              security_assessment_created_at TIMESTAMPTZ DEFAULT now(),
              security_assessment_updated_at TIMESTAMPTZ DEFAULT now()
          );
          """);

      statement.execute(
          """
          ALTER TABLE exercises
          ADD COLUMN exercise_security_assessment VARCHAR(255),
          ADD CONSTRAINT fk_exercise_security_assessment
              FOREIGN KEY (exercise_security_assessment)
              REFERENCES security_assessments(security_assessment_id)
              ON DELETE SET NULL;
          """);
    }
  }
}
