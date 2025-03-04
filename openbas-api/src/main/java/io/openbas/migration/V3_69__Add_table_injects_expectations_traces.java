package io.openbas.migration;

import java.sql.Connection;
import java.sql.Statement;
import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;
import org.springframework.stereotype.Component;

@Component
public class V3_69__Add_table_injects_expectations_traces extends BaseJavaMigration {

  @Override
  public void migrate(Context context) throws Exception {
    Connection connection = context.getConnection();
    Statement select = connection.createStatement();
    select.execute(
        """
                    CREATE TABLE injects_expectations_traces(
                        inject_expectation_trace_id VARCHAR(255) NOT NULL CONSTRAINT injects_expectations_traces_pkey PRIMARY KEY,
                        inject_expectation_trace_expectation VARCHAR(255) NOT NULL CONSTRAINT injects_expectations_traces_expectation_fkey REFERENCES injects_expectations (inject_expectation_id) ON DELETE CASCADE,
                        inject_expectation_trace_collector VARCHAR(255) CONSTRAINT inject_expectation_trace_collector_fk REFERENCES collectors ON DELETE CASCADE,
                        inject_expectation_trace_alert_name text,
                        inject_expectation_trace_alert_link text,
                        inject_expectation_trace_date timestamp,
                        inject_expectation_trace_created_at timestamp not null default now(),
                        inject_expectation_trace_updated_at timestamp not null default now()
                    );
                    CREATE INDEX idx_inject_expectation_trace_expectation ON injects_expectations_traces(inject_expectation_trace_expectation);
                    CREATE INDEX idx_inject_expectation_trace_collector ON injects_expectations_traces(inject_expectation_trace_collector);
            """);
  }
}
