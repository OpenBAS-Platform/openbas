package io.openbas.rest.dashboard;

import static io.openbas.rest.dashboard.DashboardApi.DASHBOARD_URI;
import static net.javacrumbs.jsonunit.assertj.JsonAssertions.assertThatJson;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import io.openbas.IntegrationTest;
import io.openbas.database.model.Endpoint;
import io.openbas.database.model.Widget;
import io.openbas.driver.ElasticDriver;
import io.openbas.engine.EsEngine;
import io.openbas.engine.EsModel;
import io.openbas.engine.api.EngineSortField;
import io.openbas.engine.api.ListConfiguration;
import io.openbas.engine.api.SortDirection;
import io.openbas.rest.custom_dashboard.CustomDashboardComposer;
import io.openbas.rest.custom_dashboard.CustomDashboardFixture;
import io.openbas.service.EsService;
import io.openbas.utils.fixtures.EndpointFixture;
import io.openbas.utils.fixtures.WidgetFixture;
import io.openbas.utils.fixtures.composers.EndpointComposer;
import io.openbas.utils.fixtures.composers.WidgetComposer;
import io.openbas.utils.mockUser.WithMockAdminUser;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import java.io.IOException;
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

  @Autowired private EsService esService;
  @Autowired private EsEngine esEngine;
  @Autowired private EndpointComposer endpointComposer;
  @Autowired private WidgetComposer widgetComposer;
  @Autowired private CustomDashboardComposer customDashboardComposer;
  @Autowired private MockMvc mvc;
  @Autowired private EntityManager entityManager;
  @Autowired private ElasticsearchClient esClient;
  @Autowired private ElasticDriver esDriver;

  @BeforeEach
  void setup() throws IOException {
    endpointComposer.reset();
    widgetComposer.reset();

    // force reset elastic
    for (EsModel<?> model : esEngine.getModels()) {
      esDriver.cleanUpIndex(model.getName(), esClient);
    }
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
      esService.bulkProcessing(esEngine.getModels().stream());
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
      esService.bulkProcessing(esEngine.getModels().stream());
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
  }
}
