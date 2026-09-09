package io.openaev.api.custom_dashboard;

import static io.openaev.rest.custom_dashboard.CustomDashboardApi.CUSTOM_DASHBOARDS_URI;
import static io.openaev.rest.custom_dashboard.CustomDashboardApi.TENANT_CUSTOM_DASHBOARDS_URI;
import static io.openaev.utils.JsonTestUtils.asJsonString;
import static io.openaev.utils.constants.Constants.IMPORTED_OBJECT_NAME_SUFFIX;
import static java.util.Collections.emptyList;
import static java.util.Collections.emptyMap;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jayway.jsonpath.JsonPath;
import io.openaev.IntegrationTest;
import io.openaev.database.model.Capability;
import io.openaev.database.model.CustomDashboard;
import io.openaev.database.model.Tenant;
import io.openaev.jsonapi.JsonApiDocument;
import io.openaev.jsonapi.ResourceObject;
import io.openaev.service.ZipJsonService;
import io.openaev.utils.TenantIsolationTestHelper;
import io.openaev.utils.fixtures.CustomDashboardFixture;
import io.openaev.utils.fixtures.PaginationFixture;
import io.openaev.utils.fixtures.composers.CustomDashboardComposer;
import io.openaev.utils.mockUser.WithMockUser;
import io.openaev.utils.pagination.SearchPaginationInput;
import jakarta.persistence.EntityManager;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@Transactional
@WithMockUser(isAdmin = true)
@DisplayName("Custom dashboard api importer tests")
class CustomDashboardApiImporterTest extends IntegrationTest {

  @Autowired private MockMvc mockMvc;
  @Autowired private ZipJsonService<CustomDashboard> zipJsonService;
  @Autowired private TenantIsolationTestHelper tenantIsolationHelper;
  @Autowired private EntityManager entityManager;
  @Autowired private CustomDashboardComposer customDashboardComposer;

  private MockMultipartFile createImportZipFile(String dashboardName, String dashboardDescription)
      throws Exception {
    Map<String, Object> attributes = new HashMap<>();
    attributes.put("custom_dashboard_name", dashboardName);
    attributes.put("custom_dashboard_description", dashboardDescription);
    JsonApiDocument<ResourceObject> document =
        new JsonApiDocument<>(
            new ResourceObject(null, "custom_dashboards", attributes, emptyMap()), emptyList());
    byte[] zip = zipJsonService.writeZip(document, emptyMap());
    return new MockMultipartFile("file", "custom_dashboard.zip", "application/zip", zip);
  }

  /**
   * Seeds a custom dashboard directly in the given tenant, bypassing the import REST endpoint.
   *
   * <p>Cross-tenant isolation tests only need a dashboard to already exist in tenant X before
   * asserting it is not reachable from tenant Y; going through the import endpoint would run its
   * own {@code @Transactional} scope-setting inside the same physical (single, test-wrapping)
   * transaction as the subsequent tenant Y request, which the tenant scope guard correctly refuses
   * to redefine. Seeding via the composer avoids that entirely, like {@code
   * ScenarioImportApiTenantIsolationTest#seedMapper}.
   */
  private String seedCustomDashboard(Tenant tenant, String name) {
    CustomDashboard customDashboard = CustomDashboardFixture.createDefaultCustomDashboard();
    customDashboard.setName(name);
    customDashboard.setTenant(tenant);
    customDashboardComposer.forCustomDashboard(customDashboard).persist();
    entityManager.flush();
    entityManager.clear();
    return customDashboard.getId();
  }

