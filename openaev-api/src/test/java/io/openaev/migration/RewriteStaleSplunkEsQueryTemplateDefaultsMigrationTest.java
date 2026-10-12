package io.openaev.migration;

import static io.openaev.migration.V6_20261012160000000__Rewrite_stale_splunk_es_query_template_defaults.CURRENT_DEFAULT;
import static io.openaev.migration.V6_20261012160000000__Rewrite_stale_splunk_es_query_template_defaults.IMPLANT_PLACEHOLDERS_DEFAULT;
import static io.openaev.migration.V6_20261012160000000__Rewrite_stale_splunk_es_query_template_defaults.PROCESS_CONDITIONS_DEFAULT;
import static io.openaev.utils.fixtures.CatalogConnectorFixture.createDefaultCatalogConnectorManagedByXtmComposer;
import static io.openaev.utils.fixtures.ConnectorInstanceFixture.createConnectorInstanceConfiguration;
import static io.openaev.utils.fixtures.ConnectorInstanceFixture.createConnectorInstanceSecretConfiguration;
import static io.openaev.utils.fixtures.ConnectorInstanceFixture.createDefaultConnectorInstance;
import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.core.JsonProcessingException;
import io.openaev.IntegrationTest;
import io.openaev.database.model.ConnectorInstanceConfiguration;
import io.openaev.utils.fixtures.composers.CatalogConnectorComposer;
import io.openaev.utils.fixtures.composers.ConnectorInstanceComposer;
import io.openaev.utils.fixtures.composers.ConnectorInstanceConfigurationComposer;
import io.openaev.utils.mockUser.WithMockUser;
import org.flywaydb.core.api.configuration.Configuration;
import org.flywaydb.core.api.migration.Context;
import org.hibernate.Session;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

/**
 * Verifies the Splunk ES query template repair: a stored value equal to one of the historical
 * catalog defaults (ignoring surrounding whitespace) is rewritten to the current collector default,
 * while customized queries, secrets and other keys are left untouched, and re-running is a no-op.
 *
 * <p>{@code @Transactional} so the seeded rows and migration side effects roll back with the test
 * transaction.
 */
@Transactional
@WithMockUser(isAdmin = true)
@DisplayName("Rewrite stale Splunk ES query template defaults migration")
class RewriteStaleSplunkEsQueryTemplateDefaultsMigrationTest extends IntegrationTest {

  private static final String QUERY_TEMPLATE_KEY = "SPLUNKES_QUERY_TEMPLATE";

  @Autowired
  private V6_20261012160000000__Rewrite_stale_splunk_es_query_template_defaults migration;

  @Autowired private ConnectorInstanceComposer connectorInstanceComposer;
  @Autowired private ConnectorInstanceConfigurationComposer connectorInstanceConfigurationComposer;
  @Autowired private CatalogConnectorComposer catalogConnectorComposer;

  private String persistConfiguration(ConnectorInstanceConfiguration configuration) {
    connectorInstanceComposer
        .forConnectorInstance(createDefaultConnectorInstance())
        .withConnectorInstanceConfiguration(
            connectorInstanceConfigurationComposer.forConnectorInstanceConfiguration(configuration))
        .withCatalogConnector(
            catalogConnectorComposer.forCatalogConnector(
                createDefaultCatalogConnectorManagedByXtmComposer("Splunk ES")))
        .persist();
    entityManager.flush();
    return configuration.getId();
  }

  private String persistQueryTemplate(String value) throws JsonProcessingException {
    return persistConfiguration(createConnectorInstanceConfiguration(QUERY_TEMPLATE_KEY, value));
  }

  private String storedValue(String configurationId) {
    entityManager.clear();
    return (String)
        entityManager
            .createNativeQuery(
                "SELECT connector_instance_configuration_value #>> '{}' "
                    + "FROM connector_instance_configurations "
                    + "WHERE connector_instance_configuration_id = :id")
            .setParameter("id", configurationId)
            .getSingleResult();
  }

  private void runMigration() {
    entityManager.flush();
    entityManager
        .unwrap(Session.class)
        .doWork(
            connection -> {
              try {
                migration.migrate(
                    new Context() {
                      @Override
                      public Configuration getConfiguration() {
                        return null;
                      }

                      @Override
                      public java.sql.Connection getConnection() {
                        return connection;
                      }
                    });
              } catch (Exception e) {
                throw new RuntimeException(e);
              }
            });
  }

  @Nested
  @DisplayName("Stale catalog defaults")
  class StaleDefaults {

    @Test
    @DisplayName("Given the original process_conditions default should rewrite it")
    void given_processConditionsDefault_should_rewriteToCurrentDefault() throws Exception {
      // Arrange
      String id = persistQueryTemplate(PROCESS_CONDITIONS_DEFAULT);

      // Act
      runMigration();

      // Assert
      assertThat(storedValue(id)).isEqualTo(CURRENT_DEFAULT);
    }

    @Test
    @DisplayName(
        "Given the implant placeholders default with surrounding whitespace should rewrite")
    void given_implantPlaceholdersDefaultWithWhitespace_should_rewriteToCurrentDefault()
        throws Exception {
      // Arrange
      String id = persistQueryTemplate("  " + IMPLANT_PLACEHOLDERS_DEFAULT + "\n");

      // Act
      runMigration();

      // Assert
      assertThat(storedValue(id)).isEqualTo(CURRENT_DEFAULT);
    }

    @Test
    @DisplayName("Given a second run should leave the rewritten value unchanged")
    void given_secondRun_should_beNoOp() throws Exception {
      // Arrange
      String id = persistQueryTemplate(IMPLANT_PLACEHOLDERS_DEFAULT);
      runMigration();

      // Act
      runMigration();

      // Assert
      assertThat(storedValue(id)).isEqualTo(CURRENT_DEFAULT);
    }
  }

  @Nested
  @DisplayName("Values the migration must not touch")
  class UntouchedValues {

    @Test
    @DisplayName("Given a customized query should keep it")
    void given_customizedQuery_should_keepIt() throws Exception {
      // Arrange
      String customized = IMPLANT_PLACEHOLDERS_DEFAULT + " | head 10";
      String id = persistQueryTemplate(customized);

      // Act
      runMigration();

      // Assert
      assertThat(storedValue(id)).isEqualTo(customized);
    }

    @Test
    @DisplayName("Given an encrypted value should keep it")
    void given_encryptedValue_should_keepIt() throws Exception {
      // Arrange
      String id =
          persistConfiguration(
              createConnectorInstanceSecretConfiguration(
                  QUERY_TEMPLATE_KEY, IMPLANT_PLACEHOLDERS_DEFAULT));

      // Act
      runMigration();

      // Assert
      assertThat(storedValue(id)).isEqualTo(IMPLANT_PLACEHOLDERS_DEFAULT);
    }

    @Test
    @DisplayName("Given another key holding a stale default should keep it")
    void given_otherKey_should_keepIt() throws Exception {
      // Arrange
      String id =
          persistConfiguration(
              createConnectorInstanceConfiguration(
                  "ELASTIC_QUERY_TEMPLATE", IMPLANT_PLACEHOLDERS_DEFAULT));

      // Act
      runMigration();

      // Assert
      assertThat(storedValue(id)).isEqualTo(IMPLANT_PLACEHOLDERS_DEFAULT);
    }
  }
}
