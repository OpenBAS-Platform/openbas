package io.openbas.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.openbas.config.OpenBASOAuth2User;
import io.openbas.config.SessionHelper;
import io.openbas.database.model.*;
import io.openbas.database.repository.*;
import io.openbas.rest.exception.BadRequestException;
import io.openbas.rest.scenario.form.InjectsImportInput;
import io.openbas.rest.scenario.response.ImportMessage;
import io.openbas.rest.scenario.response.ImportPostSummary;
import io.openbas.rest.scenario.response.ImportTestSummary;
import io.openbas.utils.CustomMockMultipartFile;
import jakarta.annotation.Resource;
import org.apache.commons.io.FilenameUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.util.ResourceUtils;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.time.Month;
import java.time.ZoneOffset;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InjectServiceTest {

    @Mock
    InjectRepository injectRepository;
    @Mock
    InjectDocumentRepository injectDocumentRepository;
    @Mock
    InjectExpectationRepository injectExpectationRepository;
    @Mock
    AssetRepository assetRepository;
    @Mock
    AssetGroupRepository assetGroupRepository;
    @Mock
    TeamRepository teamRepository;
    @Mock
    ScenarioTeamUserRepository scenarioTeamUserRepository;
    @Mock
    ExerciseTeamUserRepository exerciseTeamUserRepository;
    @Mock
    UserRepository userRepository;
    @Mock
    ImportMapperRepository importMapperRepository;
    @InjectMocks
    private InjectService injectService;

    private Scenario mockedScenario;

    private ImportMapper mockedImportMapper;

    private InjectsImportInput mockedInjectsImportInput;
    @Resource
    protected ObjectMapper mapper;

    @BeforeEach
    void setUp() {
        injectService = new InjectService(injectRepository, injectDocumentRepository, injectExpectationRepository,
                assetRepository, assetGroupRepository, scenarioTeamUserRepository, exerciseTeamUserRepository, teamRepository, userRepository);

        mockedScenario = new Scenario();
        mapper = new ObjectMapper();
    }

    @DisplayName("Post and store an XLS file")
    @Test
    void postAnXLSFile() throws Exception {
        // -- PREPARE --
        // Getting a test file
        File testFile = ResourceUtils.getFile("classpath:xls-test-files/test_file_1.xlsx");

        InputStream in = new FileInputStream(testFile);
        MockMultipartFile xlsFile = new MockMultipartFile("file",
                "my-awesome-file.xls",
                "application/xlsx",
                in.readAllBytes());

        ImportPostSummary response = injectService.storeXlsFileForImport(xlsFile);

        // -- ASSERT --
        assertNotNull(response);
        try {
            UUID.fromString(response.getImportId());
        } catch (Exception ex) {
            fail();
        }
        assertEquals(1, response.getAvailableSheets().size());
        assertEquals("CHECKLIST", response.getAvailableSheets().get(0));
    }

    @DisplayName("Post and store a corrupted XLS file")
    @Test
    void postACorruptedXLSFile() throws Exception {
        // Getting a test file
        File testFile = ResourceUtils.getFile("classpath:xls-test-files/test_file_1.xlsx");
        // -- PREPARE --
        InputStream in = new FileInputStream(testFile);
        MockMultipartFile xlsFile = new CustomMockMultipartFile("file",
                "my-awesome-file.xls",
                "application/xlsx",
                in.readAllBytes());

        // -- EXECUTE --
        try {
            injectService.storeXlsFileForImport(xlsFile);
            fail();
        } catch(Exception ex) {
            assertTrue(ex instanceof BadRequestException);
        }
    }

    @DisplayName("Import an XLS file with relative date")
    @Test
    void testImportXlsRelativeDate() throws IOException {
        try (MockedStatic<SessionHelper> sessionHelper = Mockito.mockStatic(SessionHelper.class)) {
            User mockedUser = new User();
            String fileID = UUID.randomUUID().toString();
            File testFile = ResourceUtils.getFile("classpath:xls-test-files/test_file_1.xlsx");
            createTempFile(testFile, fileID);

            mockedImportMapper = createImportMapper(UUID.randomUUID().toString());
            when(userRepository.findById(any())).thenReturn(Optional.of(mockedUser));
            Team team1 = new Team();
            team1.setName("team1");
            Team team2 = new Team();
            team2.setName("team2");
            when(teamRepository.findAll()).thenReturn(List.of(team1));
            when(teamRepository.save(any())).thenReturn(team2);

            mockedScenario.setId(UUID.randomUUID().toString());

            sessionHelper.when(SessionHelper::currentUser).thenReturn(new OpenBASOAuth2User(mockedUser));
            ImportTestSummary importTestSummary = injectService.importInjectIntoScenarioFromXLS(mockedScenario,
                    mockedImportMapper, fileID, "CHECKLIST", 120, false);

            verify(teamRepository, times(1)).save(any());
            assertEquals(30 * 24 * 60 * 60, importTestSummary.getInjects().getLast().getDependsDuration());

            ObjectNode jsonNodeMail = (ObjectNode) mapper.readTree("{\"message\":\"message1\",\"expectations\":[{\"expectation_description\":\"expectation\",\"expectation_name\":\"expectation done\",\"expectation_score\":100.0,\"expectation_type\":\"MANUAL\",\"expectation_expectation_group\":false}]}");
            assertEquals(jsonNodeMail, importTestSummary.getInjects().getFirst().getContent());

            ObjectNode jsonNodeSms = (ObjectNode) mapper.readTree("{\"subject\":\"subject\",\"body\":\"message2\",\"expectations\":[{\"expectation_description\":\"expectation\",\"expectation_name\":\"expectation done\",\"expectation_score\":100.0,\"expectation_type\":\"MANUAL\",\"expectation_expectation_group\":false}]}");
            assertEquals(jsonNodeSms, importTestSummary.getInjects().getLast().getContent());
        }
    }

    @DisplayName("Import a non existing XLS file")
    @Test
    void testImportXlsBadFile() throws IOException {
        try (MockedStatic<SessionHelper> sessionHelper = Mockito.mockStatic(SessionHelper.class)) {
            String fileID = UUID.randomUUID().toString();

            mockedImportMapper = createImportMapper(UUID.randomUUID().toString());
            try {
                injectService.importInjectIntoScenarioFromXLS(mockedScenario,
                        mockedImportMapper, fileID, "CHECKLIST", 120, true);
                fail();
            } catch (Exception ex) {
                assertTrue(ex instanceof BadRequestException);
            }
        }
    }

    @DisplayName("Import an XLS file and have several matches of importer")
    @Test
    void testImportXlsSeveralMatches() throws IOException {
        try (MockedStatic<SessionHelper> sessionHelper = Mockito.mockStatic(SessionHelper.class)) {
            User mockedUser = new User();
            String fileID = UUID.randomUUID().toString();
            File testFile = ResourceUtils.getFile("classpath:xls-test-files/test_file_1.xlsx");
            createTempFile(testFile, fileID);

            mockedImportMapper = createImportMapper(UUID.randomUUID().toString());
            when(userRepository.findById(any())).thenReturn(Optional.of(mockedUser));
            Team team1 = new Team();
            team1.setName("team1");
            Team team2 = new Team();
            team2.setName("team2");
            when(teamRepository.findAll()).thenReturn(List.of(team1));
            lenient().when(teamRepository.save(any())).thenReturn(team2);

            sessionHelper.when(SessionHelper::currentUser).thenReturn(new OpenBASOAuth2User(mockedUser));

            InjectImporter injectImporterMailCopy = new InjectImporter();
            injectImporterMailCopy.setId(UUID.randomUUID().toString());
            injectImporterMailCopy.setImportTypeValue(".*mail");
            injectImporterMailCopy.setRuleAttributes(new ArrayList<>());
            injectImporterMailCopy.setInjectorContract(createMailInjectorContract());

            injectImporterMailCopy.getRuleAttributes().addAll(createRuleAttributeMail());
            mockedImportMapper.getInjectImporters().add(injectImporterMailCopy);
            ImportTestSummary importTestSummary =
                    injectService.importInjectIntoScenarioFromXLS(mockedScenario,
                            mockedImportMapper, fileID, "CHECKLIST", 120, true);
            assertTrue(
                    importTestSummary.getImportMessage().stream().anyMatch(
                            importMessage -> importMessage.getMessageLevel().equals(ImportMessage.MessageLevel.WARN)
                            && importMessage.getErrorCode().equals(ImportMessage.ErrorCode.SEVERAL_MATCHES)
                    )
            );
        }
    }

    @DisplayName("Import an XLS file with absolute date")
    @Test
    void testImportXlsAbsoluteDate() throws IOException {
        try (MockedStatic<SessionHelper> sessionHelper = Mockito.mockStatic(SessionHelper.class)) {
            User mockedUser = new User();
            String fileID = UUID.randomUUID().toString();
            File testFile = ResourceUtils.getFile("classpath:xls-test-files/test_file_2.xlsx");
            createTempFile(testFile, fileID);

            mockedScenario = new Scenario();
            mockedScenario.setId(UUID.randomUUID().toString());

            mockedImportMapper = createImportMapper(UUID.randomUUID().toString());
            mockedImportMapper.getInjectImporters().forEach(injectImporter -> {
                injectImporter.setRuleAttributes(injectImporter.getRuleAttributes().stream()
                        .map(ruleAttribute -> {
                            if("trigger_time".equals(ruleAttribute.getName())) {
                                ruleAttribute.setAdditionalConfig(Map.of("timePattern", "dd/MM/yyyy HH'h'mm"));
                            }
                            return ruleAttribute;
                        }).toList()
                );
            });
            when(userRepository.findById(any())).thenReturn(Optional.of(mockedUser));
            Team team1 = new Team();
            team1.setName("team1");
            Team team2 = new Team();
            team2.setName("team2");
            when(teamRepository.findAll()).thenReturn(List.of(team1));
            when(teamRepository.save(any())).thenReturn(team2);

            sessionHelper.when(SessionHelper::currentUser).thenReturn(new OpenBASOAuth2User(mockedUser));
            ImportTestSummary importTestSummary =
                    injectService.importInjectIntoScenarioFromXLS(mockedScenario,
                            mockedImportMapper, fileID, "CHECKLIST", 120, true);

            assertTrue(LocalDateTime.of(2024, Month.JUNE, 26, 0, 0)
                    .toInstant(ZoneOffset.of("Z"))
                    .equals(mockedScenario.getRecurrenceStart()));
            assertTrue("0 0 7 * * *".equals(mockedScenario.getRecurrence()));
        }
    }

    @DisplayName("Import an XLS file with relative and absolute dates")
    @Test
    void testImportXlsAbsoluteAndRelativeDates() throws IOException {
        try (MockedStatic<SessionHelper> sessionHelper = Mockito.mockStatic(SessionHelper.class)) {
            User mockedUser = new User();
            String fileID = UUID.randomUUID().toString();
            File testFile = ResourceUtils.getFile("classpath:xls-test-files/test_file_3.xlsx");
            createTempFile(testFile, fileID);

            mockedScenario = new Scenario();
            mockedScenario.setId(UUID.randomUUID().toString());

            mockedImportMapper = createImportMapper(UUID.randomUUID().toString());
            mockedImportMapper.getInjectImporters().forEach(injectImporter -> {
                injectImporter.setRuleAttributes(injectImporter.getRuleAttributes().stream()
                        .map(ruleAttribute -> {
                            if("trigger_time".equals(ruleAttribute.getName())) {
                                ruleAttribute.setAdditionalConfig(Map.of("timePattern", "dd/MM/yyyy HH'h'mm"));
                            }
                            return ruleAttribute;
                        }).toList()
                );
            });
            when(userRepository.findById(any())).thenReturn(Optional.of(mockedUser));
            Team team1 = new Team();
            team1.setName("team1");
            Team team2 = new Team();
            team2.setName("team2");
            when(teamRepository.findAll()).thenReturn(List.of(team1));
            when(teamRepository.save(any())).thenReturn(team2);

            sessionHelper.when(SessionHelper::currentUser).thenReturn(new OpenBASOAuth2User(mockedUser));
            ImportTestSummary importTestSummary =
                    injectService.importInjectIntoScenarioFromXLS(mockedScenario,
                            mockedImportMapper, fileID, "CHECKLIST", 120, false);

            List<Inject> sortedInjects = importTestSummary.getInjects().stream()
                    .sorted(Comparator.comparing(Inject::getDependsDuration))
                    .toList();

            assertEquals(24 * 60 * 60, sortedInjects.get(1).getDependsDuration());
            assertEquals(24 * 60 * 60 + 5 * 60, sortedInjects.get(2).getDependsDuration());
            assertEquals(2 * 24 * 60 * 60, sortedInjects.get(3).getDependsDuration());
        }
    }

    @DisplayName("Import an XLS file with relative dates and absolute hours")
    @Test
    void testImportXlsRelativeDatesAndAbsoluteHour() throws IOException {
        try (MockedStatic<SessionHelper> sessionHelper = Mockito.mockStatic(SessionHelper.class)) {
            User mockedUser = new User();
            String fileID = UUID.randomUUID().toString();
            File testFile = ResourceUtils.getFile("classpath:xls-test-files/test_file_4.xlsx");
            createTempFile(testFile, fileID);

            mockedScenario.setId(UUID.randomUUID().toString());
            mockedScenario.setRecurrenceStart(LocalDateTime.of(2024, Month.JUNE, 26, 0, 0)
                    .toInstant(ZoneOffset.of("Z")));

            mockedImportMapper = createImportMapper(UUID.randomUUID().toString());
            mockedImportMapper.getInjectImporters().forEach(injectImporter -> {
                injectImporter.setRuleAttributes(injectImporter.getRuleAttributes().stream()
                        .map(ruleAttribute -> {
                            if("trigger_time".equals(ruleAttribute.getName())) {
                                ruleAttribute.setAdditionalConfig(Map.of("timePattern", "HH'h'mm"));
                            }
                            return ruleAttribute;
                        }).toList()
                );
            });
            when(userRepository.findById(any())).thenReturn(Optional.of(mockedUser));
            Team team1 = new Team();
            team1.setName("team1");
            Team team2 = new Team();
            team2.setName("team2");
            when(teamRepository.findAll()).thenReturn(List.of(team1));
            when(teamRepository.save(any())).thenReturn(team2);

            sessionHelper.when(SessionHelper::currentUser).thenReturn(new OpenBASOAuth2User(mockedUser));
            ImportTestSummary importTestSummary =
                    injectService.importInjectIntoScenarioFromXLS(mockedScenario,
                            mockedImportMapper, fileID, "CHECKLIST", 120, false);

            List<Inject> sortedInjects = importTestSummary.getInjects().stream()
                    .sorted(Comparator.comparing(Inject::getDependsDuration))
                    .toList();

            assertEquals(24 * 60 * 60, sortedInjects.get(1).getDependsDuration());
            assertEquals(2 * 24 * 60 * 60, sortedInjects.get(2).getDependsDuration());
            assertEquals(4 * 24 * 60 * 60 + 5 * 60, sortedInjects.get(3).getDependsDuration());
        }
    }

    @DisplayName("Critical message when import an XLS file with relative dates " +
            "and absolute hours but no date in scenario")
    @Test
    void testImportXlsRelativeDatesAndAbsoluteHourCriticalMessage() throws IOException {
        try (MockedStatic<SessionHelper> sessionHelper = Mockito.mockStatic(SessionHelper.class)) {
            User mockedUser = new User();
            String fileID = UUID.randomUUID().toString();
            File testFile = ResourceUtils.getFile("classpath:xls-test-files/test_file_4.xlsx");
            createTempFile(testFile, fileID);

            mockedScenario = new Scenario();
            mockedScenario.setId(UUID.randomUUID().toString());

            mockedImportMapper = createImportMapper(UUID.randomUUID().toString());
            mockedImportMapper.getInjectImporters().forEach(injectImporter -> {
                injectImporter.setRuleAttributes(injectImporter.getRuleAttributes().stream()
                        .map(ruleAttribute -> {
                            if("trigger_time".equals(ruleAttribute.getName())) {
                                ruleAttribute.setAdditionalConfig(Map.of("timePattern", "HH'h'mm"));
                            }
                            return ruleAttribute;
                        }).toList()
                );
            });
            when(userRepository.findById(any())).thenReturn(Optional.of(mockedUser));
            Team team1 = new Team();
            team1.setName("team1");
            Team team2 = new Team();
            team2.setName("team2");
            when(teamRepository.findAll()).thenReturn(List.of(team1));
            when(teamRepository.save(any())).thenReturn(team2);

            sessionHelper.when(SessionHelper::currentUser).thenReturn(new OpenBASOAuth2User(mockedUser));
            ImportTestSummary importTestSummary =
                    injectService.importInjectIntoScenarioFromXLS(mockedScenario,
                            mockedImportMapper, fileID, "CHECKLIST", 120, true);

            assertTrue(importTestSummary.getImportMessage().stream().anyMatch(
                    importMessage -> ImportMessage.MessageLevel.CRITICAL.equals(importMessage.getMessageLevel())
                    && ImportMessage.ErrorCode.ABSOLUTE_TIME_WITHOUT_START_DATE.equals(importMessage.getErrorCode())
            ));
        }
    }

    @DisplayName("Import an XLS file with relative dates, hours and minutes")
    @Test
    void testImportXlsRelativeDatesHoursAndMinutes() throws IOException {
        try (MockedStatic<SessionHelper> sessionHelper = Mockito.mockStatic(SessionHelper.class)) {
            User mockedUser = new User();
            String fileID = UUID.randomUUID().toString();
            File testFile = ResourceUtils.getFile("classpath:xls-test-files/test_file_5.xlsx");
            createTempFile(testFile, fileID);
            mockedInjectsImportInput = new InjectsImportInput();
            mockedInjectsImportInput.setImportMapperId(fileID);
            mockedInjectsImportInput.setName("CHECKLIST");
            mockedInjectsImportInput.setTimezoneOffset(120);

            mockedScenario = new Scenario();

            mockedImportMapper = createImportMapper(UUID.randomUUID().toString());
            when(userRepository.findById(any())).thenReturn(Optional.of(mockedUser));
            Team team1 = new Team();
            team1.setName("team1");
            Team team2 = new Team();
            team2.setName("team2");
            when(teamRepository.findAll()).thenReturn(List.of(team1));
            when(teamRepository.save(any())).thenReturn(team2);

            sessionHelper.when(SessionHelper::currentUser).thenReturn(new OpenBASOAuth2User(mockedUser));
            ImportTestSummary importTestSummary =
                    injectService.importInjectIntoScenarioFromXLS(mockedScenario,
                            mockedImportMapper, fileID, "CHECKLIST", 120, false);

            List<Inject> sortedInjects = importTestSummary.getInjects().stream()
                    .sorted(Comparator.comparing(Inject::getDependsDuration))
                    .toList();

            assertEquals(24 * 60 * 60, sortedInjects.get(1).getDependsDuration());
            assertEquals(((((2 * 24) + 2) * 60) - 5) * 60, sortedInjects.get(2).getDependsDuration());
            assertEquals(4 * 24 * 60 * 60, sortedInjects.get(3).getDependsDuration());
        }
    }

    @DisplayName("Import an XLS file with default values")
    @Test
    void testImportXlsDefaultValue() throws IOException {
        try (MockedStatic<SessionHelper> sessionHelper = Mockito.mockStatic(SessionHelper.class)) {
            User mockedUser = new User();
            String fileID = UUID.randomUUID().toString();
            File testFile = ResourceUtils.getFile("classpath:xls-test-files/test_file_5.xlsx");
            createTempFile(testFile, fileID);

            mockedScenario = new Scenario();
            mockedScenario.setId(UUID.randomUUID().toString());

            mockedImportMapper = createImportMapper(UUID.randomUUID().toString());
            mockedImportMapper.getInjectImporters().forEach(injectImporter -> {
                injectImporter.setRuleAttributes(injectImporter.getRuleAttributes().stream()
                        .map(ruleAttribute -> {
                            if("title".equals(ruleAttribute.getName())
                                    || "trigger_time".equals(ruleAttribute.getName())) {
                                ruleAttribute.setColumns("A");
                            }
                            return ruleAttribute;
                        }).toList()
                );
            });
            when(userRepository.findById(any())).thenReturn(Optional.of(mockedUser));
            Team team1 = new Team();
            team1.setName("team1");
            Team team2 = new Team();
            team2.setName("team2");
            when(teamRepository.findAll()).thenReturn(List.of(team1));
            when(teamRepository.save(any())).thenReturn(team2);

            sessionHelper.when(SessionHelper::currentUser).thenReturn(new OpenBASOAuth2User(mockedUser));
            ImportTestSummary importTestSummary =
                    injectService.importInjectIntoScenarioFromXLS(mockedScenario,
                            mockedImportMapper, fileID, "CHECKLIST", 120, false);

            assertSame("title", importTestSummary.getInjects().getFirst().getTitle());
        }
    }

    private void createTempFile(File testFile, String fileID) throws IOException {
        InputStream in = new FileInputStream(testFile);
        MockMultipartFile file = new MockMultipartFile("file",
                "my-awesome-file.xls",
                "application/xlsx",
                in.readAllBytes());

        // Writing the file in a temp dir
        Path tempDir = Files.createDirectory(Path.of(System.getProperty("java.io.tmpdir"), fileID));
        Path tempFile = Files.createTempFile(tempDir, null, "." + FilenameUtils.getExtension(file.getOriginalFilename()));
        Files.write(tempFile, file.getBytes());

        // We're making sure the files are deleted when the test stops
        tempDir.toFile().deleteOnExit();
        tempFile.toFile().deleteOnExit();
    }

    private ImportMapper createImportMapper(String id) throws JsonProcessingException {
        ImportMapper importMapper = new ImportMapper();
        importMapper.setName("test import mapper");
        importMapper.setId(id);
        importMapper.setInjectTypeColumn("B");
        importMapper.setInjectImporters(new ArrayList<>());

        InjectImporter injectImporterSms = new InjectImporter();
        injectImporterSms.setId(UUID.randomUUID().toString());
        injectImporterSms.setImportTypeValue(".*(sms|SMS).*");
        injectImporterSms.setRuleAttributes(new ArrayList<>());
        injectImporterSms.setInjectorContract(createSmsInjectorContract());

        injectImporterSms.getRuleAttributes().addAll(createRuleAttributeSms());

        InjectImporter injectImporterMail = new InjectImporter();
        injectImporterMail.setId(UUID.randomUUID().toString());
        injectImporterMail.setImportTypeValue(".*mail.*");
        injectImporterMail.setRuleAttributes(new ArrayList<>());
        injectImporterMail.setInjectorContract(createMailInjectorContract());

        injectImporterMail.getRuleAttributes().addAll(createRuleAttributeMail());

        importMapper.getInjectImporters().add(injectImporterSms);
        importMapper.getInjectImporters().add(injectImporterMail);

        return importMapper;
    }

    private InjectorContract createSmsInjectorContract() throws JsonProcessingException {
        InjectorContract injectorContract = new InjectorContract();
        ObjectNode jsonNode = (ObjectNode) mapper.readTree("{\"config\":{\"type\":\"openbas_ovh_sms\",\"expose\":true,\"label\":{\"en\":\"SMS (OVH)\"},\"color_dark\":\"#9c27b0\",\"color_light\":\"#9c27b0\"},\"label\":{\"en\":\"Send a SMS\",\"fr\":\"Envoyer un SMS\"},\"manual\":false,\"fields\":[{\"key\":\"teams\",\"label\":\"Teams\",\"mandatory\":true,\"readOnly\":false,\"mandatoryGroups\":null,\"linkedFields\":[],\"linkedValues\":[],\"cardinality\":\"n\",\"defaultValue\":[],\"type\":\"team\"},{\"key\":\"message\",\"label\":\"Message\",\"mandatory\":true,\"readOnly\":false,\"mandatoryGroups\":null,\"linkedFields\":[],\"linkedValues\":[],\"defaultValue\":\"\",\"richText\":false,\"type\":\"textarea\"},{\"key\":\"expectations\",\"label\":\"Expectations\",\"mandatory\":false,\"readOnly\":false,\"mandatoryGroups\":null,\"linkedFields\":[],\"linkedValues\":[],\"cardinality\":\"n\",\"defaultValue\":[],\"predefinedExpectations\":[],\"type\":\"expectation\"}],\"variables\":[{\"key\":\"user\",\"label\":\"User that will receive the injection\",\"type\":\"String\",\"cardinality\":\"1\",\"children\":[{\"key\":\"user.id\",\"label\":\"Id of the user in the platform\",\"type\":\"String\",\"cardinality\":\"1\",\"children\":[]},{\"key\":\"user.email\",\"label\":\"Email of the user\",\"type\":\"String\",\"cardinality\":\"1\",\"children\":[]},{\"key\":\"user.firstname\",\"label\":\"Firstname of the user\",\"type\":\"String\",\"cardinality\":\"1\",\"children\":[]},{\"key\":\"user.lastname\",\"label\":\"Lastname of the user\",\"type\":\"String\",\"cardinality\":\"1\",\"children\":[]},{\"key\":\"user.lang\",\"label\":\"Lang of the user\",\"type\":\"String\",\"cardinality\":\"1\",\"children\":[]}]},{\"key\":\"exercise\",\"label\":\"Exercise of the current injection\",\"type\":\"Object\",\"cardinality\":\"1\",\"children\":[{\"key\":\"exercise.id\",\"label\":\"Id of the user in the platform\",\"type\":\"String\",\"cardinality\":\"1\",\"children\":[]},{\"key\":\"exercise.name\",\"label\":\"Name of the exercise\",\"type\":\"String\",\"cardinality\":\"1\",\"children\":[]},{\"key\":\"exercise.description\",\"label\":\"Description of the exercise\",\"type\":\"String\",\"cardinality\":\"1\",\"children\":[]}]},{\"key\":\"teams\",\"label\":\"List of team name for the injection\",\"type\":\"String\",\"cardinality\":\"n\",\"children\":[]},{\"key\":\"player_uri\",\"label\":\"Player interface platform link\",\"type\":\"String\",\"cardinality\":\"1\",\"children\":[]},{\"key\":\"challenges_uri\",\"label\":\"Challenges interface platform link\",\"type\":\"String\",\"cardinality\":\"1\",\"children\":[]},{\"key\":\"scoreboard_uri\",\"label\":\"Scoreboard interface platform link\",\"type\":\"String\",\"cardinality\":\"1\",\"children\":[]},{\"key\":\"lessons_uri\",\"label\":\"Lessons learned interface platform link\",\"type\":\"String\",\"cardinality\":\"1\",\"children\":[]}],\"context\":{},\"contract_id\":\"e9e902bc-b03d-4223-89e1-fca093ac79dd\",\"contract_attack_patterns_external_ids\":[],\"is_atomic_testing\":true,\"needs_executor\":false,\"platforms\":[\"Service\"]}");
        injectorContract.setConvertedContent(jsonNode);

        return injectorContract;
    }

    private InjectorContract createMailInjectorContract() throws JsonProcessingException {
        InjectorContract injectorContract = new InjectorContract();
        ObjectNode jsonNode = (ObjectNode) mapper.readTree("{\"config\":{\"type\":\"openbas_email\",\"expose\":true,\"label\":{\"en\":\"Email\",\"fr\":\"Email\"},\"color_dark\":\"#cddc39\",\"color_light\":\"#cddc39\"},\"label\":{\"en\":\"Send individual mails\",\"fr\":\"Envoyer des mails individuels\"},\"manual\":false,\"fields\":[{\"key\":\"teams\",\"label\":\"Teams\",\"mandatory\":true,\"readOnly\":false,\"mandatoryGroups\":null,\"linkedFields\":[],\"linkedValues\":[],\"cardinality\":\"n\",\"defaultValue\":[],\"type\":\"team\"},{\"key\":\"subject\",\"label\":\"Subject\",\"mandatory\":true,\"readOnly\":false,\"mandatoryGroups\":null,\"linkedFields\":[],\"linkedValues\":[],\"defaultValue\":\"\",\"type\":\"text\"},{\"key\":\"body\",\"label\":\"Body\",\"mandatory\":true,\"readOnly\":false,\"mandatoryGroups\":null,\"linkedFields\":[],\"linkedValues\":[],\"defaultValue\":\"\",\"richText\":true,\"type\":\"textarea\"},{\"key\":\"encrypted\",\"label\":\"Encrypted\",\"mandatory\":false,\"readOnly\":false,\"mandatoryGroups\":null,\"linkedFields\":[],\"linkedValues\":[],\"defaultValue\":false,\"type\":\"checkbox\"},{\"key\":\"attachments\",\"label\":\"Attachments\",\"mandatory\":false,\"readOnly\":false,\"mandatoryGroups\":null,\"linkedFields\":[],\"linkedValues\":[],\"cardinality\":\"n\",\"defaultValue\":[],\"type\":\"attachment\"},{\"key\":\"expectations\",\"label\":\"Expectations\",\"mandatory\":false,\"readOnly\":false,\"mandatoryGroups\":null,\"linkedFields\":[],\"linkedValues\":[],\"cardinality\":\"n\",\"defaultValue\":[],\"predefinedExpectations\":[],\"type\":\"expectation\"}],\"variables\":[{\"key\":\"document_uri\",\"label\":\"Http user link to upload the document (only for document expectation)\",\"type\":\"String\",\"cardinality\":\"1\",\"children\":[]},{\"key\":\"user\",\"label\":\"User that will receive the injection\",\"type\":\"String\",\"cardinality\":\"1\",\"children\":[{\"key\":\"user.id\",\"label\":\"Id of the user in the platform\",\"type\":\"String\",\"cardinality\":\"1\",\"children\":[]},{\"key\":\"user.email\",\"label\":\"Email of the user\",\"type\":\"String\",\"cardinality\":\"1\",\"children\":[]},{\"key\":\"user.firstname\",\"label\":\"Firstname of the user\",\"type\":\"String\",\"cardinality\":\"1\",\"children\":[]},{\"key\":\"user.lastname\",\"label\":\"Lastname of the user\",\"type\":\"String\",\"cardinality\":\"1\",\"children\":[]},{\"key\":\"user.lang\",\"label\":\"Lang of the user\",\"type\":\"String\",\"cardinality\":\"1\",\"children\":[]}]},{\"key\":\"exercise\",\"label\":\"Exercise of the current injection\",\"type\":\"Object\",\"cardinality\":\"1\",\"children\":[{\"key\":\"exercise.id\",\"label\":\"Id of the user in the platform\",\"type\":\"String\",\"cardinality\":\"1\",\"children\":[]},{\"key\":\"exercise.name\",\"label\":\"Name of the exercise\",\"type\":\"String\",\"cardinality\":\"1\",\"children\":[]},{\"key\":\"exercise.description\",\"label\":\"Description of the exercise\",\"type\":\"String\",\"cardinality\":\"1\",\"children\":[]}]},{\"key\":\"teams\",\"label\":\"List of team name for the injection\",\"type\":\"String\",\"cardinality\":\"n\",\"children\":[]},{\"key\":\"player_uri\",\"label\":\"Player interface platform link\",\"type\":\"String\",\"cardinality\":\"1\",\"children\":[]},{\"key\":\"challenges_uri\",\"label\":\"Challenges interface platform link\",\"type\":\"String\",\"cardinality\":\"1\",\"children\":[]},{\"key\":\"scoreboard_uri\",\"label\":\"Scoreboard interface platform link\",\"type\":\"String\",\"cardinality\":\"1\",\"children\":[]},{\"key\":\"lessons_uri\",\"label\":\"Lessons learned interface platform link\",\"type\":\"String\",\"cardinality\":\"1\",\"children\":[]}],\"context\":{},\"contract_id\":\"138ad8f8-32f8-4a22-8114-aaa12322bd09\",\"contract_attack_patterns_external_ids\":[],\"is_atomic_testing\":true,\"needs_executor\":false,\"platforms\":[\"Service\"]}");
        injectorContract.setConvertedContent(jsonNode);

        return injectorContract;
    }

    private List<RuleAttribute> createRuleAttributeSms() {
        List<RuleAttribute> results = new ArrayList<>();
        RuleAttribute ruleAttributeTitle = new RuleAttribute();
        ruleAttributeTitle.setName("title");
        ruleAttributeTitle.setColumns("B");
        ruleAttributeTitle.setDefaultValue("title");

        RuleAttribute ruleAttributeDescription = new RuleAttribute();
        ruleAttributeDescription.setName("description");
        ruleAttributeDescription.setColumns("G");
        ruleAttributeDescription.setDefaultValue("description");

        RuleAttribute ruleAttributeTriggerTime = new RuleAttribute();
        ruleAttributeTriggerTime.setName("trigger_time");
        ruleAttributeTriggerTime.setColumns("C");
        ruleAttributeTriggerTime.setDefaultValue("trigger_time");
        ruleAttributeTriggerTime.setAdditionalConfig(Map.of("timePattern", ""));

        RuleAttribute ruleAttributeMessage = new RuleAttribute();
        ruleAttributeMessage.setName("message");
        ruleAttributeMessage.setColumns("F");
        ruleAttributeMessage.setDefaultValue("message");

        RuleAttribute ruleAttributeTeams = new RuleAttribute();
        ruleAttributeTeams.setName("teams");
        ruleAttributeTeams.setColumns("D");
        ruleAttributeTeams.setDefaultValue("teams");

        RuleAttribute ruleAttributeExpectationScore = new RuleAttribute();
        ruleAttributeExpectationScore.setName("expectation_score");
        ruleAttributeExpectationScore.setColumns("J");
        ruleAttributeExpectationScore.setDefaultValue("500.0");

        RuleAttribute ruleAttributeExpectationName = new RuleAttribute();
        ruleAttributeExpectationName.setName("expectation_name");
        ruleAttributeExpectationName.setColumns("I");
        ruleAttributeExpectationName.setDefaultValue("name");

        RuleAttribute ruleAttributeExpectationDescription = new RuleAttribute();
        ruleAttributeExpectationDescription.setName("expectation_description");
        ruleAttributeExpectationDescription.setColumns("H");
        ruleAttributeExpectationDescription.setDefaultValue("description");

        results.add(ruleAttributeTitle);
        results.add(ruleAttributeDescription);
        results.add(ruleAttributeTriggerTime);
        results.add(ruleAttributeMessage);
        results.add(ruleAttributeTeams);
        results.add(ruleAttributeExpectationScore);
        results.add(ruleAttributeExpectationName);
        results.add(ruleAttributeExpectationDescription);

        return results;
    }

    private List<RuleAttribute> createRuleAttributeMail() {
        List<RuleAttribute> results = new ArrayList<>();
        RuleAttribute ruleAttributeTitle = new RuleAttribute();
        ruleAttributeTitle.setName("title");
        ruleAttributeTitle.setColumns("B");
        ruleAttributeTitle.setDefaultValue("title");

        RuleAttribute ruleAttributeDescription = new RuleAttribute();
        ruleAttributeDescription.setName("description");
        ruleAttributeDescription.setColumns("G");
        ruleAttributeDescription.setDefaultValue("description");

        RuleAttribute ruleAttributeTriggerTime = new RuleAttribute();
        ruleAttributeTriggerTime.setName("trigger_time");
        ruleAttributeTriggerTime.setColumns("C");
        ruleAttributeTriggerTime.setDefaultValue("trigger_time");
        ruleAttributeTriggerTime.setAdditionalConfig(Map.of("timePattern", ""));

        RuleAttribute ruleAttributeMessage = new RuleAttribute();
        ruleAttributeMessage.setName("subject");
        ruleAttributeMessage.setColumns("E");
        ruleAttributeMessage.setDefaultValue("subject");

        RuleAttribute ruleAttributeSubject = new RuleAttribute();
        ruleAttributeSubject.setName("body");
        ruleAttributeSubject.setColumns("F");
        ruleAttributeSubject.setDefaultValue("body");

        RuleAttribute ruleAttributeTeams = new RuleAttribute();
        ruleAttributeTeams.setName("teams");
        ruleAttributeTeams.setColumns("D");
        ruleAttributeTeams.setDefaultValue("teams");

        RuleAttribute ruleAttributeExpectationScore = new RuleAttribute();
        ruleAttributeExpectationScore.setName("expectation_score");
        ruleAttributeExpectationScore.setColumns("J");
        ruleAttributeExpectationScore.setDefaultValue("500.0");

        RuleAttribute ruleAttributeExpectationName = new RuleAttribute();
        ruleAttributeExpectationName.setName("expectation_name");
        ruleAttributeExpectationName.setColumns("I");
        ruleAttributeExpectationName.setDefaultValue("name");

        RuleAttribute ruleAttributeExpectationDescription = new RuleAttribute();
        ruleAttributeExpectationDescription.setName("expectation_description");
        ruleAttributeExpectationDescription.setColumns("H");
        ruleAttributeExpectationDescription.setDefaultValue("description");

        results.add(ruleAttributeTitle);
        results.add(ruleAttributeDescription);
        results.add(ruleAttributeTriggerTime);
        results.add(ruleAttributeMessage);
        results.add(ruleAttributeSubject);
        results.add(ruleAttributeTeams);
        results.add(ruleAttributeExpectationScore);
        results.add(ruleAttributeExpectationName);
        results.add(ruleAttributeExpectationDescription);

        return results;
    }

    private Object deepCopy(Object objectToCopy, Class classToCopy) throws JsonProcessingException {
        ObjectMapper objectMapper = new ObjectMapper();

        return objectMapper
                .readValue(objectMapper.writeValueAsString(objectToCopy), classToCopy);
    }
}
