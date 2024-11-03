package io.openbas.service;

import io.openbas.database.model.InjectExpectation;
import io.openbas.database.model.Team;
import io.openbas.database.model.User;
import io.openbas.database.repository.InjectExpectationRepository;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.utils.CopyObjectListUtils;
import java.util.*;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.jetbrains.annotations.NotNull;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
@Log
public class MigrationService {

  private final InjectService injectService;
  private final InjectExpectationRepository injectExpectationRepository;

  public void processExpectations() {
    log.info("Process expectations started.");
    List<InjectExpectation> injectExpectations = injectExpectationRepository.findAll();

    if (injectExpectations == null || injectExpectations.isEmpty()) {
      log.info("No expectations found.");
      return;
    }

    log.info("Fetched " + injectExpectations.size() + " expectations.");

    Map<String, List<InjectExpectation>> groupedExpectations =
        injectExpectations.stream()
            .filter(e -> e.getTeam() != null && e.getInject() != null)
            .collect(
                Collectors.groupingBy(
                    e -> e.getInject().getId() + "|" + e.getTeam().getId() + "|" + e.getName()));

    log.info("Grouped expectations into " + groupedExpectations.size() + " groups.");

    Set<InjectExpectation> expectationsToCreate = new HashSet<>();
    processGroupedExpectations(groupedExpectations, expectationsToCreate);

    log.info("Saving " + expectationsToCreate.size() + " expectations to the repository.");
    injectExpectationRepository.saveAll(expectationsToCreate);
    log.info("Successfully saved expectations.");
  }

  private void processGroupedExpectations(
      Map<String, List<InjectExpectation>> groupedExpectations,
      Set<InjectExpectation> expectationsToCreate) {

    for (Map.Entry<String, List<InjectExpectation>> entry : groupedExpectations.entrySet()) {
      String groupKey = entry.getKey();
      List<InjectExpectation> expectationList = entry.getValue();

      log.info("Processing group: " + groupKey);
      log.info("Expectations in this group: " + expectationList.size());

      boolean requireTeamExpectation = expectationList.stream().noneMatch(e -> e.getUser() == null);
      boolean requireUserExpectation = expectationList.stream().noneMatch(e -> e.getUser() != null);

      if (requireTeamExpectation) {
        log.info("Creating team expectation for: " + groupKey);
        InjectExpectation newInjectExpectation = getNewInjectExpectation(expectationList);
        newInjectExpectation.setUser(null);
        expectationsToCreate.add(newInjectExpectation);
      }

      if (requireUserExpectation) {
        // We verify that the team has at least one player
        Team team = expectationList.get(0).getTeam();
        if (team != null) {
          List<User> users = team.getUsers();
          if (users != null && !users.isEmpty()) {
            log.info("Creating user expectation for: " + groupKey);
            InjectExpectation newInjectExpectation = getNewInjectExpectation(expectationList);
            newInjectExpectation.setUser(users.get(0));
            expectationsToCreate.add(newInjectExpectation);
          } else {
            String injectId = expectationList.get(0).getInject().getId();
            if (injectId != null) {
              // Since the team has no users, we run this inject to synchronize the expectations
              // with the current model
              injectService.tryInject(injectId);
            }
          }
        }
      }
    }
  }

  private InjectExpectation getNewInjectExpectation(List<InjectExpectation> expectationList) {
    InjectExpectation newInjectExpectation =
        CopyObjectListUtils.copyObjectWithoutId(
            expectationList.stream()
                .findAny()
                .orElseThrow(() -> new ElementNotFoundException("No expectations available.")),
            InjectExpectation.class);
    newInjectExpectation.setId(UUID.randomUUID().toString());
    return newInjectExpectation;
  }
}
