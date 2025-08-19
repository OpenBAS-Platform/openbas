package io.openbas.api.custom_dashboard;

import static io.openbas.jsonapi.GenericJsonApiIUtils.JSONAPI;
import static io.openbas.rest.custom_dashboard.CustomDashboardApi.CUSTOM_DASHBOARDS_URI;
import static io.openbas.utils.Constants.IMPORTED_OBJECT_NAME_SUFFIX;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.IntegrationTest;
import io.openbas.utils.mockUser.WithMockAdminUser;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@Transactional
@WithMockAdminUser
@DisplayName("Onboarding api importer tests")
class CustomDashboardApiImporterTest extends IntegrationTest {

  @Autowired private MockMvc mockMvc;

  @Test
  @DisplayName("Import a custom dashboard with include returns complete entity")
  void import_custom_dashboard_with_include_returns_custom_dashboard_with_relationship()
      throws Exception {
    // -- PREPARE --
    String payload =
        """
        {
          "data": {
            "type": "custom_dashboards",
            "attributes": {
              "custom_dashboard_name": "Custom dashboard name"
            }
          }
        }
        """;

    // -- EXECUTE --
    String response =
        mockMvc
            .perform(
                post(CUSTOM_DASHBOARDS_URI + "/import")
                    .queryParam("include", "true")
                    .contentType(JSONAPI)
                    .content(payload))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();

    // -- ASSERT --
    assertNotNull(response);

    JsonNode json = new ObjectMapper().readTree(response);
    assertEquals("custom_dashboards", json.at("/data/type").asText());
    assertEquals(
        "Custom dashboard name " + IMPORTED_OBJECT_NAME_SUFFIX,
        json.at("/data/attributes/custom_dashboard_name").asText());
  }
}
