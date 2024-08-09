package io.openbas.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.openbas.database.model.*;
import io.openbas.database.raw.*;
import io.openbas.database.repository.*;
import io.openbas.rest.exception.BadRequestException;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.inject.form.InjectUpdateStatusInput;
import io.openbas.rest.inject.output.InjectOutput;
import io.openbas.rest.scenario.response.ImportMessage;
import io.openbas.rest.scenario.response.ImportPostSummary;
import io.openbas.rest.scenario.response.ImportTestSummary;
import io.openbas.utils.InjectUtils;
import jakarta.annotation.Resource;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Tuple;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.*;
import jakarta.transaction.Transactional;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.lang3.time.DateFormatUtils;
import org.apache.logging.log4j.util.Strings;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellReference;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.util.CollectionUtils;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.FileSystems;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.time.temporal.ChronoField;
import java.time.temporal.ChronoUnit;
import java.time.temporal.Temporal;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import java.util.stream.StreamSupport;

import static io.openbas.config.SessionHelper.currentUser;
import static io.openbas.utils.JpaUtils.createJoinArrayAggOnId;
import static io.openbas.utils.JpaUtils.createLeftJoin;
import static java.time.Instant.now;

@RequiredArgsConstructor
@Service
@Log
public class InjectService {

    private final InjectRepository injectRepository;
    private final InjectDocumentRepository injectDocumentRepository;
    private final InjectExpectationRepository injectExpectationRepository;
    private final AssetRepository assetRepository;
    private final AssetGroupRepository assetGroupRepository;
    private final ScenarioTeamUserRepository scenarioTeamUserRepository;
    private final TeamRepository teamRepository;
    private final UserRepository userRepository;
    private final ScenarioService scenarioService;

    private final List<String> importReservedField = List.of("description", "title", "trigger_time");

    @Resource
    protected ObjectMapper mapper;
    @PersistenceContext
    private EntityManager entityManager;

    final Pattern relativeDayPattern = Pattern.compile("^.*[DJ]([+\\-]?[0-9]*)(.*)$");
    final Pattern relativeHourPattern = Pattern.compile("^.*[HT]([+\\-]?[0-9]*).*$");
    final Pattern relativeMinutePattern = Pattern.compile("^.*[M]([+\\-]?[0-9]*).*$");

    final String pathSeparator = FileSystems.getDefault().getSeparator();

    final int FILE_STORAGE_DURATION = 60;

    public void cleanInjectsDocExercise(String exerciseId, String documentId) {
        // Delete document from all exercise injects
        List<Inject> exerciseInjects = injectRepository.findAllForExerciseAndDoc(exerciseId, documentId);
        List<InjectDocument> updatedInjects = exerciseInjects.stream().flatMap(inject -> {
            @SuppressWarnings("UnnecessaryLocalVariable")
            Stream<InjectDocument> filterDocuments = inject.getDocuments().stream()
                    .filter(document -> document.getDocument().getId().equals(documentId));
            return filterDocuments;
        }).toList();
        injectDocumentRepository.deleteAll(updatedInjects);
    }

    public void cleanInjectsDocScenario(String scenarioId, String documentId) {
        // Delete document from all scenario injects
        List<Inject> scenarioInjects = injectRepository.findAllForScenarioAndDoc(scenarioId, documentId);
        List<InjectDocument> updatedInjects = scenarioInjects.stream().flatMap(inject -> {
            @SuppressWarnings("UnnecessaryLocalVariable")
            Stream<InjectDocument> filterDocuments = inject.getDocuments().stream()
                    .filter(document -> document.getDocument().getId().equals(documentId));
            return filterDocuments;
        }).toList();
        injectDocumentRepository.deleteAll(updatedInjects);
    }

    @Transactional(rollbackOn = Exception.class)
    public Inject updateInjectStatus(String injectId, InjectUpdateStatusInput input) {
        Inject inject = injectRepository.findById(injectId).orElseThrow();
        // build status
        InjectStatus injectStatus = new InjectStatus();
        injectStatus.setInject(inject);
        injectStatus.setTrackingSentDate(now());
        injectStatus.setName(ExecutionStatus.valueOf(input.getStatus()));
        injectStatus.setTrackingTotalExecutionTime(0L);
        // Save status for inject
        inject.setStatus(injectStatus);
        return injectRepository.save(inject);
    }


  @Transactional(rollbackOn = Exception.class)
  public void deleteAllByIds(List<String> injectIds) {
    if (!CollectionUtils.isEmpty(injectIds)) {
      injectRepository.deleteAllById(injectIds);
    }
  }

  public List<InjectOutput> injects(Specification<Inject> specification) {
    CriteriaBuilder cb = this.entityManager.getCriteriaBuilder();

    CriteriaQuery<Tuple> cq = cb.createTupleQuery();
    Root<Inject> injectRoot = cq.from(Inject.class);
    selectForInject(cb, cq, injectRoot);

    // -- Text Search and Filters --
    if (specification != null) {
      Predicate predicate = specification.toPredicate(injectRoot, cq, cb);
      if (predicate != null) {
        cq.where(predicate);
      }
    }

    // -- Sorting --
    cq.orderBy(cb.asc(injectRoot.get("dependsDuration")));

    // Type Query
    TypedQuery<Tuple> query = this.entityManager.createQuery(cq);

    // -- EXECUTION --
    return execInject(query);
  }

    /**
     * Create inject programmatically based on rawInject, rawInjectExpectation, rawAsset, rawAssetGroup, rawTeam
     */
    public Map<String, Inject> mapOfInjects(@NotNull final List<String> injectIds) {
        List<Inject> listOfInjects = new ArrayList<>();

        List<RawInject> listOfRawInjects = this.injectRepository.findRawByIds(injectIds);
        // From the list of injects, we get all the inject expectationsIds that we then get
        // and put into a map with the expections ids as key
        Map<String, RawInjectExpectation> mapOfInjectsExpectations = mapOfInjectsExpectations(listOfRawInjects);

        // We get the asset groups from the injects AND the injects expectations as those can also have asset groups
        // We then make a map out of it for faster access
        Map<String, RawAssetGroup> mapOfAssetGroups = mapOfAssetGroups(listOfRawInjects, mapOfInjectsExpectations.values());

        // We get all the assets that are
        // 1 - linked to an inject
        // 2 - linked to an asset group linked to an inject
        // 3 - linked to an inject expectation
        // 4 - linked to an asset group linked to an inject expectations
        // We then make a map out of it
        Map<String, RawAsset> mapOfAssets = mapOfAssets(listOfRawInjects, mapOfInjectsExpectations, mapOfAssetGroups);

        // We get all the teams that are linked to an inject or an asset group
        // Then we make a map out of it for faster access
        Map<String, RawTeam> mapOfRawTeams = mapOfRawTeams(listOfRawInjects, mapOfInjectsExpectations);

        // Once we have all of this, we create an Inject for each InjectRaw that we have using all the Raw objects we got
        // Then we make a map out of it for faster access
        listOfRawInjects.stream().map((inject) -> Inject.fromRawInject(inject, mapOfRawTeams, mapOfInjectsExpectations, mapOfAssetGroups, mapOfAssets)).forEach(listOfInjects::add);
        return listOfInjects.stream().collect(Collectors.toMap(Inject::getId, Function.identity()));
    }

