package io.openex.migration;

import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;
import org.springframework.stereotype.Component;

import java.sql.Connection;
import java.sql.Statement;

@Component
public class V2_63__InjectExpectation_upgrade extends BaseJavaMigration {

  @Override
  public void migrate(Context context) throws Exception {
    Connection connection = context.getConnection();
    Statement select = connection.createStatement();
    // Upgrade Inject Expectation table
    select.execute("""
        ALTER TABLE injects_expectations ADD inject_expectation_name varchar(255);
        ALTER TABLE injects_expectations ADD inject_expectation_description text;
        """);
    // Migration datas
    select.executeUpdate("""
        UPDATE injects_expectations
        SET inject_expectation_name='The animation team can validate the audience reaction'
        WHERE injects_expectations.inject_expectation_type = 'MANUAL'
        """);
  }
}
