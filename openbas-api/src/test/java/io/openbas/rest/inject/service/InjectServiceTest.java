package io.openbas.rest.inject.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import io.openbas.database.model.*;
import io.openbas.database.repository.InjectDocumentRepository;
import io.openbas.database.repository.InjectRepository;
import io.openbas.database.repository.InjectStatusRepository;
import io.openbas.database.repository.TeamRepository;
import io.openbas.rest.exception.BadRequestException;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.inject.form.InjectBulkProcessingInput;
import io.openbas.rest.inject.form.InjectBulkUpdateOperation;
import io.openbas.rest.inject.form.InjectBulkUpdateSupportedFields;
import io.openbas.rest.inject.form.InjectBulkUpdateSupportedOperations;
import io.openbas.rest.security.SecurityExpression;
import io.openbas.rest.security.SecurityExpressionHandler;
import io.openbas.service.AssetGroupService;
import io.openbas.service.AssetService;
import io.openbas.utils.InjectMapper;
import io.openbas.utils.fixtures.AssetGroupFixture;
import io.openbas.utils.pagination.SearchPaginationInput;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.expression.method.MethodSecurityExpressionHandler;

class InjectServiceTest {

  private static final String INJECT_ID = "injectid";

  @Mock private InjectRepository injectRepository;

  @Mock private AssetService assetService;

  @Mock private AssetGroupService assetGroupService;

  @Mock private TeamRepository teamRepository;

  @Mock(extraInterfaces = {MethodSecurityExpressionHandler.class})
  private SecurityExpressionHandler methodSecurityExpressionHandler;

  @Mock private SecurityExpression securityExpression;

  @Mock private InjectDocumentRepository injectDocumentRepository;

  @Mock private InjectStatusRepository injectStatusRepository;

  @Mock private InjectMapper injectMapper;

  @InjectMocks private InjectService injectService;

  @BeforeEach
  void setUp() {
    MockitoAnnotations.openMocks(this);
    when(methodSecurityExpressionHandler.getSecurityExpression()).thenReturn(securityExpression);
  }

  @Test
  public void testApplyDefaultAssetGroupsToInject_WITH_unexisting_inject() {
    doReturn(Optional.empty()).when(injectRepository).findById(INJECT_ID);
    assertThrows(
        ElementNotFoundException.class,
        () -> injectService.applyDefaultAssetGroupsToInject(INJECT_ID, List.of(), List.of()));
  }

  @Test
  public void testApplyDefaultAssetGroupsToInject_WITH_add_and_remove() {
    AssetGroup assetGroup1 = getAssetGroup("assetgroup1");
    AssetGroup assetGroup2 = getAssetGroup("assetgroup2");
    AssetGroup assetGroup3 = getAssetGroup("assetgroup3");
    AssetGroup assetGroup4 = getAssetGroup("assetgroup4");
    Inject inject = new Inject();
    inject.setId(INJECT_ID);
    inject.setAssetGroups(List.of(assetGroup1, assetGroup2, assetGroup3));
    doReturn(Optional.of(inject)).when(injectRepository).findById(INJECT_ID);

    injectService.applyDefaultAssetGroupsToInject(
        INJECT_ID, List.of(assetGroup4), List.of(assetGroup3));

    ArgumentCaptor<Inject> injectCaptor = ArgumentCaptor.forClass(Inject.class);
    verify(injectRepository).save(injectCaptor.capture());
    Inject capturedInject = injectCaptor.getValue();
    assertEquals(INJECT_ID, capturedInject.getId());
    assertEquals(
        new HashSet<>(List.of(assetGroup1, assetGroup2, assetGroup4)),
        new HashSet<>(capturedInject.getAssetGroups()));
  }

  @Test
  public void testApplyDefaultAssetGroupsToInject_WITH_remove_all() {
    AssetGroup assetGroup1 = getAssetGroup("assetgroup1");
    AssetGroup assetGroup2 = getAssetGroup("assetgroup2");
    AssetGroup assetGroup3 = getAssetGroup("assetgroup3");
    Inject inject = new Inject();
    inject.setId(INJECT_ID);
    inject.setAssetGroups(List.of(assetGroup1, assetGroup2, assetGroup3));
    doReturn(Optional.of(inject)).when(injectRepository).findById(INJECT_ID);

    injectService.applyDefaultAssetGroupsToInject(
        INJECT_ID, List.of(), List.of(assetGroup1, assetGroup2, assetGroup3));

    ArgumentCaptor<Inject> injectCaptor = ArgumentCaptor.forClass(Inject.class);
    verify(injectRepository).save(injectCaptor.capture());
    Inject capturedInject = injectCaptor.getValue();
    assertEquals(INJECT_ID, capturedInject.getId());
    assertEquals(List.of(), capturedInject.getAssetGroups());
  }