    /**
     * Store an xls file for ulterior import. The file will be deleted on exit.
     * @param file
     * @return
     */
    public ImportPostSummary storeXlsFileForImport(MultipartFile file) {
        ImportPostSummary result = new ImportPostSummary();
        result.setAvailableSheets(new ArrayList<>());
        // Generating an UUID for identifying the file
        String fileID = UUID.randomUUID().toString();
        result.setImportId(fileID);
        try {
            // We're opening the file and listing the names of the sheets
            Workbook workbook = WorkbookFactory.create(file.getInputStream());
            for (int i = 0; i < workbook.getNumberOfSheets(); i++) {
                result.getAvailableSheets().add(workbook.getSheetName(i));
            }
            // Writing the file in a temp dir
            Path tempDir = Files.createDirectory(Path.of(System.getProperty("java.io.tmpdir"), fileID));
            Path tempFile = Files.createTempFile(tempDir, null, "." + FilenameUtils.getExtension(file.getOriginalFilename()));
            Files.write(tempFile, file.getBytes());

            CompletableFuture.delayedExecutor(FILE_STORAGE_DURATION, TimeUnit.MINUTES).execute(() -> {
                tempFile.toFile().delete();
                tempDir.toFile().delete();
            });

            // We're making sure the files are deleted when the backend restart
            tempDir.toFile().deleteOnExit();
            tempFile.toFile().deleteOnExit();
        } catch (Exception ex) {
            log.severe("Error while importing an xls file");
            log.severe(Arrays.toString(ex.getStackTrace()));
            throw new BadRequestException("File seems to be corrupt");
        }

        return result;
    }

    public ImportTestSummary importInjectIntoScenarioFromXLS(Scenario scenario, ImportMapper importMapper, String importId, String sheetName, int timezoneOffset, boolean saveAll) {
        // We call the inject service to get the injects to create as well as messages on how things went
        ImportTestSummary importTestSummary = importXls(importId, scenario, importMapper, sheetName, timezoneOffset);
        Optional<ImportMessage> hasCritical = importTestSummary.getImportMessage().stream()
                .filter(importMessage -> importMessage.getMessageLevel() == ImportMessage.MessageLevel.CRITICAL)
                .findAny();
        importTestSummary.setTotalNumberOfInjects(importTestSummary.getInjects().size());
        if(hasCritical.isPresent()) {
            // If there are critical errors, we do not save and we
            // empty the list of injects, we just keep the messages
            importTestSummary.setTotalNumberOfInjects(0);
            importTestSummary.setInjects(new ArrayList<>());
        } else if(saveAll) {
            importTestSummary.setInjects(importTestSummary.getInjects().stream().map(inject -> {
                inject.setListened(false);
                return inject;
            }).toList());
            Iterable<Inject> newInjects = injectRepository.saveAll(importTestSummary.getInjects());
            newInjects.forEach(inject -> {
                scenario.getInjects().add(inject);
                inject.getTeams().forEach(team -> {
                    if (!scenario.getTeams().contains(team)) {
                        scenario.getTeams().add(team);
                    }
                });
                inject.getTeams().forEach(team -> team.getUsers().forEach(user -> {
                    if(!scenario.getTeamUsers().contains(user)) {
                        ScenarioTeamUser scenarioTeamUser = new ScenarioTeamUser();
                        scenarioTeamUser.setScenario(scenario);
                        scenarioTeamUser.setTeam(team);
                        scenarioTeamUser.setUser(user);
                        scenarioTeamUserRepository.save(scenarioTeamUser);
                        scenario.getTeamUsers().add(scenarioTeamUser);
                    }
                }));
            });
            scenarioService.updateScenario(scenario);
            importTestSummary.setInjects(new ArrayList<>());
        } else {
            importTestSummary.setInjects(importTestSummary.getInjects().stream().limit(5).toList());
        }

        return importTestSummary;
    }

