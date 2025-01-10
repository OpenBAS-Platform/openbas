package io.openbas.rest.helper;

import io.openbas.database.model.*;
import io.openbas.database.raw.*;
import io.openbas.database.repository.CommunicationRepository;
import io.openbas.database.repository.ExerciseTeamUserRepository;
import io.openbas.database.repository.InjectExpectationRepository;
import io.openbas.database.repository.InjectRepository;
import io.openbas.database.repository.ScenarioRepository;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

public class TeamHelper {
  public static List<TeamSimple> rawAllTeamToSimplerAllTeam(List<RawTeam> teams) {
    // Then, for all the raw teams, we will create a simpler team object and then send it back to
    // the front
    return teams.stream()
        .map(
            rawTeam -> {
              // We create the simpler team object using the raw one
              TeamSimple teamSimple = new TeamSimple(rawTeam);

              return teamSimple;
            })
        .collect(Collectors.toList());
  }

  private static Set<String> getInjectTeamsIds(
      final String teamId, Set<String> injectIds, final InjectRepository injectRepository) {
    Set<RawInject> rawInjectTeams = injectRepository.findRawInjectTeams(injectIds, teamId);
    return rawInjectTeams.stream().map(RawInject::getInject_id).collect(Collectors.toSet());
  }
}
