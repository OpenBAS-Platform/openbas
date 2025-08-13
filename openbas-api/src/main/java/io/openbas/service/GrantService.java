package io.openbas.service;

import static io.openbas.helper.StreamHelper.fromIterable;

import io.openbas.database.model.Exercise;
import io.openbas.database.model.Grant;
import io.openbas.database.model.Group;
import io.openbas.database.model.Scenario;
import io.openbas.database.model.User;
import io.openbas.database.repository.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.EnumSet;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;
import reactor.util.function.Tuples;

@Service
@RequiredArgsConstructor
public class GrantService {
  private static final EnumSet<Grant.GRANT_TYPE> READ_AUTHORIZED_GRANTS =
      EnumSet.of(Grant.GRANT_TYPE.OBSERVER, Grant.GRANT_TYPE.PLANNER, Grant.GRANT_TYPE.LAUNCHER);
  private static final EnumSet<Grant.GRANT_TYPE> WRITE_AUTHORIZED_GRANTS =
      EnumSet.of(Grant.GRANT_TYPE.PLANNER, Grant.GRANT_TYPE.LAUNCHER);

  private final GroupRepository groupRepository;
  private final GrantRepository grantRepository;
    private final ExerciseRepository exerciseRepository;
    private final ScenarioRepository scenarioRepository;
    private final InjectRepository injectRepository;
    private final PayloadRepository payloadRepository;

  public void computeGrant(@NotNull Exercise exercise) {
    // Find automatic groups to grants
    List<Group> groups = fromIterable(this.groupRepository.findAll());
    List<Grant> grants =
        groups.stream()
            .filter(group -> !group.getExercisesDefaultGrants().isEmpty())
            .flatMap(
                group ->
                    group.getExercisesDefaultGrants().stream()
                        .distinct()
                        .map(s -> Tuples.of(group, s)))
            .map(
                tuple -> {
                  Grant grant = new Grant();
                  grant.setGroup(tuple.getT1());
                  grant.setName(tuple.getT2());
                  grant.setResourceId(exercise.getId());
                  return grant;
                })
            .toList();
    if (!grants.isEmpty()) {
      Iterable<Grant> exerciseGrants = this.grantRepository.saveAll(grants);
      exercise.setGrants(fromIterable(exerciseGrants));
    }
  }

  public void computeGrant(@NotNull Scenario scenario) {
    // Find automatic groups to grants
    List<Group> groups = fromIterable(this.groupRepository.findAll());
    List<Grant> grants =
        groups.stream()
            .filter(group -> !group.getScenariosDefaultGrants().isEmpty())
            .flatMap(
                group ->
                    group.getScenariosDefaultGrants().stream()
                        .distinct()
                        .map(s -> Tuples.of(group, s)))
            .map(
                tuple -> {
                  Grant grant = new Grant();
                  grant.setGroup(tuple.getT1());
                  grant.setName(tuple.getT2());
                  grant.setResourceId(scenario.getId());
                  return grant;
                })
            .toList();
    if (!grants.isEmpty()) {
      Iterable<Grant> scenarioGrants = this.grantRepository.saveAll(grants);
      scenario.setGrants(fromIterable(scenarioGrants));
    }
  }

  public boolean hasReadGrant(@NotBlank final String resourceId, @NotNull final User user) {
    return hasGrant(resourceId, user, Grant.GRANT_TYPE.OBSERVER);
  }

  public boolean hasWriteGrant(@NotBlank final String resourceId, @NotNull final User user) {
    return hasGrant(resourceId, user, Grant.GRANT_TYPE.PLANNER);
  }

  public boolean hasLaunchGrant(@NotBlank final String resourceId, @NotNull final User user) {
    return hasGrant(resourceId, user, Grant.GRANT_TYPE.LAUNCHER);
  }

  private boolean hasGrant(
      @NotBlank final String resourceId,
      @NotNull final User user,
      @NotNull final Grant.GRANT_TYPE grantType) {
    return this.grantRepository.rawByResourceIdAndUserId(resourceId, user.getId()).stream()
        .anyMatch(rawGrant -> grantType.name().equals(rawGrant.getGrant_name()));
  }

    /**
     * Validates that the resource ID is not blank and exists in one of the grantable resource repositories.
     *
     * @param resourceId the resource ID to validate
     * @throws IllegalArgumentException if the resource ID is blank or does not exist
     */
    public void validateResourceIdForGrant(String resourceId) {
        if (StringUtils.isBlank(resourceId)) {
            throw new IllegalArgumentException("A valid resource ID should be present");
        }

        boolean exists = exerciseRepository.existsById(resourceId) ||
                scenarioRepository.existsById(resourceId) ||
                injectRepository.existsById(resourceId) ||
                payloadRepository.existsById(resourceId);

        if (!exists) {
            throw new IllegalArgumentException("A valid resource ID should be present");
        }
    }
}