    private ImportTestSummary importXls(String importId, Scenario scenario, ImportMapper importMapper, String sheetName, int timezoneOffset) {
        ImportTestSummary importTestSummary = new ImportTestSummary();

        try {
            // We open the previously saved file
            String tmpdir = System.getProperty("java.io.tmpdir");
            java.nio.file.Path file = Files.list(Path.of(tmpdir, pathSeparator, importId, pathSeparator)).findFirst().orElseThrow();

            // We open the file and convert it to an apache POI object
            InputStream xlsFile = Files.newInputStream(file);
            Workbook workbook = WorkbookFactory.create(xlsFile);
            Sheet selectedSheet = workbook.getSheet(sheetName);

            Map<Integer, InjectTime> mapInstantByRowIndex = new HashMap<>();

            // For performance reasons, we compile the pattern of the Inject Importers only once
            Map<String, Pattern> mapPatternByInjectImport = importMapper
                .getInjectImporters().stream().collect(
                    Collectors.toMap(InjectImporter::getId,
                            injectImporter -> Pattern.compile(injectImporter.getImportTypeValue())
                    ));

            // We also get the list of teams into a map to be able to get them easily later on
            // First, all the teams that are non-contextual
            Map<String, Team> mapTeamByName =
                    StreamSupport.stream(teamRepository.findAll().spliterator(), false)
                            .filter(team -> !team.getContextual())
                            .collect(Collectors.toMap(Team::getName, Function.identity(), (first, second) -> first));

            // Then we add the contextual teams of the scenario
            mapTeamByName.putAll(
                scenario.getTeams().stream()
                    .filter(Team::getContextual)
                    .collect(Collectors.toMap(Team::getName, Function.identity(), (first, second) -> first))
            );

            ZoneOffset zoneOffset = ZoneOffset.ofTotalSeconds(timezoneOffset * 60);

            // For each rows of the selected sheet
            selectedSheet.rowIterator().forEachRemaining(row -> {
                ImportRow rowSummary = importRow(row, importMapper, scenario, mapPatternByInjectImport, mapTeamByName,
                        zoneOffset);
                importTestSummary.getImportMessage().addAll(rowSummary.getImportMessages());
                if(rowSummary.getInject() != null) {
                    importTestSummary.getInjects().add(rowSummary.getInject());
                }
                if(rowSummary.getInjectTime() != null) {
                    mapInstantByRowIndex.put(row.getRowNum(), rowSummary.getInjectTime());
                }
            });

            // Now that we did our first pass, we do another one real quick to find out
            // the date relative to each others
            importTestSummary.getImportMessage().addAll(updateInjectDates(mapInstantByRowIndex));

            // We get the earliest date
            Optional<Instant> earliestDate = mapInstantByRowIndex.values().stream()
                    .map(InjectTime::getDate)
                    .filter(Objects::nonNull)
                    .min(Comparator.naturalOrder());

            // If there is one, we update the scenario date
            earliestDate.ifPresent(date -> {
                ZonedDateTime zonedDateTime = date.atZone(ZoneId.of("UTC"));
                Instant dayOfStart = ZonedDateTime.of(
                        zonedDateTime.getYear(), zonedDateTime.getMonthValue(), zonedDateTime.getDayOfMonth(),
                        0, 0, 0, 0, ZoneId.of("UTC")).toInstant();
                scenario.setRecurrenceStart(dayOfStart);
                scenario.setRecurrence("0 " + zonedDateTime.getMinute() + " " + zonedDateTime.getHour() + " * * *"); // Every day now + 1 hour
                scenario.setRecurrenceEnd(dayOfStart.plus(1, ChronoUnit.DAYS));
            });
        } catch (IOException ex) {
            log.severe("Error while importing an xls file");
            log.severe(Arrays.toString(ex.getStackTrace()));
            throw new BadRequestException();
        }

        // Sorting by the order of the enum declaration to have error messages first, then warn and then info
        importTestSummary.getImportMessage().sort(Comparator.comparing(ImportMessage::getMessageLevel));

        return importTestSummary;
    }

