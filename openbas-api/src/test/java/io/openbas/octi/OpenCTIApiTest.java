package io.openbas.octi;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import io.openbas.rest.exercise.form.ExerciseSimple;
import io.openbas.rest.inject.InjectApi;
import java.util.Collections;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
public class OpenCTIApiTest {

  @Mock InjectApi injectApi;
  private MockMvc mockMvc;

  @BeforeEach
  public void setUp() {
    mockMvc = MockMvcBuilders.standaloneSetup(injectApi).build();
  }

  /**
   * Feature: OCTI OBAS - GENERATION SCENARIOS
   *
   * Currently, OCTI uses the following endpoints to simulate scenarios from different types of
   * entities such as (case incidents, groupings, reports, malwares, incidents, campaigns, intrusion
   * sets, threat actor groups, threat actors individuals):
   *
   * - KillChainPhasesApi -> killChainPhases [GET: /api/kill-chain-phases/] - AttackPatternApi ->
   * attackPatterns [GET: /api/attack_patterns/] - AttackPatternApi -> injectorContracts [GET:
   * /api/attack_patterns/{attackPatternId}/injector_contracts] - InjectorContractApi ->
   * injectorContracts [POST: /api/injector_contracts/search] - ScenarioApi -> creationScenario
   * [POST: /api/scenarios/] - InjectApi -> createInjectForScenario [POST:
   * /api/injects/{scenarioId}/injects] - OpenCTIApi -> latestExerciseByExternalId [GET:
   * /api/opencti/v1/exercises/latest/{externalReferenceId}]
   *
   * These no regression tests will help us maintain control over any modifications to these
   * endpoints.
   */

  // -- KILL CHAIN PHASES --

  @Test
  public void testGetKillChainPhases_Sucess() throws Exception {
    // -- PREPARE --

    // -- EXECUTE --
    mockMvc
        .perform(get("/api/kill_chain_phases").contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk());
  }

  // -- ATTACK PATTERNS  --

  // -- INJECTOR CONTRACTS --
  @Test
  public void testGetInjectorContracts_Success() throws Exception {
    // -- PREPARE --
    String attackPatternId = "attackPatternId";

    // -- EXECUTE --
    mockMvc
        .perform(
            get("/api/attack_patterns/{attackPatternId}/injector_contracts", attackPatternId)
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk());
  }

  @Test
  public void testSearchInjectorContracts_ValidInput() throws Exception {
    // -- PREPARE --
    String jsonInput =
        "{"
            + "\"page\": 0, "
            + "\"size\": 100, "
            + "\"filterGroup\": {"
            + "  \"filters\": ["
            + "    {\"key\": \"injector_contract_attack_patterns\", \"operator\": \"contains\", \"values\": [\"attackPatternId\"]},"
            + "    {\"key\": \"injector_contract_platforms\", \"operator\": \"contains\", \"values\": [\"platform1\", \"platform2\"]},"
            + "    {\"key\": \"injector_contract_arch\", \"operator\": \"eq\", \"values\": [\"ARM64\"]}"
            + "  ],"
            + "  \"mode\": \"and\""
            + "},"
            + "\"textSearch\": \"searchText\", "
            + "\"sorts\": [{\"property\": \"label\", \"direction\": \"asc\"}]"
            + "}";

    // -- EXECUTE --
    mockMvc
        .perform(
            post("/api/injector_contracts/search")
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonInput))
        .andExpect(status().isOk());
  }

  // -- SCENARIO --

  @Test
  public void testCreateInjectForScenario_ValidInput() throws Exception {
    // -- PREPARE --
    String jsonInput =
        "{"
            + "\"inject_title\": \"Valid Title\", "
            + "\"inject_description\": \"Valid Description\", "
            + "\"inject_injector_contract\": \"contract-id\", "
            + "\"inject_content\": null, "
            + "\"inject_depends_duration\": 100, "
            + "\"inject_teams\": [\"Team1\"], "
            + "\"inject_tags\": [\"Tag1\"]"
            + "}";

    // -- EXECUTE --
    mockMvc
        .perform(
            post("/api/scenarios/{scenarioId}/injects", "scenario-id")
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonInput))
        .andExpect(status().isOk());
  }

  @Test
  public void testCreateInjectForScenario_InputWithAdditionalParam() throws Exception {
    // -- PREPARE --
    String jsonInput =
        "{"
            + "\"inject_title\": null, "
            + "\"inject_description\": \"Test for updated InjectInput with param architectureRequest for obas >=v1.10 and octi >=v6.4\", "
            + "\"inject_architecture_request\": \"ARM64\", "
            + "\"inject_additional_param\": \"additional_param\""
            + "}";

    // -- EXECUTE --
    mockMvc
        .perform(
            post("/api/scenarios/{scenarioId}/injects", "scenario-id")
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonInput))
        .andExpect(status().isOk());
  }

  // -- INJECTS --

  // -- LAST EXERCISE BY EXTERNAL ID --

  @Test
  public void testGetLatestExerciseByExternalReference_Success() throws Exception {
    // -- PREPARE --
    String externalReferenceId = "valid-id";
    ExerciseSimple exercise = new ExerciseSimple();
    exercise.setId("exercise-id");
    exercise.setExpectationResultByTypes(Collections.emptyList());

    // -- EXECUTE --
    mockMvc
        .perform(
            get("/opencti/v1/exercises/latest/{externalReferenceId}", externalReferenceId)
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(header().string("version", "v1"));
  }
}