  @Test
  public void testApplyDefaultAssetGroupsToInject_WITH_add_all() {
    AssetGroup assetGroup1 = getAssetGroup("assetgroup1");
    AssetGroup assetGroup2 = getAssetGroup("assetgroup2");
    AssetGroup assetGroup3 = getAssetGroup("assetgroup3");
    Inject inject = new Inject();
    inject.setId(INJECT_ID);
    inject.setAssetGroups(List.of());
    doReturn(Optional.of(inject)).when(injectRepository).findById(INJECT_ID);

    injectService.applyDefaultAssetGroupsToInject(
        INJECT_ID, List.of(assetGroup1, assetGroup2, assetGroup3), List.of());

    ArgumentCaptor<Inject> injectCaptor = ArgumentCaptor.forClass(Inject.class);
    verify(injectRepository).save(injectCaptor.capture());
    Inject capturedInject = injectCaptor.getValue();
    assertEquals(INJECT_ID, capturedInject.getId());
    assertEquals(
        new HashSet<>(List.of(assetGroup1, assetGroup2, assetGroup3)),
        new HashSet<>(capturedInject.getAssetGroups()));
  }

  @Test
  public void testApplyDefaultAssetGroupsToInject_WITH_no_change() {
    AssetGroup assetGroup1 = getAssetGroup("assetgroup1");
    AssetGroup assetGroup2 = getAssetGroup("assetgroup2");
    AssetGroup assetGroup3 = getAssetGroup("assetgroup3");
    Inject inject = new Inject();
    inject.setId(INJECT_ID);
    inject.setAssetGroups(List.of(assetGroup1, assetGroup2, assetGroup3));
    doReturn(Optional.of(inject)).when(injectRepository).findById(INJECT_ID);

    injectService.applyDefaultAssetGroupsToInject(
        INJECT_ID, List.of(assetGroup1), List.of(assetGroup1));

    verify(injectRepository, never()).save(any());
  }

  private AssetGroup getAssetGroup(String name) {
    AssetGroup assetGroup = AssetGroupFixture.createDefaultAssetGroup(name);
    assetGroup.setId(name);
    return assetGroup;
  }

  @DisplayName("Test get inject specification with valid search input")
  @Test
  void getInjectSpecificationWithValidSearchInput() {
    // Arrange
    InjectBulkProcessingInput input = new InjectBulkProcessingInput();
    input.setSearchPaginationInput(new SearchPaginationInput());
    input.getSearchPaginationInput().setFilterGroup(new Filters.FilterGroup());
    input.getSearchPaginationInput().setTextSearch("test");

    // Act
    Specification<Inject> specification = injectService.getInjectSpecification(input);

    // Assert
    assertNotNull(specification);
  }

  @DisplayName("Test get inject specification with inject IDs to process")
  @Test
  void getInjectSpecificationWithInjectIDsToProcess() {
    // Arrange
    InjectBulkProcessingInput input = new InjectBulkProcessingInput();
    input.setInjectIDsToProcess(List.of("id1", "id2"));

    // Act
    Specification<Inject> specification = injectService.getInjectSpecification(input);

    // Assert
    assertNotNull(specification);
  }

  @DisplayName("Test get inject specification with inject IDs to ignore")
  @Test
  void getInjectSpecificationWithInjectIDsToIgnore() {
    // Arrange
    InjectBulkProcessingInput input = new InjectBulkProcessingInput();
    input.setInjectIDsToProcess(List.of("id1", "id2"));
    input.setInjectIDsToIgnore(List.of("id3"));

    // Act
    Specification<Inject> specification = injectService.getInjectSpecification(input);

    // Assert
    assertNotNull(specification);
  }

  @DisplayName("Test get inject specification with null input")
  @Test
  void getInjectSpecificationWithNullInput() {
    // Arrange
    InjectBulkProcessingInput input = new InjectBulkProcessingInput();

    // Act & assert
    BadRequestException exception =
        assertThrows(BadRequestException.class, () -> injectService.getInjectSpecification(input));

    // Assert
    assertEquals(
        "Either inject_ids_to_process or search_pagination_input must be provided, and not both at the same time",
        exception.getMessage());
  }

