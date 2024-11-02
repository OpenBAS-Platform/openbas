package io.openbas.service;

import io.openbas.database.model.InjectExpectation;
import io.openbas.database.model.User;
import io.openbas.database.repository.InjectExpectationRepository;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.utils.CopyObjectListUtils;
import java.lang.reflect.InvocationTargetException;
import java.util.*;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
@Log
public class MigrationService {

  private static final String MIGRATION_PROCESS_EXPECTATIONS = "Migration process expectations";

  private final InjectService injectService;
  private final InjectExpectationRepository injectExpectationRepository;

  public void processExpectations() throws InvocationTargetException, IllegalAccessException {
    log.info("Process expectations started.");

    Set<InjectExpectation> injectExpectations = injectExpectationRepository.findAll();
    log.info("Fetched " + injectExpectations.size() + " expectations.");

    Map<String, List<InjectExpectation>> groupedExpectations =
        injectExpectations.stream()
            .filter(e -> e.getTeam() != null)
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
      log.info("Expectations in this : " + expectationList.size());

      boolean requireTeamExpectation = expectationList.stream().noneMatch(e -> e.getUser() == null);
      boolean requireUserExpectation = expectationList.stream().noneMatch(e -> e.getUser() != null);

      if (requireTeamExpectation) {
        log.info("Creating team expectation for : " + groupKey);
        InjectExpectation newInjectExpectation =
            CopyObjectListUtils.copyObjectWithoutId(
                expectationList.stream().findAny().orElseThrow(ElementNotFoundException::new),
                InjectExpectation.class);
        newInjectExpectation.setId(UUID.randomUUID().toString());
        newInjectExpectation.setUser(null);
        expectationsToCreate.add(newInjectExpectation);
      }
      if (requireUserExpectation) {
        log.info("Creating user expectation for : " + groupKey);
        InjectExpectation newInjectExpectation =
            CopyObjectListUtils.copyObjectWithoutId(
                expectationList.stream().findAny().orElseThrow(ElementNotFoundException::new),
                InjectExpectation.class);
        newInjectExpectation.setId(UUID.randomUUID().toString());
        List<User> users = expectationList.getFirst().getTeam().getUsers();
        if (!users.isEmpty()) {
          newInjectExpectation.setUser(users.get(0));
          expectationsToCreate.add(newInjectExpectation);
        } else {
          injectService.tryInject(expectationList.getFirst().getInject().getId());
        }
      }
    }
  }
}
