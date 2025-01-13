package io.openbas.migration;

import java.sql.Connection;
import java.sql.Statement;
import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;
import org.springframework.stereotype.Component;

@Component
public class V3_60__Add_trigger_before_delete_injector_contract_no_custom
    extends BaseJavaMigration {

  @Override
  public void migrate(Context context) throws Exception {
    Connection connection = context.getConnection();
    Statement select = connection.createStatement();
    select.execute(
        """
                        CREATE OR REPLACE FUNCTION fn_before_delete_injector_contract_no_custom()
                        RETURNS TRIGGER
                        AS
                        $$
                        BEGIN
                           IF OLD.injector_contract_id IN ('2790bd39-37d4-4e39-be7e-53f3ca783f86', '138ad8f8-32f8-4a22-8114-aaa12322bd09') THEN
                               RAISE EXCEPTION 'Deletion of contract type openbas_email from the injector_contracts table is not allowed';
                           END IF;
                            RETURN OLD;
                        END;
                        $$
                        LANGUAGE plpgsql;
            """);
    select.execute(
        """
                        CREATE TRIGGER check_del_injector_contract_no_custom
                        BEFORE DELETE ON injectors_contracts
                        FOR EACH ROW
                        EXECUTE PROCEDURE fn_before_delete_injector_contract_no_custom();
            """);
  }
}
