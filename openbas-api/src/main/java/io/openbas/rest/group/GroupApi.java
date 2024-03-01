package io.openbas.rest.group;

import io.openbas.database.audit.BaseEvent;
import io.openbas.database.model.*;
import io.openbas.database.repository.*;
import io.openbas.rest.group.form.GroupCreateInput;
import io.openbas.rest.group.form.GroupGrantInput;
import io.openbas.rest.group.form.GroupUpdateUsersInput;
import io.openbas.rest.group.form.OrganizationGrantInput;
import io.openbas.rest.helper.RestBehavior;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.Spliterator;

import static io.openbas.database.audit.ModelBaseListener.DATA_UPDATE;
import static io.openbas.database.model.User.ROLE_ADMIN;
import static io.openbas.database.model.User.ROLE_USER;
import static java.time.Instant.now;
import static java.util.stream.Collectors.toList;
import static java.util.stream.StreamSupport.stream;

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

  @GetMapping("/api/groups/{groupId}")
  public Group group(@PathVariable String groupId) {
    return groupRepository.findById(groupId).orElseThrow();
  }

  @Secured(ROLE_ADMIN)
  @PostMapping("/api/groups")
  public Group createGroup(@Valid @RequestBody GroupCreateInput input) {
    Group group = new Group();
    group.setUpdateAttributes(input);
    group.setExercisesDefaultGrants(input.defaultExerciseGrants());
    group.setScenariosDefaultGrants(input.defaultScenarioGrants());
    return groupRepository.save(group);
  }

  @Secured(ROLE_ADMIN)
  @PutMapping("/api/groups/{groupId}/users")
  public Group updateGroupUsers(@PathVariable String groupId,
      @Valid @RequestBody GroupUpdateUsersInput input) {
    Group group = groupRepository.findById(groupId).orElseThrow();
    Spliterator<User> userSpliterator = userRepository.findAllById(input.getUserIds()).spliterator();
    group.setUsers(stream(userSpliterator, false).collect(toList()));
    Group savedGroup = groupRepository.save(group);
    // Publish exercises impacted by this group change.
    savedGroup.getGrants()
        .stream()
        .map(Grant::getExercise)
        .forEach(exercise -> appPublisher.publishEvent(new BaseEvent(DATA_UPDATE, exercise, mapper)));
    // Publish scenarios impacted by this group change.
    savedGroup.getGrants()
        .stream()
        .map(Grant::getScenario)
        .forEach(scenario -> appPublisher.publishEvent(new BaseEvent(DATA_UPDATE, scenario, mapper)));
    return savedGroup;
  }

  @Secured(ROLE_ADMIN)
  @PutMapping("/api/groups/{groupId}/information")
  public Group updateGroupInformation(
      @PathVariable String groupId,
      @Valid @RequestBody GroupCreateInput input) {
    Group group = groupRepository.findById(groupId).orElseThrow();
    group.setUpdateAttributes(input);
    group.setExercisesDefaultGrants(input.defaultExerciseGrants());
    group.setScenariosDefaultGrants(input.defaultScenarioGrants());
    return groupRepository.save(group);
  }

  @Transactional(rollbackOn = Exception.class)
  @Secured(ROLE_ADMIN)
  @PostMapping("/api/groups/{groupId}/grants")
  public Grant groupGrant(@PathVariable String groupId, @Valid @RequestBody GroupGrantInput input) {
    if (input.getExerciseId() == null && input.getScenarioId() == null) {
      throw new IllegalArgumentException("At least one of exercise or scenario should be present");
    }

    // Resolve dependencies
    Group group = groupRepository.findById(groupId).orElseThrow();
    Optional<Exercise> exerciseOpt = input.getExerciseId() == null ? Optional.empty() : exerciseRepository.findById(input.getExerciseId());
    Optional<Scenario> scenarioOpt = input.getScenarioId() == null ? Optional.empty() : scenarioRepository.findById(input.getScenarioId());

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

  @Transactional(rollbackOn = Exception.class)
  @Secured(ROLE_ADMIN)
  @PostMapping("/api/groups/{groupId}/organizations")
  public Group groupOrganization(@PathVariable String groupId, @Valid @RequestBody OrganizationGrantInput input) {
    // Resolve dependencies
    Group group = groupRepository.findById(groupId).orElseThrow();
    Organization organization = organizationRepository.findById(input.getOrganizationId()).orElseThrow();
    group.getOrganizations().add(organization);
    return groupRepository.save(group);
  }

  @Secured(ROLE_ADMIN)
  @DeleteMapping("/api/groups/{groupId}/organizations/{organizationId}")
  public Group deleteGroupOrganization(@PathVariable String groupId, @PathVariable String organizationId) {
    Group group = groupRepository.findById(groupId).orElseThrow();
    Organization organization = organizationRepository.findById(organizationId).orElseThrow();
    group.getOrganizations().remove(organization);
    return groupRepository.save(group);
  }

  @Secured(ROLE_ADMIN)
  @DeleteMapping("/api/grants/{grantId}")
  public void deleteGrant(@PathVariable String grantId) {
    grantRepository.deleteById(grantId);
  }

  @Secured(ROLE_ADMIN)
  @DeleteMapping("/api/groups/{groupId}")
  public void deleteGroup(@PathVariable String groupId) {
    groupRepository.deleteById(groupId);
  }
}
