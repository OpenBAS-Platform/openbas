package io.openbas.migration;

import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;
import org.springframework.stereotype.Component;

import java.sql.Statement;

@Component
public class V2_88__Add_foreign_key_injector_contract_to_inject extends BaseJavaMigration {

  @Override
  public void migrate(Context context) throws Exception {
    Statement select = context.getConnection().createStatement();
    select.execute("ALTER TABLE injects "
        + "ADD CONSTRAINT injector_contract_fk "
        + "FOREIGN KEY (inject_contract) REFERENCES injectors_contracts(injector_contract_id) "
        + "ON DELETE SET NULL;");
  }
}