    private ImportRow importRow(Row row, ImportMapper importMapper, Scenario scenario,
                                Map<String, Pattern> mapPatternByInjectImport, Map<String, Team> mapTeamByName,
                                ZoneOffset timezoneOffset) {
        ImportRow importTestSummary = new ImportRow();
        // The column that differenciate the importer is the same for all so we get it right now
        int colTypeIdx = CellReference.convertColStringToIndex(importMapper.getInjectTypeColumn());
        if (colTypeIdx < 0) {
            // If there are no values, we add an info message so they know there is a potential issue here
            importTestSummary.getImportMessages().add(
                    new ImportMessage(ImportMessage.MessageLevel.INFO,
                            ImportMessage.ErrorCode.NO_POTENTIAL_MATCH_FOUND,
                            Map.of("column_type_num", importMapper.getInjectTypeColumn(),
                                    "row_num", String.valueOf(row.getRowNum()))
                    )
            );
            return importTestSummary;
        }

        //If the row is completely empty, we ignore it altogether and do not send a warn message
        if (InjectUtils.checkIfRowIsEmpty(row)) {
            return importTestSummary;
        }
        // First of all, we get the value of the differenciation cell
        Cell typeCell = row.getCell(colTypeIdx);
        if (typeCell == null) {
            // If there are no values, we add an info message so they know there is a potential issue here
            importTestSummary.getImportMessages().add(
                new ImportMessage(ImportMessage.MessageLevel.INFO,
                        ImportMessage.ErrorCode.NO_POTENTIAL_MATCH_FOUND,
                    Map.of("column_type_num", importMapper.getInjectTypeColumn(),
                            "row_num", String.valueOf(row.getRowNum()))
                )
            );
            return importTestSummary;
        }

        // We find the matching importers on the inject
        List<InjectImporter> matchingInjectImporters = importMapper.getInjectImporters().stream()
            .filter(injectImporter -> {
                Matcher matcher = mapPatternByInjectImport.get(injectImporter.getId())
                        .matcher(getValueAsString(row, importMapper.getInjectTypeColumn()));
                return matcher.find();
            }).toList();

        // If there are no match, we add a message for the user and we go to the next row
        if (matchingInjectImporters.isEmpty()) {
            importTestSummary.getImportMessages().add(
                new ImportMessage(ImportMessage.MessageLevel.INFO,
                        ImportMessage.ErrorCode.NO_POTENTIAL_MATCH_FOUND,
                    Map.of("column_type_num", importMapper.getInjectTypeColumn(),
                            "row_num", String.valueOf(row.getRowNum()))
                )
            );
            return importTestSummary;
        }

        // If there are more than one match, we add a message for the user and use the first match
        if (matchingInjectImporters.size() > 1) {
            String listMatchers = matchingInjectImporters.stream().map(InjectImporter::getImportTypeValue).collect(Collectors.joining(", "));
            importTestSummary.getImportMessages().add(
                new ImportMessage(ImportMessage.MessageLevel.WARN,
                        ImportMessage.ErrorCode.SEVERAL_MATCHES,
                    Map.of("column_type_num", importMapper.getInjectTypeColumn(),
                            "row_num", String.valueOf(row.getRowNum()),
                            "possible_matches", listMatchers)
                )
            );
            return importTestSummary;
        }

        InjectImporter matchingInjectImporter = matchingInjectImporters.get(0);
        InjectorContract injectorContract = matchingInjectImporter.getInjectorContract();

        // Creating the inject
        Inject inject = new Inject();
        inject.setDependsDuration(0L);

        // Adding the description
        setAttributeValue(row, matchingInjectImporter, "description", inject::setDescription);

        // Adding the title
        setAttributeValue(row, matchingInjectImporter, "title", inject::setTitle);

        // Adding the trigger time
        RuleAttribute triggerTimeRuleAttribute = matchingInjectImporter.getRuleAttributes().stream()
            .filter(ruleAttribute -> ruleAttribute.getName().equals("trigger_time"))
            .findFirst().orElseGet(() -> {
                RuleAttribute ruleAttributeDefault = new RuleAttribute();
                ruleAttributeDefault.setAdditionalConfig(
                        Map.of("timePattern", "")
                );
                return ruleAttributeDefault;
            });

        String timePattern = triggerTimeRuleAttribute.getAdditionalConfig()
            .get("timePattern");
        String dateAsString = Strings.EMPTY;
        if(triggerTimeRuleAttribute.getColumns() != null) {
            dateAsString = Arrays.stream(triggerTimeRuleAttribute.getColumns().split("\\+"))
                    .map(column -> getDateAsStringFromCell(row, column, timePattern))
                    .collect(Collectors.joining());
        }
        if (dateAsString.isBlank()) {
            dateAsString = triggerTimeRuleAttribute.getDefaultValue();
        }

        Matcher relativeDayMatcher = relativeDayPattern.matcher(dateAsString);
        Matcher relativeHourMatcher = relativeHourPattern.matcher(dateAsString);
        Matcher relativeMinuteMatcher = relativeMinutePattern.matcher(dateAsString);


        boolean relativeDays = relativeDayMatcher.matches();
        boolean relativeHour = relativeHourMatcher.matches();
        boolean relativeMinute = relativeMinuteMatcher.matches();

        InjectTime injectTime = new InjectTime();
        injectTime.setUnformattedDate(dateAsString);
        injectTime.setLinkedInject(inject);

        Temporal dateTime = getInjectDate(injectTime, timePattern);

        if (dateTime == null) {
            injectTime.setRelativeDay(relativeDays);
            if(relativeDays && relativeDayMatcher.groupCount() > 0 && !relativeDayMatcher.group(1).isBlank()) {
                injectTime.setRelativeDayNumber(Integer.parseInt(relativeDayMatcher.group(1)));
            }
            injectTime.setRelativeHour(relativeHour);
            if(relativeHour && relativeHourMatcher.groupCount() > 0 && !relativeHourMatcher.group(1).isBlank()) {
                injectTime.setRelativeHourNumber(Integer.parseInt(relativeHourMatcher.group(1)));
            }
            injectTime.setRelativeMinute(relativeMinute);
            if(relativeMinute && relativeMinuteMatcher.groupCount() > 0 && !relativeMinuteMatcher.group(1).isBlank()) {
                injectTime.setRelativeMinuteNumber(Integer.parseInt(relativeMinuteMatcher.group(1)));
            }

            // Special case : a mix of relative day and absolute hour
            if(relativeDays && relativeDayMatcher.groupCount() > 1 && !relativeDayMatcher.group(2).isBlank()) {
                Temporal date = null;
                try {
                    date = LocalTime.parse(relativeDayMatcher.group(2).trim(), injectTime.getFormatter());
                } catch (DateTimeParseException firstException) {
                    try {
                        date = LocalTime.parse(relativeDayMatcher.group(2).trim(), DateTimeFormatter.ISO_TIME);
                    } catch (DateTimeParseException exception) {
                        // This is a "probably" a relative date
                    }
                }
                if(date != null) {
                    if(scenario.getRecurrenceStart() != null) {
                        injectTime.setDate(
                            scenario.getRecurrenceStart()
                                .atZone(timezoneOffset).toLocalDateTime()
                                .withHour(date.get(ChronoField.HOUR_OF_DAY))
                                .withMinute(date.get(ChronoField.MINUTE_OF_HOUR))
                                .toInstant(timezoneOffset)
                        );
                    } else {
                        importTestSummary.getImportMessages().add(
                            new ImportMessage(ImportMessage.MessageLevel.CRITICAL,
                                ImportMessage.ErrorCode.ABSOLUTE_TIME_WITHOUT_START_DATE,
                                Map.of("column_type_num", importMapper.getInjectTypeColumn(),
                                        "row_num", String.valueOf(row.getRowNum()))
                            )
                        );
                    }
                }
            }
        }
        injectTime.setSpecifyDays(relativeDays || injectTime.getFormatter().equals(DateTimeFormatter.ISO_DATE_TIME));

        // We get the absolute dates available on our first pass
        if(!injectTime.isRelativeDay() && !injectTime.isRelativeHour() && !injectTime.isRelativeMinute() && dateTime != null) {
            if (dateTime instanceof LocalDateTime) {
                Instant injectDate = Instant.ofEpochSecond(
                        ((LocalDateTime)dateTime).toEpochSecond(timezoneOffset));
                injectTime.setDate(injectDate);
            } else if (dateTime instanceof LocalTime) {
                if(scenario.getRecurrenceStart() != null) {
                    injectTime.setDate(scenario.getRecurrenceStart()
                            .atZone(timezoneOffset)
                            .withHour(((LocalTime) dateTime).getHour())
                            .withMinute(((LocalTime) dateTime).getMinute())
                            .toInstant());
                } else {
                    importTestSummary.getImportMessages().add(
                        new ImportMessage(ImportMessage.MessageLevel.CRITICAL,
                            ImportMessage.ErrorCode.ABSOLUTE_TIME_WITHOUT_START_DATE,
                            Map.of("column_type_num", importMapper.getInjectTypeColumn(),
                                    "row_num", String.valueOf(row.getRowNum()))
                        )
                    );
                    return importTestSummary;
                }
            }
        }

        // Initializing the content with a root node
        ObjectMapper mapper = new ObjectMapper();
        inject.setContent(mapper.createObjectNode());

        // Once it's done, we set the injectorContract
        inject.setInjectorContract(injectorContract);

        // So far, we only support one expectation
        AtomicReference<InjectExpectation> expectation = new AtomicReference<>();

        // For each rule attributes of the importer
        matchingInjectImporter.getRuleAttributes().forEach(ruleAttribute -> {
            importTestSummary.getImportMessages().addAll(
                    addFields(inject, ruleAttribute,
                            row, mapTeamByName, expectation, importMapper));
        });
        // This is by default at false
        inject.setAllTeams(false);
        // The user is the one doing the import
        inject.setUser(userRepository.findById(currentUser().getId()).orElseThrow());
        // No exercise yet
        inject.setExercise(null);
        // No dependencies
        inject.setDependsOn(null);

        if(expectation.get() != null) {
            // We set the expectation
            ArrayNode expectationsNode = mapper.createArrayNode();
            ObjectNode expectationNode = mapper.createObjectNode();
            expectationNode.put("expectation_description", expectation.get().getDescription());
            expectationNode.put("expectation_name", expectation.get().getName());
            expectationNode.put("expectation_score", expectation.get().getExpectedScore());
            expectationNode.put("expectation_type", expectation.get().getType().name());
            expectationNode.put("expectation_expectation_group", false);
            expectationsNode.add(expectationNode);
            inject.getContent().set("expectations", expectationsNode);
        }

        // We set the scenario
        inject.setScenario(scenario);

        importTestSummary.setInject(inject);
        importTestSummary.setInjectTime(injectTime);
        return importTestSummary;
    }

