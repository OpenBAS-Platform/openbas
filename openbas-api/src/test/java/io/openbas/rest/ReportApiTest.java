package io.openbas.rest;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jayway.jsonpath.JsonPath;
import io.openbas.database.model.*;
import io.openbas.rest.exercise.ExerciseService;
import io.openbas.rest.mapper.MapperApi;
import io.openbas.rest.report.ReportApi;
import io.openbas.rest.report.form.ReportInput;
import io.openbas.service.ReportService;
import io.openbas.utils.fixtures.PaginationFixture;
import io.openbas.utils.mockUser.WithMockPlannerUser;
import org.junit.jupiter.api.*;
import org.mockito.Mock;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.lang.reflect.Field;
import java.util.List;
import java.util.UUID;

import static io.openbas.utils.JsonUtils.asJsonString;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.TestInstance.Lifecycle.PER_CLASS;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@TestInstance(PER_CLASS)
public class ReportApiTest {

    private MockMvc mvc;

    @Mock
    private ReportService reportService;
    @Mock
    private ExerciseService exerciseService;

    @Autowired
    private ObjectMapper objectMapper;

    private Exercise exercise;
    private Report report;
    private ReportInput reportInput;

    @BeforeEach
    void before() throws IllegalAccessException, NoSuchFieldException {
        ReportApi reportApi = new ReportApi(exerciseService, reportService);
        Field sessionContextField = MapperApi.class.getSuperclass().getDeclaredField("mapper");
        sessionContextField.setAccessible(true);
        sessionContextField.set(reportApi, objectMapper);
        mvc = MockMvcBuilders.standaloneSetup(reportApi)
                .build();

        exercise = new Exercise();
        exercise.setName("Exercise name");
        exercise.setId("exercise123");
        report = new Report();
        report.setId(UUID.randomUUID().toString());
        reportInput = new ReportInput();
        reportInput.setName("Report name");
    }

    @Nested
    @WithMockPlannerUser
    @DisplayName("Reports for exercise")
    class ReportsForExercise {
        @DisplayName("Create report")
        @Test
        void createReportForExercise() throws Exception {
            // -- PREPARE --
            when(exerciseService.exercise(anyString())).thenReturn(exercise);
            when(reportService.updateReport(any(Report.class), any(ReportInput.class)))
                    .thenReturn(report);

            // -- EXECUTE --
            String response = mvc
                    .perform(MockMvcRequestBuilders.post("/api/exercises/"+exercise.getId()+"/reports")
                            .content(asJsonString(reportInput))
                            .contentType(MediaType.APPLICATION_JSON)
                            .accept(MediaType.APPLICATION_JSON))
                    .andExpect(status().is2xxSuccessful())
                    .andReturn()
                    .getResponse()
                    .getContentAsString();

            // -- ASSERT --
            verify(exerciseService).exercise(exercise.getId());
            assertNotNull(response);
            assertEquals(JsonPath.read(response, "$.report_id"), report.getId());
        }

        @DisplayName("Retrieve reports")
        @Test
        void retrieveReportForExercise() throws Exception {
            // PREPARE
            List<Report> reports =  List.of(report);
            when(reportService.reportsFromExercise(anyString())).thenReturn(reports);

            // -- EXECUTE --
            String response = mvc
                    .perform(MockMvcRequestBuilders.get( "/api/exercises/fakeExercisesId123/reports")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().is2xxSuccessful())
                    .andReturn()
                    .getResponse()
                    .getContentAsString();

            // -- ASSERT --
            verify(reportService).reportsFromExercise("fakeExercisesId123");
            assertNotNull(response);
            assertEquals(JsonPath.read(response, "$[0].report_id"), report.getId());
        }

        @DisplayName("Update Report")
        @Test
        void updateReportForExercise() throws Exception {
            // -- PREPARE --
            report.setExercise(exercise);
            when(reportService.report(any())).thenReturn(report);
            when(reportService.updateReport(any(Report.class), any(ReportInput.class)))
                    .thenReturn(report);

            // -- EXECUTE --
            String response = mvc
                    .perform(MockMvcRequestBuilders.put("/api/exercises/"+ exercise.getId() +"/reports/"+ report.getId())
                            .content(asJsonString(reportInput))
                            .contentType(MediaType.APPLICATION_JSON)
                            .accept(MediaType.APPLICATION_JSON))
                    .andExpect(status().is2xxSuccessful())
                    .andReturn()
                    .getResponse()
                    .getContentAsString();

            // -- ASSERT --
            report.setName("fake");
            verify(reportService).report(UUID.fromString(report.getId()));
            verify(reportService).updateReport(report, reportInput);
            assertNotNull(response);
            assertEquals(JsonPath.read(response, "$.report_id"), report.getId());
        }

        @DisplayName("Delete Report")
        @Test
        void deleteReportForExercise() throws Exception {
            // -- PREPARE --
            report.setExercise(exercise);
            when(reportService.report(any())).thenReturn(report);

            // -- EXECUTE --
            mvc.perform(MockMvcRequestBuilders.delete("/api/exercises/" + exercise.getId() +"/reports/"+ report.getId())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(asJsonString(PaginationFixture.getDefault().textSearch("").build())))
                    .andExpect(status().is2xxSuccessful());

            // -- ASSERT --
            verify(reportService, times(1)).deleteReport(UUID.fromString(report.getId()));
        }
    }
}
