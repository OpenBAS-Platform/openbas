package io.openbas.migration;

import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;
import org.springframework.stereotype.Component;

import java.sql.Connection;
import java.sql.Statement;

@Component
public class V3_45__Add_indexes_scenario_exercise_latency extends BaseJavaMigration {
    @Override
    public void migrate(Context context) throws Exception {
        Connection connection = context.getConnection();
        Statement select = connection.createStatement();
        select.execute("CREATE INDEX IF NOT EXISTS idx_inject_expectation_inject_id ON injects_expectations(inject_id);");
    }
}
