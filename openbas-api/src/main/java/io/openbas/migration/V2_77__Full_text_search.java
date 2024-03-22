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
        CREATE INDEX idx_full_text_search_assets_asset_name ON assets USING gin(to_tsvector('simple', asset_name));
        CREATE INDEX idx_full_text_search_asset_groups_asset_group_name ON asset_groups USING gin(to_tsvector('simple', asset_group_name));
        CREATE INDEX idx_full_text_search_users_user_email ON users USING gin(to_tsvector('simple', user_email));
        CREATE INDEX idx_full_text_search_teams_team_name ON teams USING gin(to_tsvector('simple', team_name));
        CREATE INDEX idx_full_text_search_organizations_organization_name ON organizations USING gin(to_tsvector('simple', organization_name));
        """);
  }
}
