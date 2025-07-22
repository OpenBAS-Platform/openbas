package io.openbas.utils.mapper;

import io.openbas.database.model.Challenge;
import io.openbas.rest.document.form.RelatedEntityOutput;
import java.util.Set;
import java.util.stream.Collectors;

public class ChallengeMapper {

  public static Set<RelatedEntityOutput> toRelatedEntityOutputs(Set<Challenge> challenges) {
    return challenges.stream()
        .map(challenge -> toRelatedEntityOutput(challenge))
        .collect(Collectors.toSet());
  }

  private static RelatedEntityOutput toRelatedEntityOutput(Challenge challenge) {
    return RelatedEntityOutput.builder().id(challenge.getId()).name(challenge.getName()).build();
  }
}
