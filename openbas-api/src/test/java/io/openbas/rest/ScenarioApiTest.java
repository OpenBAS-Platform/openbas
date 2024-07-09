package io.openbas.rest;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jayway.jsonpath.JsonPath;
import io.openbas.database.model.ImportMapper;
import io.openbas.database.model.Inject;
import io.openbas.database.model.Scenario;
import io.openbas.database.repository.ImportMapperRepository;
import io.openbas.database.repository.InjectRepository;
import io.openbas.database.repository.ScenarioRepository;
import io.openbas.rest.exception.BadRequestException;
import io.openbas.rest.scenario.ScenarioImportApi;
import io.openbas.rest.scenario.form.InjectsImportInput;
import io.openbas.rest.scenario.response.ImportMessage;
import io.openbas.rest.scenario.response.ImportPostSummary;
import io.openbas.rest.scenario.response.ImportTestSummary;
import io.openbas.service.InjectService;
import io.openbas.utils.CustomMockMultipartFile;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.util.ResourceUtils;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static io.openbas.rest.scenario.ScenarioApi.SCENARIO_URI;
import static io.openbas.utils.JsonUtils.asJsonString;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ExtendWith(MockitoExtension.class)
public class ScenarioApiTest {

  private MockMvc mvc;
  @Mock
  private ScenarioRepository scenarioRepository;
  @Mock
  private ImportMapperRepository importMapperRepository;
  @Mock
  private InjectRepository injectRepository;
  private InjectService injectService;
  @Mock
  private ScenarioImportApi scenarioImportApi;
  @Autowired
  private ObjectMapper objectMapper;

  File testFile;

  static String SCENARIO_ID;

  static Scenario mockedScenario;

  static ImportMapper mockedImportMapper;

  @BeforeEach
  void before() throws FileNotFoundException {
    // Getting a test file
    testFile = ResourceUtils.getFile("classpath:xls-test-files/test_file_1.xlsx");

    // Creating a mocked scenario
    SCENARIO_ID = UUID.randomUUID().toString();
    mockedScenario = new Scenario();
    mockedScenario.setId(SCENARIO_ID);

    // Creating a mocked Import Mapper
    UUID importMapperId = UUID.randomUUID();
    mockedImportMapper = createImportMapper(importMapperId.toString());
    injectService = Mockito.mock(InjectService.class);
    // Injecting mocks into the controller
    scenarioImportApi = new ScenarioImportApi(scenarioRepository, injectRepository, importMapperRepository, injectService);

    mvc = MockMvcBuilders.standaloneSetup(scenarioImportApi)
            .build();
  }

  // -- SCENARIOS --

  @DisplayName("Post an XLS file")
  @Test
  void postAnXLSFile() throws Exception {
    // -- PREPARE --
    InputStream in = new FileInputStream(testFile);
    MockMultipartFile xlsFile = new MockMultipartFile("file",
            "my-awesome-file.xls",
            "application/xlsx",
            in.readAllBytes());
    // -- EXECUTE --
    String response = this.mvc
        .perform(MockMvcRequestBuilders.multipart(SCENARIO_URI + "/" + SCENARIO_ID + "/xls")
                .file(xlsFile))
        .andExpect(status().is2xxSuccessful())
        .andReturn()
        .getResponse()
        .getContentAsString();

    // -- ASSERT --
    assertNotNull(response);

    ImportPostSummary returnValue = objectMapper.readValue(response, ImportPostSummary.class);
    try {
      UUID.fromString(returnValue.getImportId());
    } catch (Exception ex) {
      fail();
    }
    assertEquals(1, returnValue.getAvailableSheets().size());
    assertEquals("CHECKLIST", returnValue.getAvailableSheets().get(0));
  }

