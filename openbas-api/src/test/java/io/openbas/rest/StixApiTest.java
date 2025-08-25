package io.openbas.rest;

import static io.openbas.rest.StixApi.STIX_URI;
import static io.openbas.rest.scenario.ScenarioApi.SCENARIO_URI;
import static io.openbas.service.SecurityAssessmentService.INCIDENT_RESPONSE;
import static io.openbas.service.TagRuleService.OPENCTI_TAG_NAME;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.TestInstance.Lifecycle.PER_CLASS;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jayway.jsonpath.JsonPath;
import io.openbas.IntegrationTest;
import io.openbas.database.model.Inject;
import io.openbas.database.model.Scenario;
import io.openbas.database.model.StixRefToExternalRef;
import io.openbas.database.repository.InjectRepository;
import io.openbas.database.repository.ScenarioRepository;
import io.openbas.database.repository.SecurityAssessmentRepository;
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
  @Autowired private SecurityAssessmentRepository securityAssessmentRepository;

  @Autowired private AttackPatternComposer attackPatternComposer;

  private String stixSecurityAssessment;

  @BeforeEach
  void setUp() throws Exception {
    attackPatternComposer.reset();

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
              post(STIX_URI + "/process-bundle")
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
              post(STIX_URI + "/process-bundle")
                  .contentType(MediaType.APPLICATION_JSON)
                  .content(duplicatedAssessment))
          .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Should return 400 when STIX JSON is malformed")
    void shouldReturnBadRequestWhenStixJsonIsInvalid() throws Exception {
      String invalidJson = "{ not-a-valid-json }";

      mvc.perform(
              post(STIX_URI + "/process-bundle")
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
              post(STIX_URI + "/process-bundle")
                  .contentType(MediaType.APPLICATION_JSON)
                  .content(structurallyInvalidStix))
          .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Should create the scenario from stix bundle")
    void shouldCreateScenario() throws Exception {
      String response =
          mvc.perform(
                  post(STIX_URI + "/process-bundle")
                      .contentType(MediaType.APPLICATION_JSON)
                      .content(stixSecurityAssessment))
              .andExpect(status().isOk())
              .andReturn()
              .getResponse()
              .getContentAsString();

      assertThat(response).isNotBlank();

      Scenario createdScenario = scenarioRepository.findById(response).orElseThrow();

      // -- ASSERT Scenario --
      assertThat(createdScenario.getName())
          .isEqualTo("Security Assessment Q3 2025 - Threat Report XYZ");
      assertThat(createdScenario.getDescription())
          .isEqualTo("Security assessment test plan for threat context XYZ.");
      assertThat(createdScenario.getSecurityAssessment().getExternalId())
          .isEqualTo("x-security-assessment--4c3b91e2-3b47-4f84-b2e6-d27e3f0581c1");
      assertThat(createdScenario.getRecurrence()).isEqualTo("0 0 16 * * *");
      assertThat(createdScenario.getMainFocus()).isEqualTo(INCIDENT_RESPONSE);
      assertThat(createdScenario.getTags().stream().map(tag -> tag.getName()).toList())
          .contains(OPENCTI_TAG_NAME);

      // -- ASSERT Security Assessment --
      assertThat(createdScenario.getSecurityAssessment().getThreatContextRef())
          .isEqualTo("report--453a2ac1-e111-57bf-8277-dbec448cd851");
      assertThat(createdScenario.getSecurityAssessment().getAttackPatternRefs()).hasSize(2);

      StixRefToExternalRef stixRef1 =
          new StixRefToExternalRef("attack-pattern--a24d97e6-401c-51fc-be24-8f797a35d1f1", "T1531");
      StixRefToExternalRef stixRef2 =
          new StixRefToExternalRef("attack-pattern--033921be-85df-5f05-8bc0-d3d9fc945db9", "T1003");

      assertThat(createdScenario.getSecurityAssessment().getAttackPatternRefs()).hasSize(2);
      assertTrue(
          createdScenario
              .getSecurityAssessment()
              .getAttackPatternRefs()
              .containsAll(List.of(stixRef1, stixRef2)));
      assertThat(createdScenario.getSecurityAssessment().getVulnerabilitiesRefs()).isNull();
      assertThat(createdScenario.getSecurityAssessment().getContent()).isNotBlank();

      // -- ASSERT Injects --
      List<Inject> injects = injectRepository.findByScenarioId(response);
      assertThat(injects).hasSize(10);
    }

    @Test
    @DisplayName("Should update scenario from same security assessment")
    void shouldUpdateScenario() throws Exception {
      String createdResponse =
          mvc.perform(
                  post(STIX_URI + "/process-bundle")
                      .contentType(MediaType.APPLICATION_JSON)
                      .content(stixSecurityAssessment))
              .andExpect(status().isOk())
              .andReturn()
              .getResponse()
              .getContentAsString();

      Scenario createdScenario = scenarioRepository.findById(createdResponse).orElseThrow();
      assertThat(createdScenario.getName())
          .isEqualTo("Security Assessment Q3 2025 - Threat Report XYZ");

      List<Inject> injects = injectRepository.findByScenarioId(createdScenario.getId());
      assertThat(injects).hasSize(10);

      String updatedBundle =
          stixSecurityAssessment
              .replace(
                  "Security Assessment Q3 2025 - Threat Report XYZ",
                  "Security Assessment Q3 2025 - UPDATED")
              .replaceFirst("\"object_refs\"\\s*:\\s*\\[.*?\\]", "");

      String updatedResponse =
          mvc.perform(
                  post(STIX_URI + "/process-bundle")
                      .contentType(MediaType.APPLICATION_JSON)
                      .content(updatedBundle))
              .andExpect(status().isOk())
              .andReturn()
              .getResponse()
              .getContentAsString();

      Scenario updatedScenario = scenarioRepository.findById(updatedResponse).orElseThrow();
      assertThat(updatedScenario.getName()).isEqualTo("Security Assessment Q3 2025 - UPDATED");
      // ASSERT injects for updated stix
      injects = injectRepository.findByScenarioId(updatedScenario.getId());
      assertThat(injects).hasSize(0);
    }

    @Test
    @DisplayName("Should not remove security assessment even if scenario is deleted")
    void shouldExistSecurityAssessment() throws Exception {

      String response =
          mvc.perform(
                  post(STIX_URI + "/process-bundle")
                      .contentType(MediaType.APPLICATION_JSON)
                      .content(stixSecurityAssessment))
              .andExpect(status().isOk())
              .andReturn()
              .getResponse()
              .getContentAsString();

      Scenario scenario = scenarioRepository.findById(response).orElseThrow();
      String securityAssessmentId = scenario.getSecurityAssessment().getId();
      scenarioRepository.deleteById(response);

      assertThat(securityAssessmentRepository.findByExternalId(securityAssessmentId));
    }

    @Test
    @DisplayName("Should not duplicate security assessment reference when scenario is duplicated")
    void shouldNotDuplicatedReferenceSecurityAssessment() throws Exception {

      String response =
          mvc.perform(
                  post(STIX_URI + "/process-bundle")
                      .contentType(MediaType.APPLICATION_JSON)
                      .content(stixSecurityAssessment))
              .andExpect(status().isOk())
              .andReturn()
              .getResponse()
              .getContentAsString();

      String duplicated =
          mvc.perform(post(SCENARIO_URI + "/" + response).contentType(MediaType.APPLICATION_JSON))
              .andExpect(status().isOk())
              .andReturn()
              .getResponse()
              .getContentAsString();

      String scenarioId = JsonPath.read(duplicated, "$.scenario_id");

      Scenario duplicatedScenario = scenarioRepository.findById(scenarioId).orElseThrow();

      assertThat(duplicatedScenario.getSecurityAssessment()).isNull();
    }
  }
}
