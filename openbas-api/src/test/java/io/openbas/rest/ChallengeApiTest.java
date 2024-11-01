package io.openbas.rest;

import static io.openbas.injectors.challenge.ChallengeContract.CHALLENGE_PUBLISH;
import static io.openbas.rest.scenario.ScenarioApi.SCENARIO_URI;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.TestInstance.Lifecycle.PER_CLASS;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jayway.jsonpath.JsonPath;
import io.openbas.database.model.Challenge;
import io.openbas.database.model.Inject;
import io.openbas.database.model.Scenario;
import io.openbas.database.repository.ChallengeRepository;
import io.openbas.database.repository.InjectRepository;
import io.openbas.database.repository.InjectorContractRepository;
import io.openbas.database.repository.ScenarioRepository;
import io.openbas.injectors.challenge.model.ChallengeContent;
import io.openbas.service.ScenarioService;
import io.openbas.utils.mockUser.WithMockObserverUser;
import jakarta.annotation.Resource;
import java.util.List;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@TestInstance(PER_CLASS)
class ChallengeApiTest {

  @Autowired private MockMvc mvc;

  @Autowired private ScenarioRepository scenarioRepository;
  @Autowired private ScenarioService scenarioService;
  @Autowired private InjectRepository injectRepository;
  @Autowired private ChallengeRepository challengeRepository;
  @Autowired private InjectorContractRepository injectorContractRepository;
  @Resource private ObjectMapper objectMapper;

  static String SCENARIO_ID;
  static String CHALLENGE_ID;
  static String INJECT_ID;

  @AfterAll
  void afterAll() {
    this.scenarioRepository.deleteById(SCENARIO_ID);
    this.challengeRepository.deleteById(CHALLENGE_ID);
    this.injectRepository.deleteById(INJECT_ID);
  }

  // -- SCENARIOS --

  @DisplayName("Retrieve challenges for scenario")
  @Test
  @Order(1)
  @WithMockObserverUser
  void retrieveChallengesVariableForScenarioTest() throws Exception {
    // -- PREPARE --
    Scenario scenario = new Scenario();
    scenario.setName("Scenario name");
    Scenario scenarioCreated = this.scenarioService.createScenario(scenario);
    SCENARIO_ID = scenarioCreated.getId();

    Challenge challenge = new Challenge();
    String challengeName = "My challenge";
    challenge.setName(challengeName);
    challenge = this.challengeRepository.save(challenge);
    CHALLENGE_ID = challenge.getId();
    ChallengeContent content = new ChallengeContent();
    content.setChallenges(List.of(challenge.getId()));
    Inject inject = new Inject();
    inject.setTitle("Test inject");
    inject.setInjectorContract(
        this.injectorContractRepository.findById(CHALLENGE_PUBLISH).orElseThrow());
    inject.setContent(this.objectMapper.valueToTree(content));
    inject.setDependsDuration(0L);
    inject.setScenario(scenario);
    inject = this.injectRepository.save(inject);
    INJECT_ID = inject.getId();

    // -- EXECUTE --
    String response =
        this.mvc
            .perform(
                get(SCENARIO_URI + "/" + SCENARIO_ID + "/challenges")
                    .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();

    // -- ASSERT --
    assertNotNull(response);
    assertEquals(challengeName, JsonPath.read(response, "$[0].challenge_name"));
  }
}