  @DisplayName("Post a corrupted XLS file")
  @Test
  void postACorruptedXLSFile() throws Exception {
    // -- PREPARE --
    InputStream in = new FileInputStream(testFile);
    MockMultipartFile xlsFile = new CustomMockMultipartFile("file",
            "my-awesome-file.xls",
            "application/xlsx",
            in.readAllBytes());

    // -- EXECUTE --
    this.mvc
      .perform(MockMvcRequestBuilders.multipart(SCENARIO_URI + "/" + SCENARIO_ID + "/xls")
              .file(xlsFile))
      .andExpect(status().is4xxClientError())
      .andExpect(result -> {assertTrue(result.getResolvedException() instanceof BadRequestException);});
  }

  @DisplayName("Post and test XLS file")
  @Test
  void postAndTestXLSFile() throws Exception {
    // -- PREPARE --
    ImportPostSummary importPostSummary = postFileAndGetInfoBack(testFile);

    when(scenarioRepository.findById(SCENARIO_ID)).thenReturn(Optional.ofNullable(mockedScenario));
    when(importMapperRepository.findById(UUID.fromString(mockedImportMapper.getId())))
            .thenReturn(Optional.ofNullable(mockedImportMapper));
    ImportTestSummary importTestSummary = new ImportTestSummary();
    importTestSummary.setInjects(new ArrayList<>());
    Inject mockedInject = new Inject();
    mockedInject.setId(UUID.randomUUID().toString());
    importTestSummary.getInjects().add(mockedInject);
    when(injectService.importXls(anyString(), any(), any(), any())).thenReturn(importTestSummary);

    InjectsImportInput input = new InjectsImportInput();
    input.setName(importPostSummary.getAvailableSheets().get(0));
    input.setImportMapperId(mockedImportMapper.getId());
    input.setTimezoneOffset(120);
    // -- EXECUTE --
    String response = this.mvc
            .perform(post(SCENARIO_URI + "/" + SCENARIO_ID + "/xls/" + importPostSummary.getImportId() + "/test")
                    .content(asJsonString(input))
                    .contentType("application/json"))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();

    // -- ASSERT --
    assertNotNull(response);
    assertEquals(mockedInject.getId(), JsonPath.read(response, "$.injects[0].inject_id"));
  }

  @DisplayName("Post and test XLS file with Critical")
  @Test
  void postAndTestXLSFileWithCritical() throws Exception {
    ImportPostSummary importPostSummary = postFileAndGetInfoBack(testFile);

    when(scenarioRepository.findById(SCENARIO_ID)).thenReturn(Optional.ofNullable(mockedScenario));
    when(importMapperRepository.findById(UUID.fromString(mockedImportMapper.getId())))
            .thenReturn(Optional.ofNullable(mockedImportMapper));
    ImportTestSummary importTestSummary = new ImportTestSummary();
    importTestSummary.setImportMessage(List.of(new ImportMessage(ImportMessage.MessageLevel.CRITICAL, ImportMessage.ErrorCode.ABSOLUTE_TIME_WITHOUT_START_DATE)));
    when(injectService.importXls(anyString(), any(), any(), any())).thenReturn(importTestSummary);

    InjectsImportInput input = new InjectsImportInput();
    input.setName(importPostSummary.getAvailableSheets().get(0));
    input.setImportMapperId(mockedImportMapper.getId());
    input.setTimezoneOffset(120);
    // -- EXECUTE --
    String response = this.mvc
            .perform(post(SCENARIO_URI + "/" + SCENARIO_ID + "/xls/" + importPostSummary.getImportId() + "/test")
                    .content(asJsonString(input))
                    .contentType("application/json"))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();

    ImportTestSummary returnValue = objectMapper.readValue(response, ImportTestSummary.class);

    assertTrue(returnValue.getImportMessage().stream()
            .allMatch(importMessage -> importMessage.getMessageLevel().equals(ImportMessage.MessageLevel.CRITICAL)));

    // -- ASSERT --
    assertNotNull(response);
  }

