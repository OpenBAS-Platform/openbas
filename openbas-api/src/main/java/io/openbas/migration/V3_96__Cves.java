package io.openbas.migration;

import java.sql.Statement;
import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;
import org.springframework.stereotype.Component;

@Component
public class V3_96__Cves extends BaseJavaMigration {

  @Override
  public void migrate(Context context) throws Exception {
    try (Statement stmt = context.getConnection().createStatement()) {

      // cve
      stmt.execute(
          """
                CREATE TABLE cves (
                    cve_id VARCHAR(255) PRIMARY KEY,
                    cve_source_identifier VARCHAR(255),
                    cve_published TIMESTAMP WITH TIME ZONE,
                    cve_description TEXT,
                    cve_vuln_status VARCHAR(255) DEFAULT 'Analyzed',
                    cve_cvss DECIMAL(3,1),
                    cve_cisa_exploit_add TIMESTAMP WITH TIME ZONE,
                    cve_cisa_action_due TIMESTAMP WITH TIME ZONE,
                    cve_cisa_required_action TEXT,
                    cve_cisa_vulnerability_name TEXT,
                    cve_remediation TEXT,
                    cve_created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
                    cve_updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
                );
                CREATE INDEX idx_cves_cve_cvss on cves(cve_cvss);
            """);

      // cwe
      stmt.execute(
          """
                CREATE TABLE cwes (
                    cwe_id VARCHAR(255) PRIMARY KEY,
                    cwe_source VARCHAR(255),
                    cwe_created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
                    cwe_updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
                );
            """);

      // cve_cwe join table
      stmt.execute(
          """
                CREATE TABLE cves_cwes (
                    cve_id VARCHAR(255) NOT NULL CONSTRAINT cve_id_fk REFERENCES cves ON DELETE CASCADE,
                    cwe_id VARCHAR(255) NOT NULL CONSTRAINT cwe_id_fk REFERENCES cwes ON DELETE CASCADE,
                    PRIMARY KEY (cve_id, cwe_id),
                    FOREIGN KEY (cve_id) REFERENCES cves(cve_id) ON DELETE CASCADE,
                    FOREIGN KEY (cwe_id) REFERENCES cwes(cwe_id) ON DELETE CASCADE
                );
                CREATE INDEX idx_cves_cwes_cve on cves_cwes(cve_id);
                CREATE INDEX idx_cves_cwes_cwe on cves_cwes(cwe_id);
            """);

      // cve_reference_urls join table
      stmt.execute(
          """
                CREATE TABLE cve_reference_urls (
                    cve_id VARCHAR(255),
                    cve_reference_url VARCHAR(255),
                    PRIMARY KEY (cve_id, cve_reference_url),
                    FOREIGN KEY (cve_id) REFERENCES cves(cve_id) ON DELETE CASCADE
                );
            """);
    }
  }
}
