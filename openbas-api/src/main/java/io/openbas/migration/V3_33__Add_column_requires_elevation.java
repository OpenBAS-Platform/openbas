package io.openbas.migration;

import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;
import org.springframework.stereotype.Component;

import java.sql.Statement;

@Component
public class V3_33__Add_column_requires_elevation extends BaseJavaMigration {

    @Override
    public void migrate(final Context context) throws Exception {
        final Statement select = context.getConnection().createStatement();
        select.execute("ALTER TABLE asset_agent_jobs ADD asset_agent_elevation_required bool default false;");
        select.execute("ALTER TABLE payloads ADD payload_elevation_required bool default false;");
    }
}
