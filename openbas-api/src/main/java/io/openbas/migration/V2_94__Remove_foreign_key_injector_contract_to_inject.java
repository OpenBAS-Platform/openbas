package io.openbas.migration;

import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;
import org.springframework.stereotype.Component;

import java.sql.Statement;

@Component
public class V2_94__Remove_foreign_key_injector_contract_to_inject extends BaseJavaMigration {

  @Override
  public void migrate(Context context) throws Exception {
    Statement select = context.getConnection().createStatement();
    select.execute(
        "ALTER TABLE injects DROP CONSTRAINT IF EXISTS injector_contract_fk"
    );
  }
}
