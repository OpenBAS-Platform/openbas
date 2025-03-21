package io.openbas.rest.custom_dashboard;

import static io.openbas.rest.custom_dashboard.CustomDashboardApi.CUSTOM_DASHBOARDS_URI;
import static io.openbas.rest.custom_dashboard.CustomDashboardFixture.NAME;
import static io.openbas.rest.custom_dashboard.CustomDashboardFixture.createDefaultCustomDashboard;
import static io.openbas.utils.JsonUtils.asJsonString;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import io.openbas.IntegrationTest;
import io.openbas.database.model.CustomDashboard;
import io.openbas.database.repository.CustomDashboardRepository;
import io.openbas.rest.custom_dashboard.form.CustomDashboardInput;
import io.openbas.utils.mockUser.WithMockAdminUser;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@Transactional
class CustomDashboardApiTest extends IntegrationTest {

  @Autowired private MockMvc mockMvc;
  @Autowired private CustomDashboardRepository repository;
  @Autowired private CustomDashboardComposer customDashboardComposer;

  CustomDashboardComposer.Composer createCustomDashboardComposer() {
    return this.customDashboardComposer
        .forCustomDashboard(createDefaultCustomDashboard())
        .persist();
  }

  @Test
  @WithMockAdminUser
  void given_valid_dashboard_input_when_creating_dashboard_should_return_created_dashboard()
      throws Exception {
    // -- PREPARE --
    CustomDashboardInput input = new CustomDashboardInput();
    String name = "New Dashboard";
    input.setName(name);
    input.setContent("{\"chart\": \"bar\"}");

    // -- EXECUTE & ASSERT --
    mockMvc
        .perform(
            post(CUSTOM_DASHBOARDS_URI)
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(input)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.custom_dashboard_name").value(name));

    assertThat(repository.findByName(name)).isPresent();
  }

  @Test
  @WithMockAdminUser
  void given_dashboards_should_return_all_dashboards() throws Exception {
    // -- PREPARE --
    createCustomDashboardComposer();

    // -- EXECUTE & ASSERT --
    mockMvc
        .perform(get(CUSTOM_DASHBOARDS_URI))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(1))
        .andExpect(jsonPath("$[0].custom_dashboard_name").value(NAME));
  }

  @Test
  @WithMockAdminUser
  void given_dashboard_id_when_fetching_dashboard_should_return_dashboard() throws Exception {
    // -- PREPARE --
    CustomDashboardComposer.Composer wrapper = createCustomDashboardComposer();

    // -- EXECUTE & ASSERT --
    mockMvc
        .perform(get(CUSTOM_DASHBOARDS_URI + "/" + wrapper.get().getId()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.custom_dashboard_name").value(NAME));
  }

  @Test
  @WithMockAdminUser
  void given_updated_dashboard_input_when_updating_dashboard_should_return_updated_dashboard()
      throws Exception {
    // -- PREPARE --
    CustomDashboardComposer.Composer wrapper = createCustomDashboardComposer();
    CustomDashboard customDashboard = wrapper.get();
    String customDashboardDescription = "description";
    customDashboard.setDescription(customDashboardDescription);

    // -- EXECUTE & ASSERT --
    mockMvc
        .perform(
            put(CUSTOM_DASHBOARDS_URI + "/" + customDashboard.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(customDashboard)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.custom_dashboard_name").value(NAME))
        .andExpect(jsonPath("$.custom_dashboard_description").value(customDashboardDescription));

    Optional<CustomDashboard> updatedDashboard = repository.findById(customDashboard.getId());
    assertThat(updatedDashboard).isPresent();
    assertThat(updatedDashboard.get().getDescription()).isEqualTo(customDashboardDescription);
  }

  @Test
  @WithMockAdminUser
  void given_dashboard_id_when_deleting_dashboard_should_return_no_content() throws Exception {
    // -- PREPARE --
    CustomDashboardComposer.Composer wrapper = createCustomDashboardComposer();

    // -- EXECUTE & ASSERT --
    mockMvc
        .perform(delete(CUSTOM_DASHBOARDS_URI + "/" + wrapper.get().getId()))
        .andExpect(status().isNoContent());

    assertThat(repository.existsById(wrapper.get().getId())).isFalse();
  }
}
