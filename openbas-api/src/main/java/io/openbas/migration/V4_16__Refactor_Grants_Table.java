package io.openbas.migration;

import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;
import org.springframework.stereotype.Component;

import java.sql.Connection;
import java.sql.Statement;

@Component
public class V4_16__Refactor_Grants_Table extends BaseJavaMigration {

  @Override
  public void migrate(Context context) throws Exception {
    Connection connection = context.getConnection();
    Statement stmt = connection.createStatement();
    stmt.execute(
        """
          -- Step 1: Add both new columns
          ALTER TABLE grants
          ADD COLUMN grant_resource varchar(255) DEFAULT NULL,
          ADD COLUMN resource_type varchar(50);
          -- Step 2: Migrate data from grant_exercise to grant_resource with type
          UPDATE grants
          SET grant_resource = grant_exercise,
              resource_type = 'EXERCISE'
          WHERE grant_exercise IS NOT NULL;
          -- Step 3: Migrate data from grant_scenario to grant_resource with type
          UPDATE grants
          SET grant_resource = grant_scenario,
              resource_type = 'SCENARIO'
          WHERE grant_scenario IS NOT NULL
            AND grant_resource IS NULL;
          -- Step 4: Add NOT NULL constraint to resource_type if desired
          ALTER TABLE grants
          ALTER COLUMN resource_type SET NOT NULL;
          -- Step 5: Drop the unique indexes that reference the old columns
          DROP INDEX IF EXISTS grant_exercise;
          DROP INDEX IF EXISTS grant_scenario;
          -- Step 6: Drop the regular indexes on the old columns
          DROP INDEX IF EXISTS idx_64adc7d6cae7a988;
          -- Step 7: Drop the old columns (this will also drop their foreign key constraints)
          ALTER TABLE grants
          DROP COLUMN grant_exercise,
          DROP COLUMN grant_scenario;
          -- Step 8: Create new indexes
          CREATE INDEX idx_grant_resource ON grants (grant_resource);
          CREATE INDEX idx_grant_resource_type ON grants (resource_type);
          CREATE INDEX idx_grant_resource_type_resource ON grants (resource_type, grant_resource);
          -- Step 9: Create a new unique index
          CREATE UNIQUE INDEX grant_resource_unique ON grants (grant_group, grant_resource, grant_name);
          """);
  }

  /* ROLLBACK
-- Step 1: Drop the new indexes
DROP INDEX IF EXISTS grant_resource_unique;
DROP INDEX IF EXISTS idx_grant_resource_type_resource;
DROP INDEX IF EXISTS idx_grant_resource_type;
DROP INDEX IF EXISTS idx_grant_resource;
-- Step 2: Re-add the grant_exercise and grant_scenario columns
ALTER TABLE grants
ADD COLUMN grant_exercise varchar(255) DEFAULT NULL,
ADD COLUMN grant_scenario varchar(255) DEFAULT NULL;
-- Step 3: Re-add the foreign key constraints
ALTER TABLE grants
ADD CONSTRAINT fk_64adc7d6cae7a988
FOREIGN KEY (grant_exercise)
REFERENCES exercises
ON DELETE CASCADE;
ALTER TABLE grants
ADD CONSTRAINT scenario_fk
FOREIGN KEY (grant_scenario)
REFERENCES scenarios
ON DELETE CASCADE;
-- Step 4: Migrate data back based on resource_type
UPDATE grants
SET grant_exercise = grant_resource
WHERE resource_type = 'EXERCISE';
UPDATE grants
SET grant_scenario = grant_resource
WHERE resource_type = 'SCENARIO';
-- Step 5: Re-create the original indexes
CREATE INDEX idx_64adc7d6cae7a988 ON grants (grant_exercise);
CREATE UNIQUE INDEX grant_exercise ON grants (grant_group, grant_exercise, grant_name);
CREATE UNIQUE INDEX grant_scenario ON grants (grant_group, grant_scenario, grant_name);
-- Step 6: Drop the new columns
ALTER TABLE grants
DROP COLUMN grant_resource,
DROP COLUMN resource_type;
  */
}
