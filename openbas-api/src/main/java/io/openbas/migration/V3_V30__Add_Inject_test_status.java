package io.openbas.migration;

import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;

import java.sql.Connection;
import java.sql.Statement;

public class V3_V30__Add_Inject_test_status extends BaseJavaMigration {

  @Override
  public void migrate(Context context) throws Exception {
    Connection connection = context.getConnection();
    Statement select = connection.createStatement();
    // Create table
    select.execute("""
             CREATE TABLE inject_test_status (
               status_id UUID NOT NULL CONSTRAINT inject_test_status_pkey PRIMARY KEY,
               status_name VARCHAR(255) NOT NULL,
               status_executions text,
               tracking_sent_date timestamp,
               tracking_ack_date timestamp,
               tracking_end_date timestamp,
               tracking_total_execution_time bigint,
               tracking_total_count int,
               tracking_total_error int,
               tracking_total_success int,
               status_inject VARCHAR(255),
               status_created_at timestamp not null default now(),
               status_updated_at timestamp not null default now(),
             );
             CREATE INDEX idx_inject_test_status ON inject_test_status(status_id);
        """);

  }

}
