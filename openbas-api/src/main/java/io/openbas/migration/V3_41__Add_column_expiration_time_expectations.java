package io.openbas.migration;

import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;
import org.springframework.stereotype.Component;

import java.sql.Connection;
import java.sql.Statement;

@Component
public class V3_41__Add_column_expiration_time_expectations extends BaseJavaMigration {

  @Override
  public void migrate(Context context) throws Exception {
    Statement select = context.getConnection().createStatement();
    Connection connection = context.getConnection();
    Statement statement = connection.createStatement();
    long technicalMinutesExpirationTime = 60L;
    long manualMinutesExpirationTime = 360L;

    select.execute("ALTER TABLE injects_expectations ADD inject_expiration_time bigint;");
    select.execute(
        "UPDATE injects_expectations SET inject_expiration_time = " + technicalMinutesExpirationTime + " "
            + "WHERE inject_expectation_type = 'DETECTION' OR inject_expectation_type = 'PREVENTION';");

    select.execute(
        "UPDATE injects_expectations SET inject_expiration_time = " + manualMinutesExpirationTime + " "
            + "WHERE inject_expectation_type = 'MANUAL' OR inject_expectation_type = 'CHALLENGE' "
            + "OR inject_expectation_type = 'ARTICLE' OR inject_expectation_type = 'DOCUMENT' OR inject_expectation_type = 'TEXT';");

    select.execute(
        "ALTER TABLE injects_expectations ALTER COLUMN inject_expiration_time SET NOT NULL;");
  }
}
