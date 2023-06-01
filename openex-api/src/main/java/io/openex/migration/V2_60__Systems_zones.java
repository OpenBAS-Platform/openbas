package io.openex.migration;

import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;
import org.springframework.stereotype.Component;

import java.sql.Connection;
import java.sql.Statement;

@Component
public class V2_60__Systems_zones extends BaseJavaMigration {

    @Override
    public void migrate(Context context) throws Exception {
        Connection connection = context.getConnection();
        Statement select = connection.createStatement();
        // Create table system
        select.execute("""
                CREATE TABLE systems (
                    system_id varchar(255) not null constraint systems_pkey primary key,
                    system_name varchar(255) not null,
                    system_type varchar(255) not null,
                    system_ip varchar(255) not null,
                    system_hostname varchar(255) not null,
                    system_os varchar(255) not null,
                    system_created_at timestamp not null default now(),
                    system_updated_at timestamp not null default now()
                );
                CREATE INDEX idx_systems on systems (system_id);
                """);
        // Create table zone
        select.execute("""
                CREATE TABLE zones (
                    zone_id varchar(255) not null constraint zones_pkey primary key,
                    zone_name varchar(255) not null,
                    zone_description varchar(255) not null,
                    zone_created_at timestamp not null default now(),
                    zone_updated_at timestamp not null default now()
                );
                CREATE INDEX idx_zones on zones (zone_id);
                """);
        // Add association table between system and zone
        select.execute("""
                CREATE TABLE systems_zones (
                    system_id varchar(255) not null constraint system_id_fk references systems on delete cascade,
                    zone_id varchar(255) not null constraint zone_id_fk references zones on delete cascade,
                    constraint systems_zones_pkey primary key (system_id, zone_id)
                );
                CREATE INDEX idx_systems_zones_system on systems_zones (system_id);
                CREATE INDEX idx_systems_zones_zone on systems_zones (zone_id);
                """);
    }
}
