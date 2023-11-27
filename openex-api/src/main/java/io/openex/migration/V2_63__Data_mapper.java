package io.openex.migration;

import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;
import org.springframework.stereotype.Component;

import java.sql.Connection;
import java.sql.Statement;

@Component
public class V2_63__Data_mapper extends BaseJavaMigration {

  @Override
  public void migrate(Context context) throws Exception {
    Connection connection = context.getConnection();
    Statement select = connection.createStatement();
    // Add DataMapper table
    select.execute("""
        CREATE TABLE IF NOT EXISTS data_mappers (
            data_mapper_id varchar(255) not null constraint data_mappers_pkey primary key,
            data_mapper_name varchar(255) not null,
            data_mapper_type INT not null,
            data_mapper_has_header boolean,
            data_mapper_separator INT not null,
            data_mapper_created_at timestamp not null default now(),
            data_mapper_updated_at timestamp not null default now()
        );
        """);
    // Add DataMapperRepresentation table
    select.execute("""
        CREATE TABLE IF NOT EXISTS data_mapper_representations (
            data_mapper_representation_id varchar(255) not null constraint data_mapper_representations_pkey primary key,
            data_mapper_representation_name varchar(255) not null,
            data_mapper_representation_clazz varchar(255) not null,
            data_mapper_id varchar(255) default NULL::character varying constraint fk_data_mapper_id references data_mappers on delete cascade,
            data_mapper_representation_created_at timestamp not null default now(),
            data_mapper_representation_updated_at timestamp not null default now()
        );
        CREATE INDEX IF NOT EXISTS idx_dmr_dm on data_mapper_representations (data_mapper_id);
        """);
    // Add DataMapperRepresentationProperty table
    select.execute("""
        CREATE TABLE IF NOT EXISTS data_mapper_representation_properties (
            data_mapper_representation_property_id varchar(255) not null constraint data_mapper_representation_properties_pkey primary key,
            data_mapper_representation_property_name varchar(255) not null,
            data_mapper_representation_property_column_name varchar(255),
            data_mapper_representation_property_based_on varchar(255),
            data_mapper_representation_id varchar(255) default NULL::character varying constraint fk_data_mapper_representation_id references data_mapper_representations on delete cascade,
            data_mapper_representation_property_created_at timestamp not null default now(),
            data_mapper_representation_property_updated_at timestamp not null default now()
        );
        CREATE INDEX IF NOT EXISTS idx_dmrp_dmr on data_mapper_representation_properties (data_mapper_representation_id);
        """);
  }
}
