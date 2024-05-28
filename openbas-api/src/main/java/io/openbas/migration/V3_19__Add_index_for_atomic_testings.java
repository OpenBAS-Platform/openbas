package io.openbas.migration;

import java.sql.Connection;
import java.sql.Statement;
import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;
import org.springframework.stereotype.Component;

@Component
public class V3_19__Add_index_for_atomic_testings extends BaseJavaMigration {

  @Override
  public void migrate(Context context) throws Exception {
    Connection connection = context.getConnection();
    Statement select = connection.createStatement();
    select.execute(""
        + "CREATE INDEX idx_fk_inject_expectation ON injects_expectations (inject_id);"
        + "CREATE INDEX idx_fk_inject_tag ON injects_tags (inject_id);"
        + "CREATE INDEX idx_fk_inject_assets ON injects_assets (inject_id);"
        + "CREATE INDEX idx_fk_inject_asset_groups ON injects_asset_groups (inject_id);"
        + "CREATE INDEX idx_fk_inject_teams ON injects_teams (inject_id);"
        + "CREATE INDEX idx_fk_inject_injects_documents ON injects_documents (inject_id);"
        + "CREATE INDEX idx_null_exercise_and_scenario ON injects (inject_id) WHERE inject_scenario IS NULL AND inject_exercise IS NULL;"
        + "");
  }
}