  @DisplayName("Test bulk update injects with valid operations")
  @Test
  void bulkUpdateInjectsWithValidOperations() {
    // Arrange
    Team t0 = new Team();
    t0.setId("team0");
    Asset a0 = new Asset();
    a0.setId("asset0");
    Inject i1 = new Inject();
    i1.setId("inject1");
    Inject i2 = new Inject();
    i2.setId("inject2");
    i1.setTeams(new ArrayList<>(List.of(t0)));
    i1.setAssets(new ArrayList<>(List.of(a0)));

    List<Inject> injectsToUpdate = List.of(i1, i2);

    InjectBulkUpdateOperation ope1 = new InjectBulkUpdateOperation();
    ope1.setField(InjectBulkUpdateSupportedFields.TEAMS);
    ope1.setOperation(InjectBulkUpdateSupportedOperations.ADD);
    ope1.setValues(List.of("team1", "team2"));
    InjectBulkUpdateOperation ope2 = new InjectBulkUpdateOperation();
    ope2.setField(InjectBulkUpdateSupportedFields.ASSETS);
    ope2.setOperation(InjectBulkUpdateSupportedOperations.REPLACE);
    ope2.setValues(List.of("asset1", "asset2"));

    List<InjectBulkUpdateOperation> operations = List.of(ope1, ope2);

    Team t1 = new Team();
    t1.setId("team1");
    Team t2 = new Team();
    t2.setId("team2");
    List<Team> tList = List.of(t1, t2);

    Asset a1 = new Asset();
    a1.setId("asset1");
    Asset a2 = new Asset();
    a2.setId("asset2");
    List<Asset> aList = List.of(a1, a2);

    when(teamRepository.findAllById(any())).thenReturn(tList);
    when(assetService.assets(any())).thenReturn(aList);

    // Expected results
    Inject i1updated = new Inject();
    i1updated.setId("inject1");
    Inject i2updated = new Inject();
    i2updated.setId("inject2");
    i1updated.setTeams(new ArrayList<>(List.of(t0)));
    i1updated.getTeams().addAll(tList);
    i1updated.setAssets(aList);
    i2updated.setTeams(tList);
    i2updated.setAssets(aList);

    List<Inject> expectedUpdatedInjects = List.of(i1updated, i2updated);

    when(injectRepository.saveAll(expectedUpdatedInjects)).thenReturn(expectedUpdatedInjects);

    // Act
    List<Inject> updatedInjects = injectService.bulkUpdateInject(injectsToUpdate, operations);

    // Assert
    assertNotNull(updatedInjects);
    assertEquals(2, updatedInjects.size());
    // test that we added the teams and replaced the assets to the existing lists
    assertEquals(1 + tList.size(), updatedInjects.getFirst().getTeams().size());
    assertEquals(aList.size(), updatedInjects.getFirst().getAssets().size());
    assertTrue(updatedInjects.getFirst().getTeams().containsAll(tList));
    assertTrue(updatedInjects.getFirst().getAssets().containsAll(aList));
    assertTrue(updatedInjects.get(1).getTeams().containsAll(tList));
    assertTrue(updatedInjects.get(1).getAssets().containsAll(aList));
  }

  @DisplayName("Test bulk update injects with empty operations")
  @Test
  void bulkUpdateInjectsWithEmptyOperations() {
    // Arrange
    List<Inject> injectsToUpdate = List.of(new Inject(), new Inject());
    List<InjectBulkUpdateOperation> operations = List.of();

    when(injectRepository.saveAll(injectsToUpdate)).thenReturn(injectsToUpdate);

    // Act
    List<Inject> updatedInjects = injectService.bulkUpdateInject(injectsToUpdate, operations);

    // Assert
    assertNotNull(updatedInjects);
    assertEquals(2, updatedInjects.size());
    assertTrue(updatedInjects.getFirst().getTeams().isEmpty());
    assertTrue(updatedInjects.getFirst().getAssets().isEmpty());
    assertTrue(updatedInjects.getFirst().getAssetGroups().isEmpty());
  }

