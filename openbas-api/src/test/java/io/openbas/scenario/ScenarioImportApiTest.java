package io.openbas.scenario;

import io.openbas.database.model.ImportMapper;
import io.openbas.database.repository.ImportMapperRepository;
import io.openbas.rest.mapper.form.ImportMapperAddInput;
import io.openbas.rest.scenario.ScenarioImportApi;
import io.openbas.rest.scenario.form.InjectsImportInput;
import io.openbas.rest.scenario.form.InjectsImportTestInput;
import io.openbas.rest.scenario.response.ImportTestSummary;
import io.openbas.service.InjectService;
import io.openbas.service.MapperService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.util.ResourceUtils;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.util.Optional;
import java.util.UUID;

import static io.openbas.utils.JsonUtils.asJsonString;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ExtendWith(MockitoExtension.class)
public class ScenarioImportApiTest {

  private MockMvc mvc;

  @Mock
  private InjectService injectService;

  @Mock
  private ImportMapperRepository importMapperRepository;

  @Mock
  private MapperService mapperService;

  private ScenarioImportApi scenarioImportApi;

  private String SCENARIO_ID;

  @BeforeEach
  public void setUp() {
    // Injecting mocks into the controller
    scenarioImportApi = new ScenarioImportApi(injectService, importMapperRepository, mapperService);

    SCENARIO_ID = UUID.randomUUID().toString();

    mvc = MockMvcBuilders.standaloneSetup(scenarioImportApi)
            .build();
  }

  @DisplayName("Test store xls")
  @Test
  void testStoreXls() throws Exception {
    // -- PREPARE --
    // Getting a test file
    File testFile = ResourceUtils.getFile("classpath:xls-test-files/test_file_1.xlsx");

    InputStream in = new FileInputStream(testFile);
    MockMultipartFile xlsFile = new MockMultipartFile("file",
            "my-awesome-file.xls",
            "application/xlsx",
            in.readAllBytes());

    // -- EXECUTE --
    String response = this.mvc
            .perform(MockMvcRequestBuilders.multipart("/api/scenarios/{scenarioId}/xls", SCENARIO_ID)
                    .file(xlsFile))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();

    // -- ASSERT --
    assertNotNull(response);
  }

  @DisplayName("Test dry run import xls")
  @Test
  void testDryRunXls() throws Exception {
    // -- PREPARE --
    InjectsImportInput injectsImportInput = new InjectsImportInput();
    injectsImportInput.setImportMapperId(UUID.randomUUID().toString());
    injectsImportInput.setName("TEST");
    injectsImportInput.setTimezoneOffset(120);

    when(importMapperRepository.findById(any())).thenReturn(Optional.of(new ImportMapper()));
    when(injectService.importInjectIntoScenarioFromXLS(any(), any(), any(), any(), anyInt(), anyBoolean())).thenReturn(new ImportTestSummary());

    // -- EXECUTE --
    String response = this.mvc
            .perform(MockMvcRequestBuilders.post("/api/scenarios/{scenarioId}/xls/{importId}/dry", SCENARIO_ID, UUID.randomUUID().toString())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(asJsonString(injectsImportInput)))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();

    // -- ASSERT --
    assertNotNull(response);
  }

  @DisplayName("Test testing an import xls")
  @Test
  void testTestingXls() throws Exception {
    // -- PREPARE --
    InjectsImportTestInput injectsImportInput = new InjectsImportTestInput();
    injectsImportInput.setImportMapper(new ImportMapperAddInput());
    injectsImportInput.setName("TEST");
    injectsImportInput.setTimezoneOffset(120);

    injectsImportInput.getImportMapper().setName("TEST");

    when(injectService.importInjectIntoScenarioFromXLS(any(), any(), any(), any(), anyInt(), anyBoolean())).thenReturn(new ImportTestSummary());

    // -- EXECUTE --
    String response = this.mvc
            .perform(MockMvcRequestBuilders.post("/api/scenarios/{scenarioId}/xls/{importId}/test", SCENARIO_ID, UUID.randomUUID().toString())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(asJsonString(injectsImportInput)))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();

    // -- ASSERT --
    assertNotNull(response);
  }

  @DisplayName("Test import xls")
  @Test
  void testImportXls() throws Exception {
    // -- PREPARE --
    InjectsImportInput injectsImportInput = new InjectsImportInput();
    injectsImportInput.setImportMapperId(UUID.randomUUID().toString());
    injectsImportInput.setName("TEST");
    injectsImportInput.setTimezoneOffset(120);

    when(importMapperRepository.findById(any())).thenReturn(Optional.of(new ImportMapper()));
    when(injectService.importInjectIntoScenarioFromXLS(any(), any(), any(), any(), anyInt(), anyBoolean())).thenReturn(new ImportTestSummary());

    // -- EXECUTE --
    String response = this.mvc
            .perform(MockMvcRequestBuilders.post("/api/scenarios/{scenarioId}/xls/{importId}/import", SCENARIO_ID, UUID.randomUUID().toString())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(asJsonString(injectsImportInput)))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();

    // -- ASSERT --
    assertNotNull(response);
  }

}