    private void setAttributeValue(Row row, InjectImporter matchingInjectImporter, String attributeName, Consumer<String> setter) {
        RuleAttribute ruleAttribute = matchingInjectImporter.getRuleAttributes().stream()
                .filter(attr -> attr.getName().equals(attributeName))
                .findFirst()
                .orElseThrow(ElementNotFoundException::new);

        if(ruleAttribute.getColumns() != null) {
            int colIndex = CellReference.convertColStringToIndex(ruleAttribute.getColumns());
            if(colIndex == -1) return;
            Cell valueCell = row.getCell(colIndex);

            if (valueCell == null) {
                setter.accept(ruleAttribute.getDefaultValue());
            } else {
                String cellValue = getValueAsString(row, ruleAttribute.getColumns());
                setter.accept(cellValue.isBlank() ? ruleAttribute.getDefaultValue() : cellValue);
            }
        }

    }

    private List<ImportMessage> addFields(Inject inject, RuleAttribute ruleAttribute,
                                          Row row, Map<String, Team> mapTeamByName,
                                          AtomicReference<InjectExpectation> expectation,
                                          ImportMapper importMapper) {
        // If it's a reserved field, it's already taken care of
        if(importReservedField.contains(ruleAttribute.getName())) {
            return Collections.emptyList();
        }

        // For ease of use, we create a map of the available keys for the injector
        Map<String, JsonNode> mapFieldByKey =
                StreamSupport.stream((Objects.requireNonNull(inject.getInjectorContract().map(injectorContract -> injectorContract.getConvertedContent().get("fields").spliterator()).orElse(null))), false)
                        .collect(Collectors.toMap(jsonNode -> jsonNode.get("key").asText(), Function.identity()));

        // Otherwise, the default type is text, but it can be overriden
        String type = "text";
        if (mapFieldByKey.get(ruleAttribute.getName()) != null) {
            type = mapFieldByKey.get(ruleAttribute.getName()).get("type").asText();
        } else if(ruleAttribute.getName().startsWith("expectation")) {
            type = "expectation";
        }
        switch (type) {
            case "text":
            case "textarea":
                // If text, we get the columns, split by "+" if there is a concatenation of columns
                // and then joins the result of the cells
                String columnValue = Strings.EMPTY;
                if(ruleAttribute.getColumns() != null) {
                    columnValue = Arrays.stream(ruleAttribute.getColumns().split("\\+"))
                            .map(column -> getValueAsString(row, column))
                            .collect(Collectors.joining());
                }
                if (columnValue.isBlank()) {
                    inject.getContent().put(ruleAttribute.getDefaultValue(), columnValue);
                } else {
                    inject.getContent().put(ruleAttribute.getName(), columnValue);
                }
                break;
            case "team":
                // If the rule type is on a team field, we split by "+" if there is a concatenation of columns
                // and then joins the result, split again by "," and use the list of results to get the teams by their name

                List<String> columnValues = new ArrayList<>();
                if(ruleAttribute.getColumns() != null) {
                    columnValues = Arrays.stream(Arrays.stream(ruleAttribute.getColumns().split("\\+"))
                                    .map(column -> getValueAsString(row, column))
                                    .collect(Collectors.joining(","))
                                    .split(","))
                            .toList();
                }
                if (columnValues.isEmpty() || columnValues.stream().allMatch(String::isEmpty)) {
                    List<String> defaultValues = Arrays.stream(ruleAttribute.getDefaultValue().split(",")).toList();
                    inject.getTeams().addAll(mapTeamByName.entrySet().stream()
                            .filter(nameTeamEntry -> defaultValues.contains(nameTeamEntry.getKey()))
                            .map(Map.Entry::getValue)
                            .toList()
                    );
                } else {
                    List<ImportMessage> importMessages = new ArrayList<>();
                    columnValues.forEach(teamName -> {
                        if(mapTeamByName.containsKey(teamName)) {
                            inject.getTeams().add(mapTeamByName.get(teamName));
                        } else {
                            // The team does not exist, we create a new one
                            Team team = new Team();
                            team.setName(teamName);
                            team.setContextual(true);
                            teamRepository.save(team);
                            mapTeamByName.put(team.getName(), team);
                            inject.getTeams().add(team);

                            // We aldo add a message so the user knows there was a new team created
                            importMessages.add(new ImportMessage(ImportMessage.MessageLevel.WARN,
                                    ImportMessage.ErrorCode.NO_TEAM_FOUND,
                                    Map.of("column_type_num", importMapper.getInjectTypeColumn(),
                                            "row_num", String.valueOf(row.getRowNum()),
                                            "team_name", teamName)
                            ));
                        }
                    });
                    if(!importMessages.isEmpty()) {
                        return importMessages;
                    }
                }
                break;
            case "expectation":
                // If the rule type is of an expectation,
                if (expectation.get() == null) {
                    expectation.set(new InjectExpectation());
                    expectation.get().setType(InjectExpectation.EXPECTATION_TYPE.MANUAL);
                }
                if (ruleAttribute.getName().contains("_")) {
                    if("score".equals(ruleAttribute.getName().split("_")[1])) {
                        if(ruleAttribute.getColumns() != null) {
                            List<String> columns = Arrays.stream(ruleAttribute.getColumns().split("\\+"))
                                    .filter(column -> column != null && !column.isBlank()).toList();
                            if(!columns.isEmpty() && columns.stream().allMatch(column ->
                                    row.getCell(CellReference.convertColStringToIndex(column)).getCellType()== CellType.NUMERIC)) {
                                Double columnValueExpectation = columns.stream()
                                        .map(column -> getValueAsDouble(row, column))
                                        .reduce(0.0, Double::sum);
                                expectation.get().setExpectedScore(columnValueExpectation.intValue());
                            } else {
                                try {
                                    expectation.get().setExpectedScore(Integer.parseInt(ruleAttribute.getDefaultValue()));
                                } catch (NumberFormatException exception) {
                                    List<ImportMessage> importMessages = new ArrayList<>();
                                    importMessages.add(new ImportMessage(ImportMessage.MessageLevel.WARN,
                                            ImportMessage.ErrorCode.EXPECTATION_SCORE_UNDEFINED,
                                            Map.of("column_type_num", String.join(", ", columns),
                                                    "row_num", String.valueOf(row.getRowNum()))
                                    ));
                                    return importMessages;
                                }
                            }
                        } else {
                            expectation.get().setExpectedScore(Integer.parseInt(ruleAttribute.getDefaultValue()));
                        }
                    } else if ("name".equals(ruleAttribute.getName().split("_")[1])) {
                        if(ruleAttribute.getColumns() != null) {
                            String columnValueExpectation = Arrays.stream(ruleAttribute.getColumns().split("\\+"))
                                    .map(column -> getValueAsString(row, column))
                                    .collect(Collectors.joining());
                            expectation.get().setName(columnValueExpectation.isBlank() ? ruleAttribute.getDefaultValue() : columnValueExpectation);
                        } else {
                            expectation.get().setName(ruleAttribute.getDefaultValue());
                        }
                    } else if ("description".equals(ruleAttribute.getName().split("_")[1])) {
                        if(ruleAttribute.getColumns() != null) {
                            String columnValueExpectation = Arrays.stream(ruleAttribute.getColumns().split("\\+"))
                                    .map(column -> getValueAsString(row, column))
                                    .collect(Collectors.joining());
                            expectation.get().setDescription(columnValueExpectation.isBlank() ? ruleAttribute.getDefaultValue() : columnValueExpectation);
                        } else {
                            expectation.get().setDescription(ruleAttribute.getDefaultValue());
                        }
                    }
                }

                break;
            default:
                throw new UnsupportedOperationException();
        }
        return Collections.emptyList();
    }

