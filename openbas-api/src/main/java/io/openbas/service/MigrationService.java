package io.openbas.service;

import io.openbas.database.model.InjectExpectation;
import io.openbas.database.raw.RawInjectExpectation;
import io.openbas.database.repository.InjectExpectationRepository;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.apache.commons.beanutils.BeanUtils;
import org.springframework.stereotype.Service;

@Log
@RequiredArgsConstructor
@Service
public class MigrationService {

  private final InjectExpectationRepository injectExpectationRepository;

  public void processExpectations() {
    log.info("Process expectations started.");

    Set<RawInjectExpectation> rawInjectExpectations = injectExpectationRepository.rawAll();
    log.info("Fetched " + rawInjectExpectations.size() + " raw expectations.");

    Map<String, List<RawInjectExpectation>> groupedExpectations =
        rawInjectExpectations.stream()
            .filter(e -> e.getTeam_id() != null)
            .collect(
                Collectors.groupingBy(
                    e ->
                        e.getInject_id()
                            + "|"
                            + e.getTeam_id()
                            + "|"
                            + e.getInject_expectation_type()));

    log.info("Grouped expectations into " + groupedExpectations.size() + " groups.");

    Set<InjectExpectation> expectationsToCreate = new HashSet<>();
    processGroupedExpectations(groupedExpectations, expectationsToCreate);

    log.info("Saving " + expectationsToCreate.size() + " expectations to the repository.");
    injectExpectationRepository.saveAll(expectationsToCreate);
    log.info("Successfully saved expectations.");
  }

  private void processGroupedExpectations(
      Map<String, List<RawInjectExpectation>> groupedExpectations,
      Set<InjectExpectation> expectationsToCreate) {
    for (Map.Entry<String, List<RawInjectExpectation>> entry : groupedExpectations.entrySet()) {
      String groupKey = entry.getKey();
      List<RawInjectExpectation> expectationList = entry.getValue();

      log.fine("Processing group: " + groupKey);
      log.fine("Expectations in this group: " + expectationList.size());

      boolean requireTeamExpectation =
          expectationList.stream().noneMatch(e -> e.getUser_id() == null);
      boolean requireUserExpectation =
          expectationList.stream().noneMatch(e -> e.getUser_id() != null);

      if (requireTeamExpectation) {
        log.info("Creating team expectation for group: " + groupKey);
        InjectExpectation newInjectExpectation = new InjectExpectation();
        BeanUtils.copyProperties(
            newInjectExpectation, expectationList.stream().findAny().orElse(null));
        newInjectExpectation.setUser(null);
        expectationsToCreate.add(newInjectExpectation);
      }
      if (requireUserExpectation) {
        log.info("Creating user expectation for group: " + groupKey);
        InjectExpectation newInjectExpectation = new InjectExpectation();
        BeanUtils.copyProperties(
            newInjectExpectation, expectationList.stream().findAny().orElse(null));
        expectationsToCreate.add(newInjectExpectation);
      }
    }
  }
}
