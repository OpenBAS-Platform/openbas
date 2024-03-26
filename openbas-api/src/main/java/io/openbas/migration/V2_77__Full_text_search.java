package io.openbas.migration;

import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;
import org.springframework.stereotype.Component;

import java.sql.Connection;
import java.sql.Statement;

@Component
public class V2_77__Full_text_search extends BaseJavaMigration {

  @Override
  public void migrate(Context context) throws Exception {
    Connection connection = context.getConnection();
    Statement select = connection.createStatement();
    // Add full text search index on assets, assets groups, players, teams, organizations
    select.execute("""
        CREATE EXTENSION IF NOT EXISTS pg_trgm;
        
        CREATE INDEX idx_pg_trgm_assets_asset_name ON assets USING gin(asset_name gin_trgm_ops);
        CREATE INDEX idx_pg_trgm_asset_groups_asset_group_name ON asset_groups USING gin(asset_group_name gin_trgm_ops);
        CREATE INDEX idx_pg_trgm_users_user_email ON users USING gin(user_email gin_trgm_ops);
        CREATE INDEX idx_pg_trgm_teams_team_name ON teams USING gin(team_name gin_trgm_ops);
        CREATE INDEX idx_pg_trgm_organizations_organization_name ON organizations USING gin(organization_name gin_trgm_ops);
        CREATE INDEX idx_pg_trgm_scenarios_scenario_name ON scenarios USING gin(scenario_name gin_trgm_ops);
        CREATE INDEX idx_pg_trgm_exercises_exercise_name ON exercises USING gin(exercise_name gin_trgm_ops);
        """);
  }
}
