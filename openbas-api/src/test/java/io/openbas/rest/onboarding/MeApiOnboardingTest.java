package io.openbas.rest.onboarding;

import static io.openbas.config.SessionHelper.currentUser;
import static io.openbas.rest.user.MeApi.ME_URI;
import static io.openbas.utils.JsonUtils.asJsonString;
import static org.junit.jupiter.api.Assertions.*;
import static org.junit.jupiter.api.TestInstance.Lifecycle.PER_CLASS;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.jayway.jsonpath.JsonPath;
import io.openbas.IntegrationTest;
import io.openbas.database.model.User;
import io.openbas.database.model.UserOnboardingStatus;
import io.openbas.rest.user.form.user.UpdateOnboardingInput;
import io.openbas.service.UserService;
import io.openbas.utils.fixtures.composers.UserComposer;
import io.openbas.utils.mockUser.WithMockAdminUser;
import jakarta.transaction.Transactional;
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
@DisplayName("Me api onboarding tests")
class MeApiOnboardingTest extends IntegrationTest {

  @Autowired private MockMvc mvc;
  @Autowired private UserComposer userComposer;
  @Autowired private UserService userService;

  @BeforeEach
  void setUp() {
    userComposer.reset();
  }

  @WithMockAdminUser
  @Test
  @DisplayName("Update onboarding")
  void given_onboarding_settings_should_update_it_on_user() throws Exception {
    // -- PREPARE --
    UpdateOnboardingInput input = new UpdateOnboardingInput();
    input.setOnboardingWidgetEnable(UserOnboardingStatus.DISABLED);
    input.setOnboardingContextualHelpEnable(UserOnboardingStatus.DISABLED);

    User user = userService.user(currentUser().getId());
    assertTrue(UserOnboardingStatus.DEFAULT.equals(user.getOnboardingWidgetEnable()));
    assertTrue(UserOnboardingStatus.DEFAULT.equals(user.getOnboardingContextualHelpEnable()));

    // -- EXECUTE --
    String response =
        mvc.perform(
                put(ME_URI + "/onboarding")
                    .content(asJsonString(input))
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();

    // -- ASSERT --
    assertNotNull(response);
    String widgetEnable = JsonPath.read(response, "$.user_onboarding_widget_enable");
    assertEquals("DISABLED", widgetEnable);
    String contextualHelpEnable =
        JsonPath.read(response, "$.user_onboarding_contextual_help_enable");
    assertEquals("DISABLED", contextualHelpEnable);
  }
}
