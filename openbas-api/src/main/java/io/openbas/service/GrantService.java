package io.openbas.service;

import static io.openbas.helper.StreamHelper.fromIterable;

import io.openbas.database.model.Exercise;
import io.openbas.database.model.Grant;
import io.openbas.database.model.Group;
import io.openbas.database.model.Scenario;
import io.openbas.database.repository.GrantRepository;
import io.openbas.database.repository.GroupRepository;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.util.function.Tuples;

@Service
@RequiredArgsConstructor
public class GrantService {

  private final GroupRepository groupRepository;
  private final GrantRepository grantRepository;

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
                  grant.setExercise(exercise);
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
                  grant.setScenario(scenario);
                  return grant;
                })
            .toList();
    if (!grants.isEmpty()) {
      Iterable<Grant> scenarioGrants = this.grantRepository.saveAll(grants);
      scenario.setGrants(fromIterable(scenarioGrants));
    }
  }
}
