package io.openbas.rest.dashboard;

import static io.openbas.rest.dashboard.DashboardApi.DASHBOARD_URI;
import static net.javacrumbs.jsonunit.assertj.JsonAssertions.assertThatJson;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import io.openbas.IntegrationTest;
import io.openbas.database.model.Endpoint;
import io.openbas.database.model.Filters;
import io.openbas.database.model.Widget;
import io.openbas.engine.EngineContext;
import io.openbas.engine.EngineService;
import io.openbas.engine.EsModel;
import io.openbas.engine.api.EngineSortField;
import io.openbas.engine.api.ListConfiguration;
import io.openbas.engine.api.SortDirection;
import io.openbas.utils.fixtures.*;
import io.openbas.utils.fixtures.CustomDashboardFixture;
import io.openbas.utils.fixtures.composers.*;
import io.openbas.utils.fixtures.composers.CustomDashboardComposer;
import io.openbas.utils.mockUser.WithMockAdminUser;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@Transactional
@WithMockAdminUser
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@DisplayName("Dashboard API tests")
class DashboardApiTest extends IntegrationTest {

  @Autowired private EngineService engineService;
  @Autowired private EngineContext engineContext;
  @Autowired private EndpointComposer endpointComposer;
  @Autowired private WidgetComposer widgetComposer;
  @Autowired private CustomDashboardComposer customDashboardComposer;
  @Autowired private MockMvc mvc;
  @Autowired private EntityManager entityManager;
  @Autowired private ExerciseComposer exerciseComposer;
  @Autowired private InjectComposer injectComposer;
  @Autowired private FindingComposer findingComposer;
  @Autowired private CustomDashboardParameterComposer customDashboardParameterComposer;

  @BeforeEach
  void setup() throws IOException {
    endpointComposer.reset();
    widgetComposer.reset();
    exerciseComposer.reset();
    injectComposer.reset();

    // force reset elastic
    for (EsModel<?> model : engineContext.getModels()) {
      engineService.cleanUpIndex(model.getName());
    }
  }

  @AfterAll
  void afterAll() {
    globalTeardown();
  }

  @Nested
  @DisplayName("When fetching entities from dimension")
  class WhenFetchingEntitiesFromDimension {

    @Test
    @DisplayName("When no specific filter, return all entities from dimension.")
    void WhenNoSpecificFilter_ReturnAllEntitiesFromDimension() throws Exception {
      Endpoint ep = endpointComposer.forEndpoint(EndpointFixture.createEndpoint()).persist().get();
      Widget widget =
          widgetComposer
              .forWidget(WidgetFixture.createListWidgetWithEntity("endpoint"))
              .withCustomDashboard(
                  customDashboardComposer.forCustomDashboard(
                      CustomDashboardFixture.createDefaultCustomDashboard()))
              .persist()
              .get();

      // force persistence
      entityManager.flush();
      entityManager.clear();
      engineService.bulkProcessing(engineContext.getModels().stream());
      // elastic needs to process the data; it does so async, so the method above
      // completes before the data is available in the system
      Thread.sleep(1000);

      String response =
          mvc.perform(
                  post(DASHBOARD_URI + "/entities/" + widget.getId())
                      .contentType(MediaType.APPLICATION_JSON))
              .andExpect(status().isOk())
              .andReturn()
              .getResponse()
              .getContentAsString();

      assertThatJson(response).node("[0].base_id").isEqualTo(ep.getId());
    }

    @Test
    @DisplayName("When sorting is specified, return entities sorted accordingly.")
    void WhenSortingIsSpecified_ReturnEntitiesSortedAccordingly() throws Exception {
      // some endpoints
      EndpointComposer.Composer epWrapper3 =
          endpointComposer.forEndpoint(EndpointFixture.createEndpoint());
      epWrapper3.get().setHostname("ep3");
      epWrapper3.persist();
      EndpointComposer.Composer epWrapper1 =
          endpointComposer.forEndpoint(EndpointFixture.createEndpoint());
      epWrapper1.get().setHostname("ep1");
      epWrapper1.persist();
      EndpointComposer.Composer epWrapper2 =
          endpointComposer.forEndpoint(EndpointFixture.createEndpoint());
      epWrapper2.get().setHostname("ep2");
      epWrapper2.persist();

      Widget listWidget = WidgetFixture.createListWidgetWithEntity("endpoint");
      EngineSortField sortField = new EngineSortField();
      sortField.setFieldName("endpoint_hostname");
      sortField.setDirection(SortDirection.ASC);
      ((ListConfiguration) listWidget.getWidgetConfiguration()).setSorts(List.of(sortField));
      Widget widget =
          widgetComposer
              .forWidget(listWidget)
              .withCustomDashboard(
                  customDashboardComposer.forCustomDashboard(
                      CustomDashboardFixture.createDefaultCustomDashboard()))
              .persist()
              .get();

      // force persistence
      entityManager.flush();
      entityManager.clear();
      engineService.bulkProcessing(engineContext.getModels().stream());
      // elastic needs to process the data; it does so async, so the method above
      // completes before the data is available in the system
      Thread.sleep(1000);

      String response =
          mvc.perform(
                  post(DASHBOARD_URI + "/entities/" + widget.getId())
                      .contentType(MediaType.APPLICATION_JSON))
              .andExpect(status().isOk())
              .andReturn()
              .getResponse()
              .getContentAsString();

      assertThatJson(response).node("[0].base_id").isEqualTo(epWrapper1.get().getId());
      assertThatJson(response).node("[1].base_id").isEqualTo(epWrapper2.get().getId());
      assertThatJson(response).node("[2].base_id").isEqualTo(epWrapper3.get().getId());
    }

