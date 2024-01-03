package io.openex.migration;

import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;
import org.springframework.stereotype.Component;

import java.sql.Connection;
import java.sql.Statement;

@Component
public class V2_65__Assets_Asset_Groups extends BaseJavaMigration {

  @Override
  public void migrate(Context context) throws Exception {
    Connection connection = context.getConnection();
    Statement select = connection.createStatement();
    // Create table asset
    select.execute("""
        CREATE TABLE IF NOT EXISTS assets (
            asset_id varchar(255) not null constraint assets_pkey primary key,
            asset_external_id varchar(255),
            asset_name varchar(255) not null,
            asset_description text,
            asset_created_at timestamp not null default now(),
            asset_updated_at timestamp not null default now()
        );
        CREATE INDEX IF NOT EXISTS idx_assets on assets (asset_id);
        """);
    // Create table endpoint
    select.execute("""
        CREATE TABLE IF NOT EXISTS endpoints (
            endpoint_hostname varchar(255),
            endpoint_platform varchar(255),
            endpoint_last_seen timestamp
        ) INHERITS (assets);
        ALTER TABLE endpoints
            ADD CONSTRAINT endpoints_pkey PRIMARY KEY (asset_id) ;
        """);
    // Create table ips
    select.execute("""
        CREATE TABLE IF NOT EXISTS ips (
            endpoint_id varchar(255) not null,
            ip varchar(255) not null
        );
        ALTER TABLE ips
            ADD CONSTRAINT fk_ips_on_assets FOREIGN KEY (endpoint_id) REFERENCES endpoints(asset_id) ;
        """);
    // Create table mac adresses
    select.execute("""
        CREATE TABLE IF NOT EXISTS macadresses (
            endpoint_id varchar(255) not null,
            mac_adress varchar(255) not null
        );
        ALTER TABLE macadresses
            ADD CONSTRAINT fk_mac_adresses_on_assets FOREIGN KEY (endpoint_id) REFERENCES endpoints(asset_id) ;
        """);
    // Create table asset groups
    select.execute("""
        CREATE TABLE IF NOT EXISTS asset_groups (
            asset_group_id varchar(255) not null constraint asset_groups_pkey primary key,
            asset_group_name varchar(255) not null,
            asset_group_description text,
            asset_group_created_at timestamp not null default now(),
            asset_group_updated_at timestamp not null default now()
        );
        CREATE INDEX IF NOT EXISTS idx_asset_groups on asset_groups (asset_group_id);
        """);
      // Add association table between asset and asset groups
      select.execute("""
        CREATE TABLE IF NOT EXISTS asset_groups_assets (
            asset_group_id varchar(255) not null constraint asset_group_id_fk references asset_groups on delete cascade,
            asset_id varchar(255) not null constraint asset_id_fk references endpoints on delete cascade,
            constraint asset_groups_assets_pkey primary key (asset_group_id, asset_id)
        );
        CREATE INDEX IF NOT EXISTS idx_asset_groups_assets_asset on asset_groups_assets (asset_group_id);
        CREATE INDEX IF NOT EXISTS idx_asset_groups_assets_asset on asset_groups_assets (asset_id);
        """);
  }
}
