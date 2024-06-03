package io.openbas.migration;

import java.sql.Connection;
import java.sql.Statement;
import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;
import org.springframework.stereotype.Component;

@Component
<<<<<<<< HEAD:openbas-api/src/main/java/io/openbas/migration/V3_19__Add_index_for_atomic_testings.java
public class V3_19__Add_index_for_atomic_testings extends BaseJavaMigration {
========
public class V3_12__Add_index_for_atomic_testings extends BaseJavaMigration {
>>>>>>>> 9db5775a ([backend] add index):openbas-api/src/main/java/io/openbas/migration/V3_12__Add_index_for_atomic_testings.java

  @Override
  public void migrate(Context context) throws Exception {
    Connection connection = context.getConnection();
    Statement select = connection.createStatement();
    select.execute(""
        + "CREATE INDEX idx_null_exercise_and_scenario ON injects (inject_id) WHERE inject_scenario IS NULL AND inject_exercise IS NULL;"
        + "");
  }
}