  @DisplayName("Test bulk update injects with non-existing team")
  @Test
  void bulkUpdateInjectsWithNonExistingEntity() {
    // Arrange
    Inject i1 = new Inject();
    i1.setId("inject1");
    Inject i2 = new Inject();
    i2.setId("inject2");
    List<Inject> injectsToUpdate = List.of(i1, i2);

    InjectBulkUpdateOperation ope = new InjectBulkUpdateOperation();
    ope.setField(InjectBulkUpdateSupportedFields.TEAMS);
    ope.setOperation(InjectBulkUpdateSupportedOperations.ADD);
    ope.setValues(List.of("nonExistingTeam"));

    List<InjectBulkUpdateOperation> operations = List.of(ope);

    when(teamRepository.findAllById(any())).thenReturn(List.of());

    // Expected results
    Inject i1updated = new Inject();
    i1updated.setId("inject1");
    Inject i2updated = new Inject();
    i2updated.setId("inject2");

    List<Inject> expectedUpdatedInjects = List.of(i1updated, i2updated);

    when(injectRepository.saveAll(expectedUpdatedInjects)).thenReturn(expectedUpdatedInjects);

    // Act
    List<Inject> updatedInjects = injectService.bulkUpdateInject(injectsToUpdate, operations);

    // Assert
    assertNotNull(updatedInjects);
    assertEquals(expectedUpdatedInjects.size(), updatedInjects.size());
    assertTrue(updatedInjects.getFirst().getTeams().isEmpty());
    assertTrue(updatedInjects.get(1).getTeams().isEmpty());
  }

  @DisplayName("Test get injects and check is planner with valid input")
  @Test
  void getInjectsAndCheckIsPlannerWithValidInput() {
    // Arrange
    InjectBulkProcessingInput input = new InjectBulkProcessingInput();
    input.setSearchPaginationInput(new SearchPaginationInput());
    input.getSearchPaginationInput().setFilterGroup(new Filters.FilterGroup());
    input.getSearchPaginationInput().setTextSearch("test");

    List<Inject> injects = List.of(new Inject(), new Inject());
    //noinspection unchecked
    when(injectRepository.findAll(any(Specification.class))).thenReturn(injects);
    when(securityExpression.isSimulationPlanner(any())).thenReturn(true);

    // Act
    List<Inject> result = injectService.getInjectsAndCheckIsPlanner(input);

    // Assert
    assertNotNull(result);
    assertEquals(2, result.size());
  }

  @DisplayName("Test get injects and check is planner with inject IDs to process")
  @Test
  void getInjectsAndCheckIsPlannerWithInjectIDsToProcess() {
    // Arrange
    InjectBulkProcessingInput input = new InjectBulkProcessingInput();
    input.setInjectIDsToProcess(List.of("id1", "id2"));

    List<Inject> injects = List.of(new Inject(), new Inject());

    //noinspection unchecked
    when(injectRepository.findAll(any(Specification.class))).thenReturn(injects);
    when(securityExpression.isSimulationPlanner(any())).thenReturn(true);

    // Act
    List<Inject> result = injectService.getInjectsAndCheckIsPlanner(input);

    // Assert
    assertNotNull(result);
    assertEquals(2, result.size());
  }

  @DisplayName("Test get injects and check is planner with inject IDs to ignore")
  @Test
  void getInjectsAndCheckIsPlannerWithInjectIDsToIgnore() {
    // Arrange
    InjectBulkProcessingInput input = new InjectBulkProcessingInput();
    input.setInjectIDsToProcess(List.of("id1", "id2"));
    input.setInjectIDsToIgnore(List.of("id3"));

    List<Inject> injects = List.of(new Inject(), new Inject());

    //noinspection unchecked
    when(injectRepository.findAll(any(Specification.class))).thenReturn(injects);
    when(securityExpression.isSimulationPlanner(any())).thenReturn(true);

    // Act
    List<Inject> result = injectService.getInjectsAndCheckIsPlanner(input);

    // Assert
    assertNotNull(result);
    assertEquals(2, result.size());
  }

  @DisplayName("Test get injects and check is planner with null input")
  @Test
  void getInjectsAndCheckIsPlannerWithNullInput() {
    // Arrange
    InjectBulkProcessingInput input = new InjectBulkProcessingInput();

    // Act & assert
    BadRequestException exception =
        assertThrows(
            BadRequestException.class, () -> injectService.getInjectsAndCheckIsPlanner(input));

    // Assert
    assertEquals(
        "Either inject_ids_to_process or search_pagination_input must be provided, and not both at the same time",
        exception.getMessage());
  }

