package io.openbas.rest.onboarding;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.TestInstance.Lifecycle.PER_CLASS;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.jayway.jsonpath.JsonPath;
import io.openbas.IntegrationTest;
import io.openbas.utils.mockUser.WithMockAdminUser;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.MockMvc;

@TestInstance(PER_CLASS)
@Transactional
@WithMockAdminUser
@DisplayName("Platform settings api onboarding tests")
class PlatformSettingsApiOnboardingTest extends IntegrationTest {

  @Autowired private MockMvc mvc;

  @WithMockAdminUser
  @Test
  @DisplayName("Retrieve default platform settings")
  void retrieve_default_platform_settings() throws Exception {
    // -- EXECUTE --
    String response =
        mvc.perform(get("/api/settings/default"))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();

    // -- ASSERT --
    assertNotNull(response);
    boolean widgetEnable = JsonPath.read(response, "$.platform_onboarding_widget_enable");
    assertTrue(widgetEnable);
    boolean contextualHelpEnable =
        JsonPath.read(response, "$.platform_onboarding_contextual_help_enable");
    assertTrue(contextualHelpEnable);
  }
}
