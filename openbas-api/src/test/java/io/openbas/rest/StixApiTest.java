package io.openbas.rest;

import static io.openbas.rest.StixApi.STIX_API;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.TestInstance.Lifecycle.PER_CLASS;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.IntegrationTest;
import io.openbas.database.model.Scenario;
import io.openbas.database.repository.ScenarioRepository;
import io.openbas.utils.fixtures.composers.AttackPatternComposer;
import io.openbas.utils.fixtures.files.AttackPatternFixture;
import io.openbas.utils.mockUser.WithMockAdminUser;
import jakarta.annotation.Resource;
import jakarta.transaction.Transactional;
import java.io.FileInputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;
import org.apache.commons.io.IOUtils;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@TestInstance(PER_CLASS)
@Transactional
@WithMockAdminUser
@DisplayName("STIX API Integration Tests")
class StixApiTest extends IntegrationTest {

  @Resource protected ObjectMapper mapper;
  @Autowired private MockMvc mvc;

  @Autowired private ScenarioRepository scenarioRepository;

  @Autowired private AttackPatternComposer attackPatternComposer;

  private String stixSecurityAssessment;

  @BeforeAll
  void setUp() throws Exception {
    try (FileInputStream fis =
        new FileInputStream("src/test/resources/stix-bundles/security-assessment.json")) {
      stixSecurityAssessment = IOUtils.toString(fis, StandardCharsets.UTF_8);

      attackPatternComposer
          .forAttackPattern(AttackPatternFixture.createAttackPatternsWithExternalId("T1531"))
          .persist();
      attackPatternComposer
          .forAttackPattern(AttackPatternFixture.createAttackPatternsWithExternalId("T1003"))
          .persist();
    }
  }

  @AfterAll
  void afterAll() {
    attackPatternComposer.reset();
  }

  @Nested
  @DisplayName("Import STIX Bundles")
  class ImportStixBundles {

    @Test
    @DisplayName("Should create the scenario from stix bundle")
    void shouldCreateScenario() throws Exception {
      String createResponse =
          mvc.perform(
                  post(STIX_API + "/generate-scenario-from-stix-bundle")
                      .contentType(MediaType.APPLICATION_JSON)
                      .content(stixSecurityAssessment))
              .andExpect(status().isOk())
              .andReturn()
              .getResponse()
              .getContentAsString();

      List<String> createdScenarioIds = mapper.readValue(createResponse, List.class);
      assertThat(createdScenarioIds).hasSize(1);
    }

    @Test
    @DisplayName("Should update scenario from same security assessment")
    void shouldUpdateScenario() throws Exception {

      String updatedBundle =
          stixSecurityAssessment.replace(
              "Security Assessment Q3 2025 - Threat Report XYZ",
              "Security Assessment Q3 2025 - UPDATED");

      String updatedResponse =
          mvc.perform(
                  post(STIX_API + "/generate-scenario-from-stix-bundle")
                      .contentType(MediaType.APPLICATION_JSON)
                      .content(updatedBundle))
              .andExpect(status().isOk())
              .andReturn()
              .getResponse()
              .getContentAsString();

      List<String> updatedScenarioIds = mapper.readValue(updatedResponse, List.class);
      assertThat(updatedScenarioIds).hasSize(1);

      String scenarioId = updatedScenarioIds.get(0);
      Scenario updatedScenario = scenarioRepository.findById(scenarioId).orElseThrow();
      assertThat(updatedScenario.getName()).isEqualTo("Security Assessment Q3 2025 - UPDATED");
    }
  }
}
