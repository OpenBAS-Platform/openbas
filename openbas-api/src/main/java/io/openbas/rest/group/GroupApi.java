package io.openbas.rest.group;

import static io.openbas.database.audit.ModelBaseListener.DATA_UPDATE;
import static io.openbas.database.model.User.ROLE_ADMIN;
import static io.openbas.database.model.User.ROLE_USER;
import static io.openbas.utils.pagination.PaginationUtils.buildPaginationJPA;
import static java.time.Instant.now;
import static java.util.stream.Collectors.toList;
import static java.util.stream.StreamSupport.stream;

import io.openbas.database.audit.BaseEvent;
import io.openbas.database.model.*;
import io.openbas.database.repository.*;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.group.form.GroupCreateInput;
import io.openbas.rest.group.form.GroupGrantInput;
import io.openbas.rest.group.form.GroupUpdateUsersInput;
import io.openbas.rest.group.form.OrganizationGrantInput;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import java.util.Objects;
import java.util.Optional;
import java.util.Spliterator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;

@RestController
@Secured(ROLE_USER)
public class GroupApi extends RestBehavior {

  private ExerciseRepository exerciseRepository;
  private ScenarioRepository scenarioRepository;
  private GrantRepository grantRepository;
  private OrganizationRepository organizationRepository;
  private GroupRepository groupRepository;
  private UserRepository userRepository;
  private ApplicationEventPublisher appPublisher;

  @Autowired
  public void setOrganizationRepository(OrganizationRepository organizationRepository) {
    this.organizationRepository = organizationRepository;
  }

  @Autowired
  public void setApplicationEventPublisher(ApplicationEventPublisher applicationEventPublisher) {
    this.appPublisher = applicationEventPublisher;
  }

  @Autowired
  public void setGrantRepository(GrantRepository grantRepository) {
    this.grantRepository = grantRepository;
  }

  @Autowired
  public void setExerciseRepository(ExerciseRepository exerciseRepository) {
    this.exerciseRepository = exerciseRepository;
  }

  @Autowired
  public void setScenarioRepository(ScenarioRepository scenarioRepository) {
    this.scenarioRepository = scenarioRepository;
  }