    @Test
    @DisplayName("When binding with dashboard parameter, param is applied to returned collection.")
    void WhenBindingWithDashboardParam_ParamIsAppliedToReturnedCollection() throws Exception {
      // some endpoints
      EndpointComposer.Composer epWrapper3 =
          endpointComposer.forEndpoint(EndpointFixture.createEndpoint());
      epWrapper3.get().setHostname("ep3");
      EndpointComposer.Composer epWrapper1 =
          endpointComposer.forEndpoint(EndpointFixture.createEndpoint());
      epWrapper1.get().setHostname("ep1");
      EndpointComposer.Composer epWrapper2 =
          endpointComposer.forEndpoint(EndpointFixture.createEndpoint());
      epWrapper2.get().setHostname("ep2");

      // single simulation with two findings
      // each referencing the same two endpoints
      ExerciseComposer.Composer exerciseWrapper1 =
          exerciseComposer
              .forExercise(ExerciseFixture.createDefaultExercise())
              .withInject(
                  injectComposer
                      .forInject(InjectFixture.getDefaultInject())
                      .withFinding(
                          findingComposer
                              .forFinding(FindingFixture.createDefaultCveFindingWithRandomTitle())
                              .withEndpoint(epWrapper1)
                              .withEndpoint(epWrapper2))
                      .withFinding(
                          findingComposer
                              .forFinding(FindingFixture.createDefaultCveFindingWithRandomTitle())
                              .withEndpoint(epWrapper1)
                              .withEndpoint(epWrapper2)))
              .persist();

      // other simulation with single finding referencing another endpoint
      exerciseComposer
          .forExercise(ExerciseFixture.createDefaultExercise())
          .withInject(
              injectComposer
                  .forInject(InjectFixture.getDefaultInject())
                  .withFinding(
                      findingComposer
                          .forFinding(FindingFixture.createDefaultCveFindingWithRandomTitle())
                          .withEndpoint(epWrapper3)))
          .persist();

      CustomDashboardParameterComposer.Composer paramWrapper =
          customDashboardParameterComposer.forCustomDashboardParameter(
              CustomDashboardParameterFixture.createSimulationCustomDashboardParameter());
      CustomDashboardComposer.Composer dashboardWrapper =
          customDashboardComposer
              .forCustomDashboard(CustomDashboardFixture.createDefaultCustomDashboard())
              .withCustomDashboardParameter(paramWrapper)
              .persist();

      Widget listWidget = WidgetFixture.createListWidgetWithEntity("vulnerable-endpoint");
      ListConfiguration config = (ListConfiguration) listWidget.getWidgetConfiguration();
      // filters
      Filters.FilterGroup filterGroup = config.getSeries().get(0).getFilter();
      Filters.Filter simulationFilter = new Filters.Filter();
      simulationFilter.setKey("base_simulation_side");
      simulationFilter.setMode(Filters.FilterMode.or);
      simulationFilter.setOperator(Filters.FilterOperator.eq);
      simulationFilter.setValues(List.of(paramWrapper.get().getId()));
      List<Filters.Filter> filters = new ArrayList<>(filterGroup.getFilters());
      filters.add(simulationFilter);
      filterGroup.setFilters(filters);

      // sorts
      EngineSortField sortField = new EngineSortField();
      sortField.setFieldName("vulnerable_endpoint_hostname");
      sortField.setDirection(SortDirection.DESC);
      config.setSorts(List.of(sortField));
      Widget widget =
          widgetComposer
              .forWidget(listWidget)
              .withCustomDashboard(dashboardWrapper)
              .persist()
              .get();

      // force persistence
      entityManager.flush();
      entityManager.clear();
      engineService.bulkProcessing(engineContext.getModels().stream());
      // elastic needs to process the data; it does so async, so the method above
      // completes before the data is available in the system
      Thread.sleep(1000);

      String response =
          mvc.perform(
                  post(DASHBOARD_URI + "/entities/" + widget.getId())
                      .contentType(MediaType.APPLICATION_JSON)
                      .content(
                          "{\"%s\":\"%s\"}"
                              .formatted(
                                  paramWrapper.get().getId(), exerciseWrapper1.get().getId())))
              .andExpect(status().isOk())
              .andReturn()
              .getResponse()
              .getContentAsString();

      assertThatJson(response)
          .node("[0].vulnerable_endpoint_id")
          .isEqualTo(epWrapper2.get().getId());
      assertThatJson(response)
          .node("[1].vulnerable_endpoint_id")
          .isEqualTo(epWrapper1.get().getId());
      assertThatJson(response).isArray().size().isEqualTo(2);
    }
  }
}
