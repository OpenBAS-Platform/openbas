package io.openbas.service;

import static io.openbas.config.SessionHelper.currentUser;
import static io.openbas.database.model.ExecutionTrace.traceSuccess;
import static java.time.Instant.now;

import io.openbas.contract.Contract;
import io.openbas.contract.ContractService;
import io.openbas.database.model.Execution;
import io.openbas.database.model.Inject;
import io.openbas.database.model.InjectDocument;
import io.openbas.database.model.InjectStatus;
import io.openbas.database.model.User;
import io.openbas.database.repository.InjectDocumentRepository;
import io.openbas.database.repository.InjectRepository;
import io.openbas.database.repository.InjectStatusRepository;
import io.openbas.database.repository.UserRepository;
import io.openbas.execution.ExecutableInject;
import io.openbas.execution.ExecutionContext;
import io.openbas.execution.ExecutionContextService;
import io.openbas.execution.Injector;
import io.openbas.rest.inject.form.InjectUpdateStatusInput;
import jakarta.transaction.Transactional;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;

@Service
public class InjectService {

  private ApplicationContext context;

  private ContractService contractService;
  private ExecutionContextService executionContextService;

  private UserRepository userRepository;
  private InjectRepository injectRepository;
  private InjectDocumentRepository injectDocumentRepository;
  private InjectStatusRepository injectStatusRepository;

  @Autowired
  public void setContext(ApplicationContext context) {
    this.context = context;
  }

  @Autowired
  public void setContractService(ContractService contractService) {this.contractService = contractService;}

  @Autowired
  public void setExecutionContextService(@NotNull final ExecutionContextService executionContextService) {
    this.executionContextService = executionContextService;
  }

  @Autowired
  public void setUserRepository(@NotNull final UserRepository userRepository) {this.userRepository = userRepository;}

  @Autowired
  public void setInjectRepository(InjectRepository injectRepository) {this.injectRepository = injectRepository;}

  @Autowired
  public void setInjectDocumentRepository(InjectDocumentRepository injectDocumentRepository) {this.injectDocumentRepository = injectDocumentRepository;}

  @Autowired
  public void setInjectStatusRepository(InjectStatusRepository injectStatusRepository) {this.injectStatusRepository = injectStatusRepository;}

  public void cleanInjectsDocExercise(String exerciseId, String documentId) {
    // Delete document from all exercise injects
    List<Inject> exerciseInjects = injectRepository.findAllForExerciseAndDoc(exerciseId, documentId);
    List<InjectDocument> updatedInjects = exerciseInjects.stream().flatMap(inject -> {
      @SuppressWarnings("UnnecessaryLocalVariable")
      Stream<InjectDocument> filterDocuments = inject.getDocuments().stream()
          .filter(document -> document.getDocument().getId().equals(documentId));
      return filterDocuments;
    }).toList();
    injectDocumentRepository.deleteAll(updatedInjects);
  }

  public void cleanInjectsDocScenario(String scenarioId, String documentId) {
    // Delete document from all scenario injects
    List<Inject> scenarioInjects = injectRepository.findAllForScenarioAndDoc(scenarioId, documentId);
    List<InjectDocument> updatedInjects = scenarioInjects.stream().flatMap(inject -> {
      @SuppressWarnings("UnnecessaryLocalVariable")
      Stream<InjectDocument> filterDocuments = inject.getDocuments().stream()
          .filter(document -> document.getDocument().getId().equals(documentId));
      return filterDocuments;
    }).toList();
    injectDocumentRepository.deleteAll(updatedInjects);
  }

  @Transactional
  public List<Inject> findAllAtomicTestings() {return this.injectRepository.findAllAtomicTestings();}

  @Transactional
  public Inject updateInjectStatus(String injectId, InjectUpdateStatusInput status) {
    Inject inject = injectRepository.findById(injectId).orElseThrow();
    // build status
    InjectStatus injectStatus = new InjectStatus();
    injectStatus.setInject(inject);
    injectStatus.setDate(now());
    injectStatus.setName(status.getStatus());
    injectStatus.setExecutionTime(0);
    Execution execution = new Execution(false);
    execution.addTrace(traceSuccess(currentUser().getId(), status.getMessage()));
    execution.stop();
    injectStatus.setReporting(execution);
    // Save status for inject
    inject.setStatus(injectStatus);
    return injectRepository.save(inject);
  }

  @Transactional
  public Optional<Inject> findById(String injectId) {
    return injectRepository.findWithStatusById(injectId);
  }

  @Transactional
  public InjectStatus tryAtomicTesting(String injectId) {
    return injectStatusRepository.save(tryInject(injectId));
  }

  public InjectStatus tryInject(String injectId) {
    Inject inject = injectRepository.findById(injectId).orElseThrow();
    User user = this.userRepository.findById(currentUser().getId()).orElseThrow();
    List<ExecutionContext> userInjectContexts = List.of(
        this.executionContextService.executionContext(user, inject, "Direct test")
    );
    Contract contract = contractService.resolveContract(inject);
    if (contract == null) {
      throw new UnsupportedOperationException("Unknown inject contract " + inject.getContract());
    }
    ExecutableInject injection = new ExecutableInject(false, true, inject, contract, List.of(), inject.getAssets(),
        inject.getAssetGroups(), userInjectContexts);
    Injector executor = context.getBean(contract.getConfig().getType(), Injector.class);
    Execution execution = executor.executeInjection(injection);

    return InjectStatus.fromExecution(execution, inject);
  }
}