    private Temporal getInjectDate(InjectTime injectTime, String timePattern) {
        DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ISO_DATE_TIME;
        if(timePattern != null && !timePattern.isEmpty()) {
            dateTimeFormatter = DateTimeFormatter.ofPattern(timePattern);
            try {
                return LocalDateTime.parse(injectTime.getUnformattedDate(), dateTimeFormatter);
            } catch (DateTimeParseException firstException) {
                try {
                    return LocalTime.parse(injectTime.getUnformattedDate(), dateTimeFormatter);
                } catch (DateTimeParseException exception) {
                    // This is a "probably" a relative date
                }
            }
        } else {
            try {
                return LocalDateTime.parse(injectTime.getUnformattedDate(), dateTimeFormatter);
            } catch (DateTimeParseException firstException) {
                // The date is not in ISO_DATE_TIME. Trying just the ISO_TIME
                dateTimeFormatter = DateTimeFormatter.ISO_TIME;
                try {
                    return LocalDateTime.parse(injectTime.getUnformattedDate(), dateTimeFormatter);
                } catch (DateTimeParseException secondException) {
                    // Neither ISO_DATE_TIME nor ISO_TIME
                }
            }
        }
        injectTime.setFormatter(dateTimeFormatter);
        return null;
    }

    private List<ImportMessage> updateInjectDates(Map<Integer, InjectTime> mapInstantByRowIndex) {
        List<ImportMessage> importMessages = new ArrayList<>();
        // First of all, are there any absolute date
        boolean allDatesAreAbsolute = mapInstantByRowIndex.values().stream().noneMatch(
                injectTime -> injectTime.getDate() == null || injectTime.isRelativeDay() || injectTime.isRelativeHour() || injectTime.isRelativeMinute()
        );
        boolean allDatesAreRelative = mapInstantByRowIndex.values().stream().allMatch(
                injectTime -> injectTime.getDate() == null && (injectTime.isRelativeDay() || injectTime.isRelativeHour() || injectTime.isRelativeMinute())
        );

        if(allDatesAreAbsolute) {
            processDateToAbsolute(mapInstantByRowIndex);
        } else if (allDatesAreRelative) {
            // All is relative and we just need to set depends relative to each others
            // First of all, we find the minimal relative number of days and hour
            int earliestDay = mapInstantByRowIndex.values().stream()
                .min(Comparator.comparing(InjectTime::getRelativeDayNumber))
                .map(InjectTime::getRelativeDayNumber).orElse(0);
            int earliestHourOfThatDay = mapInstantByRowIndex.values().stream()
                .filter(injectTime -> injectTime.getRelativeDayNumber() == earliestDay)
                .min(Comparator.comparing(InjectTime::getRelativeHourNumber))
                .map(InjectTime::getRelativeHourNumber).orElse(0);
            int earliestMinuteOfThatHour = mapInstantByRowIndex.values().stream()
                    .filter(injectTime -> injectTime.getRelativeDayNumber() == earliestDay
                            && injectTime.getRelativeHourNumber() == earliestHourOfThatDay)
                    .min(Comparator.comparing(InjectTime::getRelativeMinuteNumber))
                    .map(InjectTime::getRelativeMinuteNumber).orElse(0);
            long offsetAsMinutes = (((earliestDay * 24L) + earliestHourOfThatDay) * 60 + earliestMinuteOfThatHour) * -1;
            mapInstantByRowIndex.values().stream()
                .filter(injectTime -> injectTime.getDate() == null && (injectTime.isRelativeDay() || injectTime.isRelativeHour() || injectTime.isRelativeMinute()))
                .forEach(injectTime -> {
                    long injectTimeAsMinutes =
                        (((injectTime.getRelativeDayNumber() * 24L) + injectTime.getRelativeHourNumber()) * 60)
                            + injectTime.getRelativeMinuteNumber() + offsetAsMinutes;
                    injectTime.getLinkedInject().setDependsDuration(injectTimeAsMinutes * 60);
                });
        } else {
            // Worst case scenario : there is a mix of relative and absolute dates
            // We will need to resolve this row by row in the order they are in the import file
            Optional<Map.Entry<Integer, InjectTime>> sortedInstantMap =
                mapInstantByRowIndex.entrySet().stream().min(Map.Entry.comparingByKey());
            int firstRow;
            if(sortedInstantMap.isPresent()) {
                firstRow = sortedInstantMap.get().getKey();
            } else {
                firstRow = 0;
            }
            mapInstantByRowIndex.entrySet().stream().sorted(Map.Entry.comparingByKey()).forEachOrdered(
                integerInjectTimeEntry -> {
                    InjectTime injectTime = integerInjectTimeEntry.getValue();

                    if(injectTime.getDate() != null) {
                        // Special case : we have an absolute time but a relative day
                        if(injectTime.isRelativeDay()) {
                            injectTime.setDate(injectTime.getDate().plus(injectTime.getRelativeDayNumber(), ChronoUnit.DAYS));
                        }
                        // Great, we already have an absolute date for this one
                        // If we are the first, good, nothing more to do
                        // Otherwise, we need to get the date of the first row to set the depends on
                        if(integerInjectTimeEntry.getKey() != firstRow) {
                            Instant firstDate = mapInstantByRowIndex.get(firstRow).getDate();
                            injectTime.getLinkedInject().setDependsDuration(injectTime.getDate().getEpochSecond() - firstDate.getEpochSecond());
                        }
                    } else {
                        // We don't have an absolute date so we need to deduce it from another row
                        if(injectTime.getRelativeDayNumber() < 0
                                || (injectTime.getRelativeDayNumber() == 0 && injectTime.getRelativeHourNumber() < 0)
                                || (injectTime.getRelativeDayNumber() == 0 && injectTime.getRelativeHourNumber() == 0 && injectTime.getRelativeMinuteNumber() < 0)) {
                            // We are in the past, so we need to explore the future to find the next absolute date
                            Optional<Map.Entry<Integer, InjectTime>> firstFutureWithAbsolute =
                                mapInstantByRowIndex.entrySet().stream()
                                    .sorted(Map.Entry.comparingByKey())
                                    .filter(entry -> entry.getKey() > integerInjectTimeEntry.getKey()
                                            && entry.getValue().getDate() != null)
                                    .findFirst();
                            if(firstFutureWithAbsolute.isPresent()) {
                                injectTime.setDate(firstFutureWithAbsolute.get().getValue()
                                    .getDate()
                                    .plus(injectTime.getRelativeDayNumber(), ChronoUnit.DAYS)
                                    .plus(injectTime.getRelativeHourNumber(), ChronoUnit.HOURS)
                                    .plus(injectTime.getRelativeMinuteNumber(), ChronoUnit.MINUTES)
                                );
                            } else {
                                importMessages.add(new ImportMessage(ImportMessage.MessageLevel.ERROR,
                                                ImportMessage.ErrorCode.DATE_SET_IN_PAST,
                                                Map.of("row_num", String.valueOf(integerInjectTimeEntry.getKey()))));
                            }
                        } else {
                            // We are in the future, so we need to explore the past to find an absolute date
                            Optional<Map.Entry<Integer, InjectTime>> firstPastWithAbsolute =
                                mapInstantByRowIndex.entrySet().stream()
                                    .sorted(Map.Entry.comparingByKey())
                                    .filter(entry -> entry.getKey() < integerInjectTimeEntry.getKey()
                                            && entry.getValue().getDate() != null)
                                    .min(Map.Entry.comparingByKey(Comparator.reverseOrder()));
                            if(firstPastWithAbsolute.isPresent()) {
                                injectTime.setDate(firstPastWithAbsolute.get().getValue()
                                    .getDate()
                                    .plus(injectTime.getRelativeDayNumber(), ChronoUnit.DAYS)
                                    .plus(injectTime.getRelativeHourNumber(), ChronoUnit.HOURS)
                                    .plus(injectTime.getRelativeMinuteNumber(), ChronoUnit.MINUTES)
                                );
                            } else {
                                importMessages.add(new ImportMessage(ImportMessage.MessageLevel.ERROR,
                                        ImportMessage.ErrorCode.DATE_SET_IN_FUTURE,
                                        Map.of("row_num", String.valueOf(integerInjectTimeEntry.getKey()))));
                            }
                        }
                    }
                }
            );

            processDateToAbsolute(mapInstantByRowIndex);
        }

        return importMessages;
    }

