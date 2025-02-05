package io.openbas.service;

import static io.openbas.config.SessionHelper.currentUser;
import static io.openbas.utils.pagination.PaginationUtils.buildPaginationJPA;

import io.openbas.database.model.*;
import io.openbas.database.repository.InjectRepository;
import io.openbas.database.repository.InjectTestStatusRepository;
import io.openbas.database.repository.UserRepository;
import io.openbas.database.specification.InjectTestSpecification;
import io.openbas.execution.ExecutableInject;
import io.openbas.execution.ExecutionContext;
import io.openbas.execution.ExecutionContextService;
import io.openbas.executors.Injector;
import io.openbas.rest.exception.BadRequestException;
import io.openbas.rest.inject.output.InjectTestStatusOutput;
import io.openbas.utils.InjectMapper;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.persistence.EntityNotFoundException;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

@Service
@Log
@RequiredArgsConstructor
public class InjectTestStatusService {

  private ApplicationContext context;
  private final UserRepository userRepository;
  private final InjectRepository injectRepository;
  private final ExecutionContextService executionContextService;
  private final InjectTestStatusRepository injectTestStatusRepository;
  private final InjectMapper injectMapper;

  @Autowired
  public void setContext(ApplicationContext context) {
    this.context = context;
  }

  public InjectTestStatusOutput testInject(String injectId) {
    Inject inject =
        this.injectRepository
            .findById(injectId)
            .orElseThrow(() -> new EntityNotFoundException("Inject not found"));

    if (!inject.getInjectTestable()) {
      throw new IllegalArgumentException("Inject: " + injectId + " is not testable");
    }

    User user =
        this.userRepository
            .findById(currentUser().getId())
            .orElseThrow(() -> new EntityNotFoundException("User not found"));

    InjectTestStatus injectStatus = testInject(inject, user);
    return injectMapper.toInjectTestStatusOutput(injectStatus);
  }

  /**
   * Bulk tests of injects
   *
   * @param searchSpecifications the criteria to search injects to test
   * @return the list of inject test status
   */
  public List<InjectTestStatusOutput> bulkTestInjects(
      final Specification<Inject> searchSpecifications) {
    List<Inject> searchResult = this.injectRepository.findAll(searchSpecifications);
    if (searchResult.isEmpty()) {
      throw new BadRequestException("No inject ID is testable");
    }
    User user =
        this.userRepository
            .findById(currentUser().getId())
            .orElseThrow(() -> new EntityNotFoundException("User not found"));

    List<InjectTestStatus> results = new ArrayList<>();
    searchResult.forEach(inject -> results.add(testInject(inject, user)));
    return results.stream().map(injectMapper::toInjectTestStatusOutput).toList();
  }

  public Page<InjectTestStatusOutput> findAllInjectTestsByExerciseId(
      String exerciseId, SearchPaginationInput searchPaginationInput) {
    return buildPaginationJPA(
            (Specification<InjectTestStatus> specification, Pageable pageable) ->
                injectTestStatusRepository.findAll(
                    InjectTestSpecification.findInjectTestInExercise(exerciseId).and(specification),
                    pageable),
            searchPaginationInput,
            InjectTestStatus.class)
        .map(injectMapper::toInjectTestStatusOutput);
  }

  public Page<InjectTestStatusOutput> findAllInjectTestsByScenarioId(
      String scenarioId, SearchPaginationInput searchPaginationInput) {
    return buildPaginationJPA(
            (Specification<InjectTestStatus> specification, Pageable pageable) ->
                injectTestStatusRepository.findAll(
                    InjectTestSpecification.findInjectTestInScenario(scenarioId).and(specification),
                    pageable),
            searchPaginationInput,
            InjectTestStatus.class)
        .map(injectMapper::toInjectTestStatusOutput);
  }

  public InjectTestStatusOutput findInjectTestStatusById(String testId) {
    return injectMapper.toInjectTestStatusOutput(
        injectTestStatusRepository.findById(testId).orElseThrow());
  }

  // -- PRIVATE --

  private InjectTestStatus testInject(Inject inject, User user) {
    ExecutionContext userInjectContext =
        this.executionContextService.executionContext(user, inject, "Direct test");

    Injector executor =
        context.getBean(
            inject
                .getInjectorContract()
                .map(contract -> contract.getInjector().getType())
                .orElseThrow(() -> new EntityNotFoundException("Injector contract not found")),
            Injector.class);

    ExecutableInject injection =
        new ExecutableInject(
            false,
            true,
            inject,
            List.of(),
            inject.getAssets(),
            inject.getAssetGroups(),
            List.of(userInjectContext));
    Execution execution = executor.executeInjection(injection);

    InjectTestStatus injectTestStatus =
        this.injectTestStatusRepository
            .findByInject(inject)
            .map(
                existingStatus -> {
                  InjectTestStatus updatedStatus = InjectTestStatus.fromExecutionTest(execution);
                  updatedStatus.setId(existingStatus.getId());
                  updatedStatus.setTestCreationDate(existingStatus.getTestCreationDate());
                  updatedStatus.setInject(inject);
                  return updatedStatus;
                })
            .orElseGet(
                () -> {
                  InjectTestStatus newStatus = InjectTestStatus.fromExecutionTest(execution);
                  newStatus.setInject(inject);
                  return newStatus;
                });

    return this.injectTestStatusRepository.save(injectTestStatus);
  }

  public void deleteInjectTest(String testId) {
    injectTestStatusRepository.deleteById(testId);
  }
}
