package io.openbas.utils.helpers;

import io.openbas.database.model.Challenge;
import io.openbas.database.model.Exercise;
import io.openbas.database.model.Tag;
import io.openbas.service.ChallengeService;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

public class ExerciseHelper {
  public static List<Tag> crawlAllTags(Exercise exercise, ChallengeService challengeService) {
    List<Tag> tags = new ArrayList<>(exercise.getTags());
    tags.addAll(exercise.getTeams().stream().flatMap(team -> team.getTags().stream()).toList());
    tags.addAll(
        exercise.getTeams().stream()
            .flatMap(team -> team.getUsers().stream().flatMap(user -> user.getTags().stream()))
            .toList());
    tags.addAll(
        exercise.getTeams().stream()
            .flatMap(
                team ->
                    team.getUsers().stream()
                        .flatMap(
                            user ->
                                user.getOrganization() == null
                                    ? null
                                    : user.getOrganization().getTags().stream()
                                        .filter(Objects::nonNull)))
            .toList());
    tags.addAll(
        exercise.getDocuments().stream().flatMap(document -> document.getTags().stream()).toList());
    tags.addAll(
        exercise.getInjects().stream().flatMap(inject -> inject.getTags().stream()).toList());
    List<Challenge> challenges = new ArrayList<>();
    for (Challenge challenge : challengeService.getExerciseChallenges(exercise.getId())) {
      challenges.add(challenge);
    }
    tags.addAll(challenges.stream().flatMap(challenge -> challenge.getTags().stream()).toList());
    return tags;
  }
}
