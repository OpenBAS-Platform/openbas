package io.openex.migration;

import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;
import org.springframework.stereotype.Component;

import java.sql.Connection;
import java.sql.Statement;

@Component
public class V2_66__Assets_Asset_Groups extends BaseJavaMigration {

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
    // Add association table between asset and tag
    select.execute("""
        CREATE TABLE assets_tags (
          asset_id varchar(255) not null constraint asset_id_fk references assets,
          tag_id varchar(255) not null constraint tag_id_fk references tags,
          constraint assets_tags_pkey primary key (asset_id, tag_id)
        );
        CREATE INDEX idx_assets_tags_asset on assets_tags (asset_id);
        CREATE INDEX idx_assets_tags_tag on assets_tags (tag_id);
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
    // Add association table between asset group and tag
    select.execute("""
        CREATE TABLE asset_groups_tags (
          asset_group_id varchar(255) not null constraint asset_group_id_fk references asset_groups,
          tag_id varchar(255) not null constraint tag_id_fk references tags,
          constraint asset_groups_tags_pkey primary key (asset_group_id, tag_id)
        );
        CREATE INDEX idx_asset_groups_tags_asset_group on asset_groups_tags (asset_group_id);
        CREATE INDEX idx_asset_groups_tags_tag on asset_groups_tags (tag_id);
        """);
      // Add association table between asset and asset groups
      select.execute("""
        CREATE TABLE IF NOT EXISTS asset_groups_assets (
            asset_group_id varchar(255) not null constraint asset_group_id_fk references asset_groups on delete cascade,
            asset_id varchar(255) not null constraint asset_id_fk references endpoints on delete cascade,
            constraint asset_groups_assets_pkey primary key (asset_group_id, asset_id)
        );
        CREATE INDEX IF NOT EXISTS idx_asset_groups_assets_asset_group on asset_groups_assets (asset_group_id);
        CREATE INDEX IF NOT EXISTS idx_asset_groups_assets_asset on asset_groups_assets (asset_id);
        """);
  }
}