    private void processDateToAbsolute(Map<Integer, InjectTime> mapInstantByRowIndex) {
        Optional<Instant> earliestAbsoluteDate = mapInstantByRowIndex.values().stream()
                .map(InjectTime::getDate)
                .filter(Objects::nonNull)
                .min(Comparator.naturalOrder());

        // If we have an earliest date, we calculate the dates depending on the earliest one
        earliestAbsoluteDate.ifPresent(
                earliestInstant -> mapInstantByRowIndex.values().stream().filter(injectTime -> injectTime.getDate() != null)
                        .forEach(injectTime -> {
                            injectTime.getLinkedInject().setDependsDuration(injectTime.getDate().getEpochSecond() - earliestInstant.getEpochSecond());
                        })
        );
    }

    private String getDateAsStringFromCell(Row row, String cellColumn, String timePattern) {
        if(cellColumn != null && !cellColumn.isBlank()
                && row.getCell(CellReference.convertColStringToIndex(cellColumn)) != null) {
            Cell cell = row.getCell(CellReference.convertColStringToIndex(cellColumn));
            if(cell.getCellType() == CellType.STRING) {
                return cell.getStringCellValue();
            } else if(cell.getCellType() == CellType.NUMERIC) {
                if(timePattern == null || timePattern.isEmpty()) {
                    return cell.getDateCellValue().toString();
                } else {
                    return DateFormatUtils.format(cell.getDateCellValue(), timePattern);
                }
            }
        }
        return "";
    }

    private String getValueAsString(Row row, String cellColumn) {
        if(cellColumn != null && !cellColumn.isBlank()
                && row.getCell(CellReference.convertColStringToIndex(cellColumn)) != null) {
            Cell cell = row.getCell(CellReference.convertColStringToIndex(cellColumn));
            if(cell.getCellType() == CellType.STRING) {
                return cell.getStringCellValue();
            } else if(cell.getCellType() == CellType.NUMERIC) {
                return Double.valueOf(cell.getNumericCellValue()).toString();
            }
        }
        return "";
    }

    private Double getValueAsDouble(Row row, String cellColumn) {
        if(cellColumn != null && !cellColumn.isBlank()
                && row.getCell(CellReference.convertColStringToIndex(cellColumn)) != null) {
            Cell cell = row.getCell(CellReference.convertColStringToIndex(cellColumn));
            if(cell.getCellType() == CellType.STRING) {
                return Double.valueOf(cell.getStringCellValue());
            } else if(cell.getCellType() == CellType.NUMERIC) {
                return cell.getNumericCellValue();
            }
        }
        return 0.0;
    }

  // -- TEST --

