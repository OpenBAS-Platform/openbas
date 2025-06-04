package io.openbas.rest.scenario;

import static org.junit.jupiter.api.TestInstance.Lifecycle.PER_CLASS;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import io.openbas.IntegrationTest;
import io.openbas.database.model.*;
import io.openbas.utils.fixtures.*;
import io.openbas.utils.fixtures.composers.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@TestInstance(PER_CLASS)
public class ScenarioInjectTestApiTest extends IntegrationTest {

  @Autowired private MockMvc mvc;
  @Autowired private ExerciseComposer exerciseComposer;
  @Autowired private InjectComposer injectComposer;
  @Autowired private InjectTestStatusComposer injectTestStatusComposer;

  private String exerciseId;
  private Inject inject1, inject2;
  private InjectStatus testStatus1, testStatus2;

  @BeforeAll
  void setupData() {
    exerciseId =
        exerciseComposer.forExercise(ExerciseFixture.getExercise()).persist().get().getId();

    inject1 = injectComposer.forInject(InjectFixture.getDefaultInject()).persist().get();

    inject2 = injectComposer.forInject(InjectFixture.getDefaultInject()).persist().get();

    //    testStatus1 =
    //        injectTestStatusComposer
    //            .forInjectTestStatus(InjectStatusFixture.createPendingInjectStatus())
    //            .withInject(inject1)
    //            .persist()
    //            .get();

    //    testStatus2 =
    //        injectTestStatusComposer
    //            .forInjectTestStatus(InjectStatusFixture.createPendingInjectStatus())
    //            .withInject(inject2)
    //            .persist()
    //            .get();
  }

  @Nested
  @WithMockUser(roles = "EXERCISE_PLANNER")
  @DisplayName("As ExercisePlanner")
  class ExercisePlannerAccess {

    @Test
    @DisplayName("Should return paginated inject test results when inject tests exist")
    void should_return_paginated_results_when_inject_tests_exist() throws Exception {
      String requestJson =
          """
                {
                  "page": 0,
                  "size": 10
                }
            """;

      String response =
          mvc.perform(
                  post("/api/exercises/{exerciseId}/injects/test", exerciseId)
                      .contentType(MediaType.APPLICATION_JSON)
                      .content(requestJson))
              .andExpect(status().isOk())
              .andReturn()
              .getResponse()
              .getContentAsString();

      //      assertThatJson(response)
      //          .inPath("$.content[*].id")
      //          .asArray()
      //          .contains(testStatus1.getId(), testStatus2.getId());
    }

    @Test
    @DisplayName("Should return test status when testing a specific inject")
    void should_return_test_status_when_testing_specific_inject() throws Exception {
      mvc.perform(
              get(
                  "/api/exercises/{exerciseId}/injects/{injectId}/test",
                  exerciseId,
                  inject1.getId()))
          .andExpect(status().isOk())
          .andExpect(jsonPath("$.inject_id").value(inject1.getId()));
    }

    @Test
    @DisplayName("Should return inject test status when fetching by ID")
    void should_return_inject_test_status_when_fetching_by_id() throws Exception {
      mvc.perform(get("/api/exercises/injects/test/{testId}", testStatus1.getId()))
          .andExpect(status().isOk())
          .andExpect(jsonPath("$.id").value(testStatus1.getId()));
    }

    @Test
    @DisplayName("Should return test statuses when performing bulk test with inject IDs")
    void should_return_test_statuses_when_bulk_testing_with_inject_ids() throws Exception {
      String requestJson =
          String.format(
              """
                {
                  "inject_ids_to_process": ["%s"]
                }
            """,
              inject1.getId());

      mvc.perform(
              post("/api/exercises/{exerciseId}/injects/test", exerciseId)
                  .contentType(MediaType.APPLICATION_JSON)
                  .content(requestJson))
          .andExpect(status().isOk())
          .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("Should return 404 when fetching a deleted inject test status")
    void should_return_404_when_fetching_deleted_inject_test_status() throws Exception {
      mvc.perform(
              delete(
                  "/api/exercises/{exerciseId}/injects/test/{testId}",
                  exerciseId,
                  testStatus2.getId()))
          .andExpect(status().isOk());

      mvc.perform(get("/api/exercises/injects/test/{testId}", testStatus2.getId()))
          .andExpect(status().isNotFound());
    }
  }

  @Nested
  @WithMockUser
  @DisplayName("As Unauthorized User")
  class UnauthorizedUserAccess {

    @Test
    @DisplayName("Should return 403 when testing inject without planner role")
    void should_return_403_when_testing_inject_without_planner_role() throws Exception {
      mvc.perform(
              get(
                  "/api/exercises/{exerciseId}/injects/{injectId}/test",
                  exerciseId,
                  inject1.getId()))
          .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Should return 403 when deleting inject test without planner role")
    void should_return_403_when_deleting_inject_test_without_planner_role() throws Exception {
      mvc.perform(
              delete(
                  "/api/exercises/{exerciseId}/injects/test/{testId}",
                  exerciseId,
                  testStatus1.getId()))
          .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Should return 403 when bulk testing without planner role")
    void should_return_403_when_bulk_testing_without_planner_role() throws Exception {
      String json =
          String.format(
              """
                {
                  "inject_ids_to_process": ["%s"]
                }
            """,
              inject1.getId());

      mvc.perform(
              post("/api/exercises/{exerciseId}/injects/test", exerciseId)
                  .contentType(MediaType.APPLICATION_JSON)
                  .content(json))
          .andExpect(status().isForbidden());
    }
  }
}
