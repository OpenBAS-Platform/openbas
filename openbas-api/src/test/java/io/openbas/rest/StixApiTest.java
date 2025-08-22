package io.openbas.rest;

import static io.openbas.rest.StixApi.STIX_API;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.TestInstance.Lifecycle.PER_CLASS;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.IntegrationTest;
import io.openbas.database.model.Inject;
import io.openbas.database.model.Scenario;
import io.openbas.database.repository.InjectRepository;
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
  @Autowired private InjectRepository injectRepository;

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
    @DisplayName("Should return 400 when STIX bundle has no security assessment")
    void shouldReturnBadRequestWhenNoSecurityAssessment() throws Exception {
      String bundleWithoutAssessment =
          stixSecurityAssessment.replace("x-security-assessment", "x-other-type");

      mvc.perform(
              post(STIX_API + "/process-bundle")
                  .contentType(MediaType.APPLICATION_JSON)
                  .content(bundleWithoutAssessment))
          .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Should return 400 when STIX bundle has multiple security assessments")
    void shouldReturnBadRequestWhenMultipleSecurityAssessments() throws Exception {
      // Simulate bundle with two identical security assessments
      String duplicatedAssessment =
          stixSecurityAssessment.replace("]", ", " + stixSecurityAssessment.split("\\[")[1]);

      mvc.perform(
              post(STIX_API + "/process-bundle")
                  .contentType(MediaType.APPLICATION_JSON)
                  .content(duplicatedAssessment))
          .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Should return 400 when STIX JSON is malformed")
    void shouldReturnBadRequestWhenStixJsonIsInvalid() throws Exception {
      String invalidJson = "{ not-a-valid-json }";

      mvc.perform(
              post(STIX_API + "/process-bundle")
                  .contentType(MediaType.APPLICATION_JSON)
                  .content(invalidJson))
          .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Should return 400 when STIX bundle has invalid structure")
    void shouldReturnBadRequestWhenStixStructureInvalid() throws Exception {
      String structurallyInvalidStix =
          """
        {
          "type": "bundle",
          "id": "bundle--1234"
          // Missing "objects" field
        }
        """;

      mvc.perform(
              post(STIX_API + "/process-bundle")
                  .contentType(MediaType.APPLICATION_JSON)
                  .content(structurallyInvalidStix))
          .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Should create the scenario from stix bundle")
    void shouldCreateScenario() throws Exception {
      String createResponse =
          mvc.perform(
                  post(STIX_API + "/process-bundle")
                      .contentType(MediaType.APPLICATION_JSON)
                      .content(stixSecurityAssessment))
              .andExpect(status().isOk())
              .andReturn()
              .getResponse()
              .getContentAsString();

      List<String> createdScenarioIds = mapper.readValue(createResponse, List.class);
      assertThat(createdScenarioIds).hasSize(1);

      String scenarioId = createdScenarioIds.get(0);
      Scenario createdScenario = scenarioRepository.findById(scenarioId).orElseThrow();
      assertThat(createdScenario.getName())
          .isEqualTo("Security Assessment Q3 2025 - Threat Report XYZ");
      assertThat(createdScenario.getDescription())
          .isEqualTo("Security assessment test plan for threat context XYZ.");
      assertThat(createdScenario.getSecurityAssessment().getExternalId())
          .isEqualTo("x-security-assessment--4c3b91e2-3b47-4f84-b2e6-d27e3f0581c1");
      assertThat(createdScenario.getRecurrence()).isEqualTo("0 0 16 * * *");

      List<Inject> injects = injectRepository.findByScenarioId(scenarioId);
      assertThat(injects).hasSize(1);
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
                  post(STIX_API + "/process-bundle")
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

  // Test update injects
  // Tests errors (without attacks ->update scenario -> delete injects?, bundles empty)
}
