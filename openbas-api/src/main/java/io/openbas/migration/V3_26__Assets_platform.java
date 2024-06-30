package io.openbas.migration;

import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;
import org.springframework.stereotype.Component;

import java.sql.Connection;
import java.sql.Statement;

@Component
public class V3_26__Assets_platform extends BaseJavaMigration {

    @Override
    public void migrate(Context context) throws Exception {
        Connection connection = context.getConnection();
        Statement select = connection.createStatement();
        select.execute("ALTER TABLE assets ALTER COLUMN endpoint_platform DROP NOT NULL;");
    }
}