  @DisplayName("Test get injects and check is planner with access denied")
  @Test
  void getInjectsAndCheckIsPlannerWithAccessDenied() {
    // Arrange
    InjectBulkProcessingInput input = new InjectBulkProcessingInput();
    input.setSearchPaginationInput(new SearchPaginationInput());
    input.getSearchPaginationInput().setFilterGroup(new Filters.FilterGroup());
    input.getSearchPaginationInput().setTextSearch("test");

    List<Inject> injects = List.of(new Inject(), new Inject());
    Scenario s1 = new Scenario();
    s1.setId("testScenario");
    injects.getFirst().setScenario(s1);

    //noinspection unchecked
    when(injectRepository.findAll(any(Specification.class))).thenReturn(injects);
    when(securityExpression.isSimulationPlanner(any())).thenReturn(false);

    // Act & assert
    AccessDeniedException exception =
        assertThrows(
            AccessDeniedException.class, () -> injectService.getInjectsAndCheckIsPlanner(input));

    // Assert
    assertEquals(
        "You are not allowed to delete the injects from the scenario or exercise " + s1.getId(),
        exception.getMessage());
  }

  @DisplayName("Test delete all injects by valid IDs")
  @Test
  void deleteAllInjectsByValidIds() {
    // Arrange
    List<String> injectIds = List.of("id1", "id2");

    doNothing().when(injectRepository).deleteAllById(injectIds);

    // Act
    injectService.deleteAllByIds(injectIds);

    // Assert
    verify(injectRepository, times(1)).deleteAllById(injectIds);
  }

  @DisplayName("Test delete all injects by empty IDs list")
  @Test
  void deleteAllInjectsByEmptyIdsList() {
    // Arrange
    List<String> injectIds = List.of();

    // Act
    injectService.deleteAllByIds(injectIds);

    // Assert
    verify(injectRepository, never()).deleteAllById(any());
  }

  @DisplayName("Test delete all injects by null IDs list")
  @Test
  void deleteAllInjectsByNullIdsList() {
    // Arrange
    List<String> injectIds = null;

    // Act
    injectService.deleteAllByIds(injectIds);

    // Assert
    verify(injectRepository, never()).deleteAllById(any());
  }

  @DisplayName("Test isPlanner with valid input and scenario planner OK")
  @Test
  void testIsPlannerScenarioPlanner() {
    // Arrange
    Inject inject = new Inject();
    Scenario scenario = new Scenario();
    scenario.setId("scenario1");
    inject.setScenario(scenario);

    when(securityExpression.isScenarioPlanner("scenario1")).thenReturn(true);

    // Act & Assert
    assertDoesNotThrow(
        () ->
            injectService.isPlanner(
                List.of(inject), Inject::getScenario, SecurityExpression::isScenarioPlanner));
  }

  @DisplayName("Test isPlanner with valid input and scenario planner KO")
  @Test
  void testIsPlannerScenarioPlannerAccessDenied() {
    // Arrange
    Inject inject = new Inject();
    Scenario scenario = new Scenario();
    scenario.setId("scenario1");
    inject.setScenario(scenario);

    when(securityExpression.isScenarioPlanner("scenario1")).thenReturn(false);

    // Act & Assert
    assertThrows(
        AccessDeniedException.class,
        () ->
            injectService.isPlanner(
                List.of(inject), Inject::getScenario, SecurityExpression::isScenarioPlanner));
  }

  @DisplayName("Test isPlanner with valid input and simulation planner OK")
  @Test
  void testIsPlannerSimulationPlanner() {
    // Arrange
    Inject inject = new Inject();
    Exercise exercise = new Exercise();
    exercise.setId("exercise1");
    inject.setExercise(exercise);

    when(securityExpression.isSimulationPlanner("exercise1")).thenReturn(true);

    // Act & Assert
    assertDoesNotThrow(
        () ->
            injectService.isPlanner(
                List.of(inject), Inject::getExercise, SecurityExpression::isSimulationPlanner));
  }

  @DisplayName("Test isPlanner with valid input and simulation planner OK")
  @Test
  void testIsPlannerSimulationPlannerAccessDenied() {
    // Arrange
    Inject inject = new Inject();
    Exercise exercise = new Exercise();
    exercise.setId("exercise1");
    inject.setExercise(exercise);

    when(securityExpression.isSimulationPlanner("exercise1")).thenReturn(false);

    // Act & Assert
    assertThrows(
        AccessDeniedException.class,
        () ->
            injectService.isPlanner(
                List.of(inject), Inject::getExercise, SecurityExpression::isSimulationPlanner));
  }

  @DisplayName("Test isPlanner with no injects")
  @Test
  void testIsPlannerNoInjects() {

    // Arrange
    when(securityExpression.isSimulationPlanner("exercise1")).thenReturn(false);

    // Act
    injectService.isPlanner(
        Collections.emptyList(), Inject::getExercise, SecurityExpression::isSimulationPlanner);

    // Assert
    verify(securityExpression, times(0)).isSimulationPlanner("exercise1");
  }
}