  @DisplayName("Post and validate an XLS file import")
  @Test
  void postAndValidateXLSFile() throws Exception {

    ImportPostSummary importPostSummary = postFileAndGetInfoBack(testFile);

    when(scenarioRepository.findById(SCENARIO_ID)).thenReturn(Optional.ofNullable(mockedScenario));
    when(scenarioRepository.save(any())).thenReturn(mockedScenario);
    when(importMapperRepository.findById(UUID.fromString(mockedImportMapper.getId())))
            .thenReturn(Optional.ofNullable(mockedImportMapper));
    ImportTestSummary importTestSummary = new ImportTestSummary();
    importTestSummary.setInjects(new ArrayList<>());
    Inject mockedInject = new Inject();
    mockedInject.setId(UUID.randomUUID().toString());
    importTestSummary.getInjects().add(mockedInject);
    when(injectService.importXls(anyString(), any(), any(), any())).thenReturn(importTestSummary);
    when(injectRepository.saveAll(any())).thenReturn(List.of(new Inject()));

    InjectsImportInput input = new InjectsImportInput();
    input.setName(importPostSummary.getAvailableSheets().get(0));
    input.setImportMapperId(mockedImportMapper.getId());
    input.setTimezoneOffset(120);

    // -- EXECUTE --
    String response = this.mvc
            .perform(post(SCENARIO_URI + "/" + SCENARIO_ID + "/xls/" + importPostSummary.getImportId() + "/import")
                    .content(asJsonString(input))
                    .contentType("application/json"))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();

    // -- ASSERT --
    assertNotNull(response);
    assertEquals(mockedInject.getId(), JsonPath.read(response, "$.injects[0].inject_id"));
  }

  @DisplayName("Post and validate an XLS file import with Critical Messages")
  @Test
  void postAndValidateXLSFileAndWithCritical() throws Exception {

    ImportPostSummary importPostSummary = postFileAndGetInfoBack(testFile);

    when(scenarioRepository.findById(SCENARIO_ID)).thenReturn(Optional.ofNullable(mockedScenario));
    when(importMapperRepository.findById(UUID.fromString(mockedImportMapper.getId())))
            .thenReturn(Optional.ofNullable(mockedImportMapper));
    ImportTestSummary importTestSummary = new ImportTestSummary();
    importTestSummary.setImportMessage(List.of(new ImportMessage(ImportMessage.MessageLevel.CRITICAL, ImportMessage.ErrorCode.ABSOLUTE_TIME_WITHOUT_START_DATE)));
    when(injectService.importXls(anyString(), any(), any(), any())).thenReturn(importTestSummary);

    InjectsImportInput input = new InjectsImportInput();
    input.setName(importPostSummary.getAvailableSheets().get(0));
    input.setImportMapperId(mockedImportMapper.getId());
    input.setTimezoneOffset(120);

    // -- EXECUTE --
    String response = this.mvc
            .perform(post(SCENARIO_URI + "/" + SCENARIO_ID + "/xls/" + importPostSummary.getImportId() + "/import")
                    .content(asJsonString(input))
                    .contentType("application/json"))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();

    ImportTestSummary returnValue = objectMapper.readValue(response, ImportTestSummary.class);

    assertTrue(returnValue.getImportMessage().stream()
            .allMatch(importMessage -> importMessage.getMessageLevel().equals(ImportMessage.MessageLevel.CRITICAL)));

    // -- ASSERT --
    assertNotNull(response);
  }

  private ImportPostSummary postFileAndGetInfoBack(File testFile) throws Exception {
    InputStream in = new FileInputStream(testFile);
    MockMultipartFile xlsFile = new MockMultipartFile("file",
            "my-awesome-file.xls",
            "application/xlsx",
            in.readAllBytes());
    // -- EXECUTE --
    String response = this.mvc
            .perform(MockMvcRequestBuilders.multipart(SCENARIO_URI + "/" + SCENARIO_ID + "/xls")
                    .file(xlsFile))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();

    // -- ASSERT --
    assertNotNull(response);

    return objectMapper.readValue(response, ImportPostSummary.class);
  }

  private ImportMapper createImportMapper(String id) {
    ImportMapper importMapper = new ImportMapper();
    importMapper.setName("test import mapper");
    importMapper.setId(id);
    return importMapper;
  }

}
