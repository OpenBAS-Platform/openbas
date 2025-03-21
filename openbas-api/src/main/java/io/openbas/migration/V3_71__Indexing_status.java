package io.openbas.migration;

import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;
import org.springframework.stereotype.Component;

import java.sql.Connection;
import java.sql.Statement;

@Component
public class V3_71__Indexing_status extends BaseJavaMigration {

  @Override
  public void migrate(Context context) throws Exception {
    Connection connection = context.getConnection();
    Statement select = connection.createStatement();
    select.execute(
            """
                   ALTER TABLE findings ALTER COLUMN finding_created_at type timestamp with time zone using finding_created_at::timestamp with time zone;
                   ALTER TABLE findings ALTER COLUMN finding_updated_at type timestamp with time zone using finding_updated_at::timestamp with time zone;
                
                   CREATE TABLE indexing_status (
                       indexing_status_type text not null,
                       indexing_status_indexing_date timestamp with time zone not null,
                       primary key (indexing_status_type)
                   );
                   CREATE INDEX idx_indexing_status_type ON indexing_status (indexing_status_type);
                """);
  }
}
