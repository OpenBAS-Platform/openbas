package io.openbas.api.payload;

import static io.openbas.jsonapi.GenericJsonApiIUtils.JSONAPI;
import static io.openbas.rest.custom_dashboard.CustomDashboardApi.CUSTOM_DASHBOARDS_URI;
import static io.openbas.utils.Constants.IMPORTED_OBJECT_NAME_SUFFIX;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
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
@DisplayName("Payload api importer tests")
class PayloadApiImporterTest extends IntegrationTest {

  @Autowired private MockMvc mockMvc;

  @Test
  @DisplayName("Import a payload returns complete entity")
  void import_custom_dashboard_with_include_returns_custom_dashboard_with_relationship()
      throws Exception {
    // -- PREPARE --
    String payload =
        """
            {
               "data" : {
                 "id" : "3cdc3874-381e-4ea5-8e02-af1d61d229fa",
                 "type" : "custom_dashboards",
                 "attributes" : {
                   "custom_dashboard_id" : "3cdc3874-381e-4ea5-8e02-af1d61d229fa",
                   "custom_dashboard_name" : "Custom dashboard",
                   "custom_dashboard_description" : "Une description",
                   "custom_dashboard_created_at" : "2025-08-27T12:02:28.449630Z",
                   "custom_dashboard_updated_at" : "2025-08-27T12:02:28.449630Z"
                 },
                 "relationships" : {
                   "custom_dashboard_widgets" : {
                     "data" : [ {
                       "id" : "d27b4bc9-d934-4b43-ae4c-b23103d177e5",
                       "type" : "widgets"
                     } ]
                   },
                   "custom_dashboard_parameters" : {
                     "data" : [ {
                       "id" : "20559f4d-0fcc-47f0-8226-3dedc1094cf9",
                       "type" : "custom_dashboards_parameters"
                     }, {
                       "id" : "612a6497-8914-4883-acf8-b3e659db15d6",
                       "type" : "custom_dashboards_parameters"
                     }, {
                       "id" : "8e7862cb-5db8-4e14-8425-6689b4ffb372",
                       "type" : "custom_dashboards_parameters"
                     }, {
                       "id" : "bbf72e31-11c2-48f5-9fb3-8006e7054c7e",
                       "type" : "custom_dashboards_parameters"
                     } ]
                   }
                 }
               },
               "included" : [ {
                 "id" : "d27b4bc9-d934-4b43-ae4c-b23103d177e5",
                 "type" : "widgets",
                 "attributes" : {
                   "widget_id" : "d27b4bc9-d934-4b43-ae4c-b23103d177e5",
                   "widget_type" : "donut",
                   "widget_config" : {
                     "start" : null,
                     "end" : null,
                     "mode" : "structural",
                     "stacked" : false,
                     "limit" : 100,
                     "field" : "base_tags_side",
                     "series" : [ {
                       "name" : "Donut widget series",
                       "filter" : {
                         "mode" : "and",
                         "filters" : [ {
                           "key" : "base_entity",
                           "mode" : "or",
                           "values" : [ "scenario" ],
                           "operator" : "eq"
                         }, {
                           "key" : "base_tags_side",
                           "mode" : "or",
                           "values" : [ "2b21216e-181a-4854-b879-8956bd6b3101" ],
                           "operator" : "contains"
                         } ]
                       }
                     } ],
                     "widget_configuration_type" : "structural-histogram",
                     "title" : "Donut widget",
                     "time_range" : "DEFAULT",
                     "date_attribute" : "base_created_at",
                     "display_legend" : false
                   },
                   "widget_layout" : {
                     "widget_layout_w" : 10,
                     "widget_layout_h" : 10,
                     "widget_layout_x" : 0,
                     "widget_layout_y" : 0
                   },
                   "widget_created_at" : "2025-08-27T12:03:08.267003Z",
                   "widget_updated_at" : "2025-08-27T12:03:20.120541Z"
                 }
               }, {
                 "id" : "20559f4d-0fcc-47f0-8226-3dedc1094cf9",
                 "type" : "custom_dashboards_parameters",
                 "attributes" : {
                   "custom_dashboards_parameter_id" : "20559f4d-0fcc-47f0-8226-3dedc1094cf9",
                   "custom_dashboards_parameter_name" : "scenario",
                   "custom_dashboards_parameter_type" : "scenario"
                 }
               }, {
                 "id" : "612a6497-8914-4883-acf8-b3e659db15d6",
                 "type" : "custom_dashboards_parameters",
                 "attributes" : {
                   "custom_dashboards_parameter_id" : "612a6497-8914-4883-acf8-b3e659db15d6",
                   "custom_dashboards_parameter_name" : "Time range",
                   "custom_dashboards_parameter_type" : "timeRange"
                 }
               }, {
                 "id" : "8e7862cb-5db8-4e14-8425-6689b4ffb372",
                 "type" : "custom_dashboards_parameters",
                 "attributes" : {
                   "custom_dashboards_parameter_id" : "8e7862cb-5db8-4e14-8425-6689b4ffb372",
                   "custom_dashboards_parameter_name" : "Start date",
                   "custom_dashboards_parameter_type" : "startDate"
                 }
               }, {
                 "id" : "bbf72e31-11c2-48f5-9fb3-8006e7054c7e",
                 "type" : "custom_dashboards_parameters",
                 "attributes" : {
                   "custom_dashboards_parameter_id" : "bbf72e31-11c2-48f5-9fb3-8006e7054c7e",
                   "custom_dashboards_parameter_name" : "End date",
                   "custom_dashboards_parameter_type" : "endDate"
                 }
               } ]
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

    // Custom dashboard
    JsonNode json = new ObjectMapper().readTree(response);
    assertEquals("custom_dashboards", json.at("/data/type").asText());
    assertEquals(
        "Custom dashboard name " + IMPORTED_OBJECT_NAME_SUFFIX,
        json.at("/data/attributes/custom_dashboard_name").asText());
    assertEquals(
        "A description", json.at("/data/attributes/custom_dashboard_description").asText());

    // Params
    JsonNode paramsRel = json.at("/data/relationships/custom_dashboard_parameters/data");
    assertEquals(4, paramsRel.size());

    // Widget
    JsonNode widgetsRel = json.at("/data/relationships/custom_dashboard_widgets/data");
    assertEquals(1, widgetsRel.size());
    JsonNode widget = json.at("/included").get(0);
    assertEquals("donut", widget.at("/attributes/widget_type").asText());
    assertEquals("Donut widget", widget.at("/attributes/widget_config/title").asText());
  }
}
