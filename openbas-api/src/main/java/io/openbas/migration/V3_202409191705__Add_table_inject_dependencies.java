package io.openbas.migration;

import io.openbas.database.model.Variable;
import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;
import org.springframework.stereotype.Component;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;

@Component
public class V3_202409191705__Add_table_inject_dependencies extends BaseJavaMigration {

    @Override
    public void migrate(Context context) throws Exception {
        Statement select = context.getConnection().createStatement();
        select.execute("""
                        CREATE TABLE injects_dependencies (
                            inject_parent_id VARCHAR(255) NOT NULL REFERENCES injects(inject_id) ON DELETE CASCADE,
                            inject_children_id VARCHAR(255) NOT NULL REFERENCES injects(inject_id) ON DELETE CASCADE,
                            dependency_condition VARCHAR(255) NOT NULL,
                            dependency_created_at TIMESTAMP DEFAULT now(),
                            dependency_updated_at TIMESTAMP DEFAULT now(),
                            PRIMARY KEY(inject_parent_id, inject_children_id)
                          );
                          CREATE INDEX idx_injects_dependencies ON injects_dependencies(inject_children_id);
                """);

        // Migration datas
        ResultSet results = select.executeQuery("SELECT * FROM injects WHERE inject_depends_from_another IS NOT NULL");
        PreparedStatement statement = context.getConnection().prepareStatement(
            """
                INSERT INTO injects_dependencies(inject_parent_id, inject_children_id, dependency_condition) 
                VALUES (?, ?, ?)
                """
        );
        while (results.next()) {
            String injectId = results.getString("inject_id");
            String parentId = results.getString("inject_depends_from_another");
            String condition = String.format("%s-Execution-Success == true", parentId);
            statement.setString(1, parentId);
            statement.setString(2, injectId);
            statement.setString(3, condition);
            statement.addBatch();
        }
        statement.executeBatch();
    }
}
