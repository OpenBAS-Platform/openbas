package io.openbas.service;

import static io.openbas.helper.StreamHelper.fromIterable;

import io.openbas.database.model.Exercise;
import io.openbas.database.model.Grant;
import io.openbas.database.model.Group;
import io.openbas.database.model.Scenario;
import io.openbas.database.model.User;
import io.openbas.database.repository.GrantRepository;
import io.openbas.database.repository.GroupRepository;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.EnumSet;
import java.util.List;
import lombok.RequiredArgsConstructor;
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

  public void computeGrant(@NotNull Exercise exercise) {
    // existing grants
    List<Grant> existingGrants = exercise.getGrants();
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
                  grant.setExercise(exercise);
                  return grant;
                })
            .filter(
                newGrant ->
                    existingGrants.stream().noneMatch(exGrant -> exGrant.isEquivalentTo(newGrant)))
            .toList();
    if (!grants.isEmpty()) {
      Iterable<Grant> exerciseGrants = this.grantRepository.saveAll(grants);
      exercise.setGrants(fromIterable(exerciseGrants));
    }
  }

  public void computeGrant(@NotNull Scenario scenario) {
    // existing grants
    List<Grant> existingGrants = scenario.getGrants();
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
                  grant.setScenario(scenario);
                  return grant;
                })
            .filter(
                newGrant ->
                    existingGrants.stream().noneMatch(exGrant -> exGrant.isEquivalentTo(newGrant)))
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
        .anyMatch(
            rawGrant -> {
              Grant.GRANT_TYPE rawToGrant = Grant.GRANT_TYPE.valueOf(rawGrant.getGrant_name());
              return rawToGrant.getPriority() >= grantType.getPriority();
            });
  }
}
