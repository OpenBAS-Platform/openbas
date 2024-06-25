package io.openbas.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.openbas.database.model.*;
import io.openbas.database.raw.*;
import io.openbas.database.repository.*;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.inject.form.InjectUpdateStatusInput;
import io.openbas.rest.inject.output.InjectOutput;
import io.openbas.rest.scenario.form.InjectsImportInput;
import io.openbas.rest.scenario.response.ImportMessage;
import io.openbas.rest.scenario.response.ImportTestSummary;
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
import org.apache.commons.lang3.StringUtils;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellReference;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.function.Function;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import java.util.stream.StreamSupport;

import static io.openbas.config.SessionHelper.currentUser;
import static io.openbas.utils.JpaUtils.arrayAgg;
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
    private final TeamRepository teamRepository;
    private final UserRepository userRepository;

    private List<String> importReservedField = List.of("description", "title", "trigger_time");

    @Resource
    protected ObjectMapper mapper;
    @PersistenceContext
    private EntityManager entityManager;

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

    public List<InjectOutput> injects(Specification<Inject> specification) {
        CriteriaBuilder cb = this.entityManager.getCriteriaBuilder();

        // -- Create Query --
        CriteriaQuery<Tuple> cq = cb.createTupleQuery();
        Root<Inject> injectRoot = cq.from(Inject.class);

        // Joins
        Join<Inject, Exercise> injectExerciseJoin = createLeftJoin(injectRoot, "exercise");
        Join<Inject, Scenario> injectScenarioJoin = createLeftJoin(injectRoot, "scenario");
        Join<Inject, InjectorContract> injectorContractJoin = createLeftJoin(injectRoot, "injectorContract");
        Join<InjectorContract, Injector> injectorJoin = injectorContractJoin.join("injector", JoinType.LEFT);
        Expression<String[]> tagIdsExpression = createArrayAgg(cb, injectRoot, "tags");
        Expression<String[]> teamIdsExpression = createArrayAgg(cb, injectRoot, "teams");
        Expression<String[]> assetIdsExpression = createArrayAgg(cb, injectRoot, "assets");
        Expression<String[]> assetGroupIdsExpression = createArrayAgg(cb, injectRoot, "assetGroups");

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
                injectorContractJoin.alias("inject_injector_contract"),
                tagIdsExpression.alias("inject_tags"),
                teamIdsExpression.alias("inject_teams"),
                assetIdsExpression.alias("inject_assets"),
                assetGroupIdsExpression.alias("inject_asset_groups"),
                injectorJoin.get("type").alias("inject_type")
        ).distinct(true);

        // Group By
        cq.groupBy(Arrays.asList(
                injectRoot.get("id"),
                injectorContractJoin.get("id"),
                injectorJoin.get("id"),
                injectExerciseJoin.get("id"),
                injectScenarioJoin.get("id")
        ));

        // Sort
        cq.orderBy(cb.asc(injectRoot.get("dependsDuration")));

        // -- Specification --
        if (specification != null) {
            Predicate predicate = specification.toPredicate(injectRoot, cq, cb);
            if (predicate != null) {
                cq.where(predicate);
            }
        }

        // Type Query
        TypedQuery<Tuple> query = this.entityManager.createQuery(cq);

        // -- EXECUTION --
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
                        tuple.get("inject_injector_contract", InjectorContract.class),
                        tuple.get("inject_tags", String[].class),
                        tuple.get("inject_teams", String[].class),
                        tuple.get("inject_assets", String[].class),
                        tuple.get("inject_asset_groups", String[].class),
                        tuple.get("inject_type", String.class)
                ))
                .toList();
    }

    public ImportTestSummary importXls(Scenario scenario, ImportMapper importMapper, InjectsImportInput input) {
        ImportTestSummary importTestSummary = new ImportTestSummary();

        try {
            // We open the previously saved file
            String tmpdir = System.getProperty("java.io.tmpdir");
            Optional<java.nio.file.Path> file = Files.list(Path.of(tmpdir, "\\", input.getImportMapperId(), "\\")).findFirst();

            // If the file do exist
            if (file.isPresent()) {
                // We open the file and convert it to an apache POI object
                InputStream xlsFile = Files.newInputStream(file.get());
                Workbook workbook = WorkbookFactory.create(xlsFile);
                Sheet selectedSheet = workbook.getSheet(input.getName());

                // For performance reasons, we compile the pattern of the Inject Importers only once
                Map<String, Pattern> mapPatternByInjectImport = importMapper
                        .getInjectImporters().stream().collect(
                                Collectors.toMap(InjectImporter::getId,
                                        injectImporter -> Pattern.compile(injectImporter.getImportTypeValue())
                                ));

                // We also get the list of teams into a map to be able to get them easily later on
                Map<String, Team> mapTeamByName =
                        StreamSupport.stream(teamRepository.findAll().spliterator(), false)
                                .collect(Collectors.toMap(Team::getName, Function.identity()));

                // The column that differenciate the importer is the same for all so we get it right now
                int colTypeIdx = CellReference.convertColStringToIndex(importMapper.getInjectTypeColumn());

                boolean isScheduled = scenario.getRecurrenceStart() != null;
                var wrapper = new Object(){ Instant earliestAbsoluteDate = null; };

                // For each rows of the selected sheet
                selectedSheet.rowIterator().forEachRemaining(row -> {
                    //If the row is completely empty, we ignore it altogether and do not send a warn message
                    if (checkIfRowIsEmpty(row)) {
                        return;
                    }

                    // First of all, we get the value of the differenciation cell
                    Cell typeCell = row.getCell(colTypeIdx);
                    if (typeCell == null) {
                        // If there are no values, we add an info message so they now there is a potential issue here
                        importTestSummary.getImportMessage().add(
                                new ImportMessage(ImportMessage.MessageLevel.INFO,
                                        "Did not find a potential match for column %s of row %s".formatted(
                                                importMapper.getInjectTypeColumn(), row.getRowNum()
                                        )
                                )
                        );
                        return;
                    }

                    // We find the matching importers on the inject
                    List<InjectImporter> matchingInjectImporters = importMapper.getInjectImporters().stream()
                            .filter(injectImporter -> {
                                Matcher matcher = mapPatternByInjectImport.get(injectImporter.getId()).matcher(typeCell.getStringCellValue());
                                return matcher.matches();
                            }).toList();

                    // If there are no match, we add a message for the user and we go to the next row
                    if (matchingInjectImporters.isEmpty()) {
                        importTestSummary.getImportMessage().add(
                                new ImportMessage(ImportMessage.MessageLevel.INFO,
                                        "Did not find a potential match for column %s of row %s".formatted(
                                                importMapper.getInjectTypeColumn(), row.getRowNum()
                                        )
                                )
                        );
                        return;
                    }

                    // If there are more than one match, we add a message for the user and use the first match
                    if (matchingInjectImporters.size() > 1) {
                        String listMatchers = matchingInjectImporters.stream().map(InjectImporter::getImportTypeValue).collect(Collectors.joining(", "));
                        importTestSummary.getImportMessage().add(
                                new ImportMessage(ImportMessage.MessageLevel.WARN,
                                        "They were several potential matches for column %s of row %s : %s".formatted(
                                                importMapper.getInjectTypeColumn(), row.getRowNum(), listMatchers
                                        )
                                )
                        );
                    }

                    InjectImporter matchingInjectImporter = matchingInjectImporters.get(0);
                    InjectorContract injectorContract = matchingInjectImporter.getInjectorContract();

                    // Creating the inject
                    Inject inject = new Inject();

                    // Adding the description
                    RuleAttribute descriptionRuleAttribute = matchingInjectImporter.getRuleAttributes().stream()
                            .filter(ruleAttribute -> ruleAttribute.getName().equals("description"))
                            .findFirst()
                            .orElseThrow(ElementNotFoundException::new);
                    int descriptionCol = CellReference.convertColStringToIndex(descriptionRuleAttribute.getColumns());
                    inject.setDescription(row.getCell(descriptionCol).getStringCellValue());

                    // Adding the title
                    RuleAttribute titleRuleAttribute = matchingInjectImporter.getRuleAttributes().stream()
                            .filter(ruleAttribute -> ruleAttribute.getName().equals("title"))
                            .findFirst()
                            .orElseThrow(ElementNotFoundException::new);
                    int titleCol = CellReference.convertColStringToIndex(titleRuleAttribute.getColumns());
                    inject.setTitle(row.getCell(titleCol).getStringCellValue());

                    // Adding the trigger time
                    RuleAttribute triggerTimeRuleAttribute = matchingInjectImporter.getRuleAttributes().stream()
                            .filter(ruleAttribute -> ruleAttribute.getName().equals("trigger_time"))
                            .findFirst()
                            .orElseThrow(ElementNotFoundException::new);
                    boolean specifyDays = triggerTimeRuleAttribute.getAdditionalConfig()
                            .get("specifyDays").trim().equalsIgnoreCase("true");
                    boolean relativeDays = triggerTimeRuleAttribute.getAdditionalConfig()
                            .get("relativeDays").trim().equalsIgnoreCase("true");
                    boolean relativeTime = triggerTimeRuleAttribute.getAdditionalConfig()
                            .get("relativeTime").trim().equalsIgnoreCase("true");
                    String timePattern = triggerTimeRuleAttribute.getAdditionalConfig()
                            .get("timePattern");
                    DateTimeFormatter dateTimeFormatter;

                    // We try to find an absolute date on this first pass
                    if(!relativeDays && !relativeTime) {
                        if(timePattern == null) {
                            if(specifyDays) {
                                dateTimeFormatter = DateTimeFormatter.ISO_DATE_TIME;
                            } else {
                                dateTimeFormatter = DateTimeFormatter.ISO_TIME;
                            }
                        } else {
                            dateTimeFormatter = DateTimeFormatter.ofPattern(timePattern);
                        }

                        String dateAsString = Arrays.stream(triggerTimeRuleAttribute.getColumns().split("\\+"))
                                .map(column -> row.getCell(CellReference.convertColStringToIndex(column)).getStringCellValue())
                                .collect(Collectors.joining());

                        Instant injectDate = Instant.ofEpochSecond(
                                LocalDateTime.parse(dateAsString, dateTimeFormatter)
                                        .toEpochSecond(ZoneOffset.UTC));
                        if(wrapper.earliestAbsoluteDate == null) {
                            wrapper.earliestAbsoluteDate = injectDate;
                            inject.setDependsDuration(0L);
                        } else {
                            if(injectDate.isBefore(wrapper.earliestAbsoluteDate)) {
                                wrapper.earliestAbsoluteDate = injectDate;
                            }
                        }
                    }

                    // Adding the content
                    ObjectMapper mapper = new ObjectMapper();
                    inject.setContent(mapper.createObjectNode());

                    // For ease of use, we create a map of the available keys for the injector
                    Map<String, JsonNode> mapFieldByKey =
                            StreamSupport.stream((injectorContract.getConvertedContent().get("fields")
                                            .spliterator()), false)
                                    .collect(Collectors.toMap(jsonNode -> jsonNode.get("key").asText(), Function.identity()));

                    // So far, we only support one expectation
                    InjectExpectation expectation = new InjectExpectation();
                    expectation.setType(InjectExpectation.EXPECTATION_TYPE.MANUAL);

                    // For each rule attributes of the importer
                    matchingInjectImporter.getRuleAttributes().forEach(ruleAttribute -> {
                        // If it's a reserved field, it's already taken care of
                        if(importReservedField.contains(ruleAttribute.getName())) {
                            return;
                        }

                        // Otherwise, the default type is text but it can be overriden
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
                                String columnValue = Arrays.stream(ruleAttribute.getColumns().split("\\+"))
                                        .map(column -> row.getCell(CellReference.convertColStringToIndex(column)).getStringCellValue())
                                        .collect(Collectors.joining());
                                inject.getContent().put(ruleAttribute.getName(), columnValue);
                                break;
                            case "team":
                                // If the rule type is on a team field, we split by "+" if there is a concatenation of columns
                                // and then joins the result, split again by "," and use the list of results to get the teams by their name
                                List<String> columnValues = Arrays.stream(Arrays.stream(ruleAttribute.getColumns().split("\\+"))
                                        .map(column -> row.getCell(CellReference.convertColStringToIndex(column)).getStringCellValue())
                                        .collect(Collectors.joining(","))
                                        .split(","))
                                        .toList();
                                inject.getTeams().addAll(mapTeamByName.entrySet().stream()
                                        .filter(nameTeamEntry -> columnValues.contains(nameTeamEntry.getKey()))
                                        .map(Map.Entry::getValue)
                                        .toList()
                                );
                                break;
                            case "expectation":
                                // If the rule type is of an expectation,
                                if (ruleAttribute.getName().contains(".")) {
                                    if("score".equals(ruleAttribute.getName().split(".")[1])) {
                                        Double columnValueExpectation = Arrays.stream(ruleAttribute.getColumns().split("\\+"))
                                                .map(column -> row.getCell(CellReference.convertColStringToIndex(column)).getNumericCellValue())
                                                .reduce(0.0, Double::sum);
                                        expectation.setExpectedScore(columnValueExpectation.intValue());
                                    } else if ("name".equals(ruleAttribute.getName().split(".")[1])) {
                                        String columnValueExpectation = Arrays.stream(ruleAttribute.getColumns().split("\\+"))
                                                .map(column -> row.getCell(CellReference.convertColStringToIndex(column)).getStringCellValue())
                                                .collect(Collectors.joining());
                                        expectation.setName(columnValueExpectation);
                                    } else if ("description".equals(ruleAttribute.getName().split(".")[1])) {
                                        String columnValueExpectation = Arrays.stream(ruleAttribute.getColumns().split("\\+"))
                                                .map(column -> row.getCell(CellReference.convertColStringToIndex(column)).getStringCellValue())
                                                .collect(Collectors.joining());
                                        expectation.setDescription(columnValueExpectation);
                                    }
                                }

                                break;
                            default:
                                throw new UnsupportedOperationException();
                        }
                    });

                    // Once it's done, we set the injectorContract
                    inject.setInjectorContract(injectorContract);
                    // This is by default at false
                    inject.setAllTeams(false);
                    // The user is the one doing the import
                    inject.setUser(userRepository.findById(currentUser().getId()).orElseThrow());
                    // No exercise yet
                    inject.setExercise(null);
                    // No dependencies
                    inject.setDependsOn(null);
                    // We set the expectation
                    inject.setExpectations(List.of(expectation));

                    importTestSummary.getInjects().add(inject);
                });

                // Now that we did our first pass, we do another one real quick to find out
                // the date relative to each others
                selectedSheet.rowIterator().forEachRemaining(cells -> {

                });
                if (isScheduled) {
                    // The scenario is already scheduled
                } else {
                    // The scenario is not scheduled yet
                }

            }
        } catch (IOException ex) {
            log.severe("Error while importing an xls file");
            log.severe(Arrays.toString(ex.getStackTrace()));
            throw new RuntimeException();
        }

        return importTestSummary;
    }

    private boolean checkIfRowIsEmpty(Row row) {
        if (row == null) {
            return true;
        }
        if (row.getLastCellNum() <= 0) {
            return true;
        }
        for (int cellNum = row.getFirstCellNum(); cellNum < row.getLastCellNum(); cellNum++) {
            Cell cell = row.getCell(cellNum);
            if (cell != null && cell.getCellType() != CellType.BLANK && StringUtils.isNotBlank(cell.toString())) {
                return false;
            }
        }
        return true;
    }

    private <X, Y> Join<X, Y> createLeftJoin(Root<X> root, String attributeName) {
        return root.join(attributeName, JoinType.LEFT);
    }

    private <X, Y> Expression<String[]> createArrayAgg(CriteriaBuilder cb, Root<X> root, String attributeName) {
        Join<X, Y> join = root.join(attributeName, JoinType.LEFT);
        return arrayAgg(cb, join);
    }

  // -- TEST --

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

}