  @Test
  @DisplayName("Import a custom dashboard returns complete entity")
  void import_custom_dashboard_with_include_returns_custom_dashboard_with_relationship()
      throws Exception {
    // -- PREPARE --
    MockMultipartFile zipFile = createImportZipFile("Custom dashboard", "A description");

    // -- EXECUTE --
    String response =
        mockMvc
            .perform(multipart(CUSTOM_DASHBOARDS_URI + "/import").file(zipFile).with(csrf()))
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
        "Custom dashboard" + IMPORTED_OBJECT_NAME_SUFFIX,
        json.at("/data/attributes/custom_dashboard_name").asText());
    assertEquals(
        "A description", json.at("/data/attributes/custom_dashboard_description").asText());
  }

  @Nested
  @DisplayName("Tenant Isolation")
  @WithMockUser
  class TenantIsolation {

    @Test
    @DisplayName("Custom dashboard imported in tenant X should NOT be readable from tenant Y")
    void given_customDashboardImportedInTenantX_should_notBeReadableFromTenantY() throws Exception {
      // Arrange
      Tenant tenantX =
          tenantIsolationHelper.createTenantWithCapabilities(
              "Tenant X", Set.of(Capability.MANAGE_DASHBOARDS, Capability.ACCESS_DASHBOARDS));
      Tenant tenantY =
          tenantIsolationHelper.createTenantWithCapabilities(
              "Tenant Y", Set.of(Capability.ACCESS_DASHBOARDS));

      String dashboardId = seedCustomDashboard(tenantX, "Import Isolation Dashboard");

      // Act
      int responseStatus =
          mockMvc
              .perform(
                  get(TENANT_CUSTOM_DASHBOARDS_URI.replace("{tenantId}", tenantY.getId())
                          + "/"
                          + dashboardId)
                      .with(csrf()))
              .andReturn()
              .getResponse()
              .getStatus();

      // Assert
      assertThat(responseStatus).isEqualTo(HttpStatus.NOT_FOUND.value());
    }

    @Test
    @DisplayName("Custom dashboard imported in tenant X should be readable from tenant X")
    void given_customDashboardImportedInTenantX_should_beReadableFromTenantX() throws Exception {
      // Arrange
      Tenant tenantX =
          tenantIsolationHelper.createTenantWithCapabilities(
              "Tenant X", Set.of(Capability.MANAGE_DASHBOARDS, Capability.ACCESS_DASHBOARDS));

      MockMultipartFile zipFile =
          createImportZipFile("Import Same Tenant Dashboard", "Same tenant");

      String importResponse =
          mockMvc
              .perform(
                  multipart(
                          TENANT_CUSTOM_DASHBOARDS_URI.replace("{tenantId}", tenantX.getId())
                              + "/import")
                      .file(zipFile)
                      .with(csrf()))
              .andExpect(status().is2xxSuccessful())
              .andReturn()
              .getResponse()
              .getContentAsString();

      String dashboardId = JsonPath.read(importResponse, "$.data.id");

      // Act + Assert
      mockMvc
          .perform(
              get(TENANT_CUSTOM_DASHBOARDS_URI.replace("{tenantId}", tenantX.getId())
                      + "/"
                      + dashboardId)
                  .with(csrf()))
          .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Custom dashboard imported in tenant X should NOT appear in tenant Y search")
    void given_customDashboardImportedInTenantX_should_notAppearInTenantYSearch() throws Exception {
      // Arrange
      Tenant tenantX =
          tenantIsolationHelper.createTenantWithCapabilities(
              "Tenant X", Set.of(Capability.MANAGE_DASHBOARDS, Capability.ACCESS_DASHBOARDS));
      Tenant tenantY =
          tenantIsolationHelper.createTenantWithCapabilities(
              "Tenant Y", Set.of(Capability.ACCESS_DASHBOARDS));

      String dashboardName = "CrossTenantImportSearchDashboard";
      seedCustomDashboard(tenantX, dashboardName);

      SearchPaginationInput searchInput = PaginationFixture.simpleTextSearch(dashboardName);

      // Act
      String searchResponse =
          mockMvc
              .perform(
                  post(TENANT_CUSTOM_DASHBOARDS_URI.replace("{tenantId}", tenantY.getId())
                          + "/search")
                      .content(asJsonString(searchInput))
                      .contentType(MediaType.APPLICATION_JSON)
                      .accept(MediaType.APPLICATION_JSON)
                      .with(csrf()))
              .andExpect(status().is2xxSuccessful())
              .andReturn()
              .getResponse()
              .getContentAsString();

      // Assert
      assertEquals(Integer.valueOf(0), JsonPath.read(searchResponse, "$.totalElements"));
    }
  }
}