  @Autowired
  public void setUserRepository(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  @Autowired
  public void setGroupRepository(GroupRepository groupRepository) {
    this.groupRepository = groupRepository;
  }

  @GetMapping("/api/groups")
  public Iterable<Group> groups() {
    return groupRepository.findAll();
  }

  @PostMapping("/api/groups/search")
  public Page<Group> users(@RequestBody @Valid final SearchPaginationInput searchPaginationInput) {
    return buildPaginationJPA(
        (Specification<Group> specification, Pageable pageable) ->
            this.groupRepository.findAll(specification, pageable),
        searchPaginationInput,
        Group.class);
  }

  @GetMapping("/api/groups/{groupId}")
  public Group group(@PathVariable String groupId) {
    return groupRepository.findById(groupId).orElseThrow(ElementNotFoundException::new);
  }

  @Secured(ROLE_ADMIN)
  @PostMapping("/api/groups")
  @Transactional(rollbackOn = Exception.class)
  public Group createGroup(@Valid @RequestBody GroupCreateInput input) {
    Group group = new Group();
    group.setUpdateAttributes(input);
    group.setExercisesDefaultGrants(input.defaultExerciseGrants());
    group.setScenariosDefaultGrants(input.defaultScenarioGrants());
    return groupRepository.save(group);
  }

  @Secured(ROLE_ADMIN)
  @PutMapping("/api/groups/{groupId}/users")
  @Transactional(rollbackOn = Exception.class)
  public Group updateGroupUsers(
      @PathVariable String groupId, @Valid @RequestBody GroupUpdateUsersInput input) {
    Group group = groupRepository.findById(groupId).orElseThrow(ElementNotFoundException::new);
    Spliterator<User> userSpliterator =
        userRepository.findAllById(input.getUserIds()).spliterator();
    group.setUsers(stream(userSpliterator, false).collect(toList()));
    Group savedGroup = groupRepository.save(group);
    // Publish exercises impacted by this group change.
    savedGroup.getGrants().stream()
        .map(Grant::getExercise)
        .filter(Objects::nonNull)
        .forEach(
            exercise -> appPublisher.publishEvent(new BaseEvent(DATA_UPDATE, exercise, mapper)));
    // Publish scenarios impacted by this group change.
    savedGroup.getGrants().stream()
        .map(Grant::getScenario)
        .filter(Objects::nonNull)
        .forEach(
            scenario -> appPublisher.publishEvent(new BaseEvent(DATA_UPDATE, scenario, mapper)));
    return savedGroup;
  }

  @Secured(ROLE_ADMIN)
  @PutMapping("/api/groups/{groupId}/information")
  @Transactional(rollbackOn = Exception.class)
  public Group updateGroupInformation(
      @PathVariable String groupId, @Valid @RequestBody GroupCreateInput input) {
    Group group = groupRepository.findById(groupId).orElseThrow(ElementNotFoundException::new);
    group.setUpdateAttributes(input);
    group.setExercisesDefaultGrants(input.defaultExerciseGrants());
    group.setScenariosDefaultGrants(input.defaultScenarioGrants());
    return groupRepository.save(group);
  }

  @Secured(ROLE_ADMIN)
  @PostMapping("/api/groups/{groupId}/grants")
  @Transactional(rollbackOn = Exception.class)
  public Grant groupGrant(@PathVariable String groupId, @Valid @RequestBody GroupGrantInput input) {
    if (input.getExerciseId() == null && input.getScenarioId() == null) {
      throw new IllegalArgumentException("At least one of exercise or scenario should be present");
    }

    // Resolve dependencies
    Group group = groupRepository.findById(groupId).orElseThrow(ElementNotFoundException::new);
    Optional<Exercise> exerciseOpt =
        input.getExerciseId() == null
            ? Optional.empty()
            : exerciseRepository.findById(input.getExerciseId());
    Optional<Scenario> scenarioOpt =
        input.getScenarioId() == null
            ? Optional.empty()
            : scenarioRepository.findById(input.getScenarioId());

    // Create the grant
    Grant grant = new Grant();
    grant.setName(input.getName());
    grant.setGroup(group);
    if (exerciseOpt.isPresent()) {
      grant.setExercise(exerciseOpt.get());
    }
    if (scenarioOpt.isPresent()) {
      grant.setScenario(scenarioOpt.get());
    }
    Grant savedGrant = grantRepository.save(grant);

    // Exercise
    if (exerciseOpt.isPresent()) {
      Exercise exercise = exerciseOpt.get();
      exercise.getGrants().add(savedGrant);
      exercise.setUpdatedAt(now());
      exerciseRepository.save(exercise);
    }

    // Scenario
    if (scenarioOpt.isPresent()) {
      Scenario scenario = scenarioOpt.get();
      scenario.getGrants().add(savedGrant);
      scenario.setUpdatedAt(now());
      scenarioRepository.save(scenario);
    }

    return savedGrant;
  }

  @Secured(ROLE_ADMIN)
  @PostMapping("/api/groups/{groupId}/organizations")
  @Transactional(rollbackOn = Exception.class)
  public Group groupOrganization(
      @PathVariable String groupId, @Valid @RequestBody OrganizationGrantInput input) {
    // Resolve dependencies
    Group group = groupRepository.findById(groupId).orElseThrow(ElementNotFoundException::new);
    Organization organization =
        organizationRepository
            .findById(input.getOrganizationId())
            .orElseThrow(ElementNotFoundException::new);
    group.getOrganizations().add(organization);
    return groupRepository.save(group);
  }

  @Secured(ROLE_ADMIN)
  @DeleteMapping("/api/groups/{groupId}/organizations/{organizationId}")
  public Group deleteGroupOrganization(
      @PathVariable String groupId, @PathVariable String organizationId) {
    Group group = groupRepository.findById(groupId).orElseThrow(ElementNotFoundException::new);
    Organization organization =
        organizationRepository.findById(organizationId).orElseThrow(ElementNotFoundException::new);
    group.getOrganizations().remove(organization);
    return groupRepository.save(group);
  }

  @Secured(ROLE_ADMIN)
  @DeleteMapping("/api/grants/{grantId}")
  @Transactional(rollbackOn = Exception.class)
  public void deleteGrant(@PathVariable String grantId) {
    grantRepository.deleteById(grantId);
  }

  @Secured(ROLE_ADMIN)
  @DeleteMapping("/api/groups/{groupId}")
  @Transactional(rollbackOn = Exception.class)
  public void deleteGroup(@PathVariable String groupId) {
    groupRepository.deleteById(groupId);
  }
}