  private Map<String, RawInjectExpectation> mapOfInjectsExpectations(@NotNull final List<RawInject> rawInjects) {
    return this.injectExpectationRepository
        .rawByIds(
            rawInjects.stream().flatMap(rawInject -> rawInject.getInject_expectations().stream()).toList()
        )
        .stream()
        .collect(Collectors.toMap(RawInjectExpectation::getInject_expectation_id, Function.identity()));
  }

  private Map<String, RawAssetGroup> mapOfAssetGroups(
      @NotNull final List<RawInject> rawInjects,
      @NotNull final Collection<RawInjectExpectation> rawInjectExpectations) {
    return this.assetGroupRepository
        .rawAssetGroupByIds(
            Stream.concat(
                    rawInjectExpectations.stream()
                        .map(RawInjectExpectation::getAsset_group_id)
                        .filter(Objects::nonNull),
                    rawInjects.stream()
                        .map(RawInject::getAsset_group_id)
                        .filter(Objects::nonNull))
                .toList())
        .stream()
        .collect(Collectors.toMap(RawAssetGroup::getAsset_group_id, Function.identity()));
  }

  private Map<String, RawAsset> mapOfAssets(
      @NotNull final List<RawInject> rawInjects,
      @NotNull final Map<String, RawInjectExpectation> mapOfInjectsExpectations,
      @NotNull final Map<String, RawAssetGroup> mapOfAssetGroups) {
    return this.assetRepository
        .rawByIds(rawInjects.stream().flatMap(rawInject -> Stream.concat(Stream.concat(
                rawInject.getInject_asset_groups().stream()
                    .flatMap(assetGroup -> Optional.ofNullable(mapOfAssetGroups.get(assetGroup))
                        .map(ag -> ag.getAsset_ids().stream())
                        .orElse(Stream.empty())),
            rawInject.getInject_assets().stream()
            ), Stream.concat(
                rawInject.getInject_expectations().stream()
                    .map(mapOfInjectsExpectations::get)
                    .map(RawInjectExpectation::getAsset_id),
                rawInject.getInject_expectations().stream()
                    .map(mapOfInjectsExpectations::get)
                    .flatMap(injectExpectation -> injectExpectation.getAsset_group_id() != null ? mapOfAssetGroups.get(injectExpectation.getAsset_group_id()).getAsset_ids().stream() : Stream.empty()))
        )).filter(Objects::nonNull).toList()).stream()
        .collect(Collectors.toMap(RawAsset::getAsset_id, Function.identity()));
  }

  private Map<String, RawTeam> mapOfRawTeams(
      @NotNull final List<RawInject> rawInjects,
      @NotNull final Map<String, RawInjectExpectation> mapOfInjectsExpectations) {
    return this.teamRepository.rawTeamByIds(rawInjects.stream()
        .flatMap(
            rawInject -> Stream.concat(
                rawInject.getInject_teams().stream(),
                rawInject.getInject_expectations().stream().map(expectationId -> mapOfInjectsExpectations.get(expectationId).getTeam_id())
            ).filter(Objects::nonNull)
        ).distinct().toList()).stream().collect(Collectors.toMap(RawTeam::getTeam_id, Function.identity()));
  }

    // -- CRITERIA BUILDER --

    private void selectForInject(CriteriaBuilder cb, CriteriaQuery<Tuple> cq, Root<Inject> injectRoot) {
        // Joins
        Join<Inject, Exercise> injectExerciseJoin = createLeftJoin(injectRoot, "exercise");
        Join<Inject, Scenario> injectScenarioJoin = createLeftJoin(injectRoot, "scenario");
        Join<Inject, InjectorContract> injectorContractJoin = createLeftJoin(injectRoot, "injectorContract");
        Join<InjectorContract, Injector> injectorJoin = injectorContractJoin.join("injector", JoinType.LEFT);
        Join<Inject, Inject> injectDependsJoin = createLeftJoin(injectRoot, "dependsOn");
        // Array aggregations
        Expression<String[]> tagIdsExpression = createJoinArrayAggOnId(cb, injectRoot, "tags");
        Expression<String[]> teamIdsExpression = createJoinArrayAggOnId(cb, injectRoot, "teams");
        Expression<String[]> assetIdsExpression = createJoinArrayAggOnId(cb, injectRoot, "assets");
        Expression<String[]> assetGroupIdsExpression = createJoinArrayAggOnId(cb, injectRoot, "assetGroups");

        // SELECT
        cq.multiselect(
                injectRoot.get("id").alias("inject_id"),
                injectRoot.get("title").alias("inject_title"),
                injectRoot.get("enabled").alias("inject_enabled"),
                injectRoot.get("content").alias("inject_content"),
                injectRoot.get("allTeams").alias("inject_all_teams"),
                injectExerciseJoin.get("id").alias("inject_exercise"),
                injectScenarioJoin.get("id").alias("inject_scenario"),
                injectRoot.get("dependsDuration").alias("inject_depends_duration"),
                injectDependsJoin.get("id").alias("inject_depends_from_another"),
                injectorContractJoin.alias("inject_injector_contract"),
                tagIdsExpression.alias("inject_tags"),
                teamIdsExpression.alias("inject_teams"),
                assetIdsExpression.alias("inject_assets"),
                assetGroupIdsExpression.alias("inject_asset_groups"),
                injectorJoin.get("type").alias("inject_type")
        ).distinct(true);

        // GROUP BY
        cq.groupBy(Arrays.asList(
                injectRoot.get("id"),
                injectExerciseJoin.get("id"),
                injectScenarioJoin.get("id"),
                injectorContractJoin.get("id"),
                injectorJoin.get("id")
        ));
    }

    private List<InjectOutput> execInject(TypedQuery<Tuple> query) {
        return query.getResultList()
                .stream()
                .map(tuple -> new InjectOutput(
                        tuple.get("inject_id", String.class),
                        tuple.get("inject_title", String.class),
                        tuple.get("inject_enabled", Boolean.class),
                        tuple.get("inject_content", ObjectNode.class),
                        tuple.get("inject_all_teams", Boolean.class),
                        tuple.get("inject_exercise", String.class),
                        tuple.get("inject_scenario", String.class),
                        tuple.get("inject_depends_duration", Long.class),
                        tuple.get("inject_depends_from_another", String.class),
                        tuple.get("inject_injector_contract", InjectorContract.class),
                        tuple.get("inject_tags", String[].class),
                        tuple.get("inject_teams", String[].class),
                        tuple.get("inject_assets", String[].class),
                        tuple.get("inject_asset_groups", String[].class),
                        tuple.get("inject_type", String.class)
                ))
                .toList();
    }

}
