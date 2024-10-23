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

  public static List<TeamSimple> rawTeamToSimplerTeam(List<RawTeam> teams,
      InjectExpectationRepository injectExpectationRepository,
      InjectRepository injectRepository,
      CommunicationRepository communicationRepository,
      ExerciseTeamUserRepository exerciseTeamUserRepository,
      ScenarioRepository scenarioRepository) {
    // Getting a map of inject expectations
    Map<String, RawInjectExpectation> mapInjectExpectation = injectExpectationRepository.rawByIds(
            teams.stream().flatMap(rawTeam -> rawTeam.getTeam_expectations().stream()).toList()
        )
        .stream().collect(Collectors.toMap(RawInjectExpectation::getInject_expectation_id, Function.identity()));

    // Getting a map of communications
    Map<String, RawCommunication> mapCommunication = communicationRepository.rawByIds(
            teams.stream().flatMap(rawTeam -> rawTeam.getTeam_communications().stream()).toList()
        )
        .stream().collect(Collectors.toMap(RawCommunication::getCommunication_id, Function.identity()));

    // Getting a map of exercises team users by team id
    Map<String, List<RawExerciseTeamUser>> mapExerciseTeamUser = exerciseTeamUserRepository.rawByTeamIds(
            teams.stream().map(RawTeam::getTeam_id).toList()
        )
        .stream().collect(Collectors.groupingBy(RawExerciseTeamUser::getTeam_id));

    // Getting a map of Injects by scenarios ids
    Map<String, Set<String>> mapInjectsByScenarioIds = scenarioRepository.rawInjectsFromScenarios(
        teams.stream().flatMap(rawTeam -> rawTeam.getTeam_scenarios().stream()).toList()
    ).stream().collect(Collectors.toMap(RawScenario::getScenario_id, RawScenario::getScenario_injects));

    // Then, for all the raw teams, we will create a simpler team object and then send it back to the front
    return teams.stream().map(rawTeam -> {
      // We create the simpler team object using the raw one
      TeamSimple teamSimple = new TeamSimple(rawTeam);

      // We set the inject expectations
      teamSimple.setInjectExpectations(
          rawTeam.getTeam_expectations().stream().map(
              expectation -> {
                // We set the inject expectation using the map we generated earlier
                InjectExpectation injectExpectation = new InjectExpectation();
                Optional<RawInjectExpectation> raw = Optional.ofNullable(mapInjectExpectation.get(expectation));
                raw.ifPresent(toProcess -> {
                  injectExpectation.setScore(toProcess.getInject_expectation_score());
                  injectExpectation.setExpectedScore(toProcess.getInject_expectation_expected_score());
                  injectExpectation.setId(toProcess.getInject_expectation_id());
                  injectExpectation.setExpectedScore(toProcess.getInject_expectation_expected_score());
                  if (toProcess.getExercise_id() != null) {
                    injectExpectation.setExercise(new Exercise());
                    injectExpectation.getExercise().setId(toProcess.getExercise_id());
                  }
                  injectExpectation.setTeam(new Team());
                  injectExpectation.getTeam().setId(rawTeam.getTeam_id());
                  injectExpectation.setType(
                      InjectExpectation.EXPECTATION_TYPE.valueOf(toProcess.getInject_expectation_type()));
                });
                return injectExpectation;
              }
          ).toList()
      );

      // We set the communications using the map we generated earlier
      // This object has content, content_html and attachments ignored because WE DON'T WANT THE FULL EXTENT
      teamSimple.setCommunications(
          rawTeam.getTeam_communications().stream().map(communicationId -> {
            RawCommunication raw = mapCommunication.get(communicationId);
            Communication communication = new Communication();
            communication.setAck(raw.getCommunication_ack());
            communication.setId(raw.getCommunication_id());
            communication.setIdentifier(raw.getCommunication_message_id());
            communication.setReceivedAt(raw.getCommunication_received_at());
            communication.setSentAt(raw.getCommunication_sent_at());
            communication.setSubject(raw.getCommunication_subject());
            Inject inject = new Inject();
            inject.setId(raw.getCommunication_inject());
            Exercise exercise = new Exercise();
            exercise.setId(raw.getCommunication_exercise());
            inject.setExercise(exercise);
            communication.setInject(inject);
            communication.setUsers(raw.getCommunication_users().stream().map(id -> {
              User user = new User();
              user.setId(id);
              return user;
            }).toList());
            communication.setAnimation(raw.getCommunication_animation());
            communication.setFrom(raw.getCommunication_from());
            communication.setTo(raw.getCommunication_to());
            return communication;
          }).toList()
      );

      // We set the tuple of exercise/user/team
      List<RawExerciseTeamUser> exerciseTeamUsers = mapExerciseTeamUser.get(rawTeam);
      if (exerciseTeamUsers != null) {
        teamSimple.setExerciseTeamUsers(exerciseTeamUsers.stream().map(
            ExerciseTeamUser::fromRawExerciseTeamUser
        ).collect(Collectors.toSet()));
      }

      // We set the injects linked to the scenarios
      teamSimple.setScenariosInjects(
          getInjectTeamsIds(teamSimple.getId(),
              rawTeam.getTeam_scenarios().stream().flatMap(
                  scenario -> mapInjectsByScenarioIds.get(scenario).stream()
              ).collect(Collectors.toSet()),
              injectRepository)
      );

      // We set the injects linked to the exercises
      teamSimple.setExercisesInjects(
          getInjectTeamsIds(teamSimple.getId(),
              rawTeam.getTeam_exercise_injects(),
              injectRepository)
      );

      return teamSimple;
    }).collect(Collectors.toList());
  }

  public static List<TeamSimple> rawAllTeamToSimplerAllTeam(List<RawTeam> teams) {
    // Then, for all the raw teams, we will create a simpler team object and then send it back to the front
    return teams.stream().map(rawTeam -> {
      // We create the simpler team object using the raw one
      TeamSimple teamSimple = new TeamSimple(rawTeam);

      return teamSimple;
    }).collect(Collectors.toList());
  }

  private static Set<String> getInjectTeamsIds(final String teamId, Set<String> injectIds,
      final InjectRepository injectRepository) {
    Set<RawInject> rawInjectTeams = injectRepository.findRawInjectTeams(injectIds, teamId);
    return rawInjectTeams.stream()
        .map(RawInject::getInject_id)
        .collect(Collectors.toSet());
  }

}
