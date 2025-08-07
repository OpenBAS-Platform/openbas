package io.openbas.rest.onboarding;

import static io.openbas.config.SessionHelper.currentUser;
import static io.openbas.rest.asset.endpoint.EndpointApi.ENDPOINT_URI;
import static io.openbas.api.onboarding.OnboardingApi.ONBOARDING_URI;
import static io.openbas.utils.JsonUtils.asJsonString;
import static io.openbas.utils.UserOnboardingProgressUtils.ENDPOINT_SETUP;
import static io.openbas.utils.UserOnboardingProgressUtils.TECHNICAL_SETUP;
import static io.openbas.utils.fixtures.EndpointFixture.createEndpoint;
import static io.openbas.utils.fixtures.UserOnboardingProgressFixture.createDefaultUserOnboardingProgress;
import static net.javacrumbs.jsonunit.assertj.JsonAssertions.assertThatJson;
import static org.junit.jupiter.api.Assertions.*;
import static org.junit.jupiter.api.TestInstance.Lifecycle.PER_CLASS;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jayway.jsonpath.JsonPath;
import io.openbas.IntegrationTest;
import io.openbas.database.model.Endpoint;
import io.openbas.database.model.User;
import io.openbas.api.onboarding.output.OnboardingCategoryDTO;
import io.openbas.service.UserService;
import io.openbas.utils.fixtures.composers.onboarding.UserOnboardingProgressComposer;
import io.openbas.utils.mockUser.WithMockAdminUser;
import jakarta.annotation.Resource;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.Map;
import net.javacrumbs.jsonunit.core.Option;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@TestInstance(PER_CLASS)
@Transactional
@WithMockAdminUser
@DisplayName("Onboarding api tests")
class OnboardingApiTest extends IntegrationTest {

  @Autowired private MockMvc mvc;
  @Resource protected ObjectMapper mapper;
  @Autowired private UserOnboardingProgressComposer userOnboardingProgressComposer;
  @Autowired private UserService userService;
  @Autowired private EntityManager entityManager;

  @BeforeEach
  void setUp() {
    userOnboardingProgressComposer.reset();
  }

  @WithMockAdminUser
  @Test
  @DisplayName("Return an onboarding progress")
  void given_an_user_should_return_an_onboarding_progress() throws Exception {
    // -- EXECUTE --
    String response =
        mvc.perform(get(ONBOARDING_URI))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();

    // -- ASSERT --
    assertNotNull(response);
    List<Object> progressList = JsonPath.read(response, "$.progress");
    for (Object item : progressList) {
      Map<String, Object> step = (Map<String, Object>) item;
      assertEquals(false, step.get("skipped"));
      assertEquals(false, step.get("completed"));
    }
  }

  @WithMockAdminUser
  @Test
  @DisplayName("Return the onboarding config")
  void should_return_the_onboarding_config() throws Exception {
    // -- EXECUTE --
    String response =
        mvc.perform(get(ONBOARDING_URI + "/config"))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();

    // -- ASSERT --
    assertNotNull(response);
    List<OnboardingCategoryDTO> config = mapper.readValue(response, new TypeReference<>() {});
    assertTrue(TECHNICAL_SETUP.equals(config.getFirst().category()));
    assertTrue(ENDPOINT_SETUP.equals(config.getFirst().items().getFirst().labelKey()));
  }

  @WithMockAdminUser
  @Test
  @DisplayName("Given specific steps should skipped them")
  void given_specific_steps_should_skipped_them() throws Exception {
    // -- PREPARE --
    User user = userService.user(currentUser().getId());
    this.userOnboardingProgressComposer
        .forUserOnboardingProgress(createDefaultUserOnboardingProgress(user))
        .persist();

    // -- EXECUTE --
    String response =
        mvc.perform(
                put(ONBOARDING_URI + "/skipped")
                    .content(asJsonString(List.of(ENDPOINT_SETUP)))
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();

    // -- ASSERT --
    assertNotNull(response);
    assertThatJson(response)
        .when(Option.IGNORING_ARRAY_ORDER)
        .node("progress[0].step")
        .isEqualTo("onboarding_endpoint_setup");
    assertThatJson(response)
        .when(Option.IGNORING_ARRAY_ORDER)
        .node("progress[0].skipped")
        .isEqualTo(true);
  }

  @WithMockAdminUser
  @Test
  @DisplayName("Given endpoint creation should complete step")
  void given_endpoint_creation_should_complete_step() throws Exception {
    // -- PREPARE --
    User user = userService.user(currentUser().getId());
    this.userOnboardingProgressComposer
        .forUserOnboardingProgress(createDefaultUserOnboardingProgress(user))
        .persist();
    Endpoint endpointInput = createEndpoint();
    entityManager.flush();
    entityManager.clear();

    // -- EXECUTE --
    mvc.perform(
            post(ENDPOINT_URI + "/agentless")
                .content(asJsonString(endpointInput))
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().is2xxSuccessful())
        .andReturn()
        .getResponse()
        .getContentAsString();

    String response =
        mvc.perform(get(ONBOARDING_URI))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();

    // -- ASSERT --
    assertNotNull(response);
    List<Object> progressList = JsonPath.read(response, "$.progress");
    for (Object item : progressList) {
      Map<String, Object> step = (Map<String, Object>) item;
      if ("onboarding_endpoint_setup".equals(step.get("step"))) {
        assertEquals(true, step.get("completed"));
        assertEquals(false, step.get("skipped"));
      }
    }
  }
}
