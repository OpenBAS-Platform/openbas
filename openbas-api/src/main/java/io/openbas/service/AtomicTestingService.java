package io.openbas.service;

import io.openbas.database.model.Inject;
import io.openbas.database.model.InjectStatus;
import io.openbas.database.model.User;
import io.openbas.database.repository.InjectRepository;
import io.openbas.database.repository.InjectStatusRepository;
import io.openbas.database.repository.UserRepository;
import io.openbas.execution.ExecutableInject;
import io.openbas.execution.ExecutionContext;
import io.openbas.execution.ExecutionContextService;
import io.openbas.execution.Executor;
import jakarta.transaction.Transactional;
import jakarta.validation.constraints.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

import static io.openbas.config.SessionHelper.currentUser;

@Service
public class AtomicTestingService {

  private Executor executor;
  private ExecutionContextService executionContextService;
  private InjectRepository injectRepository;
  private InjectStatusRepository injectStatusRepository;
  private UserRepository userRepository;

  @Autowired
  public void setExecutor(Executor executor) {
    this.executor = executor;
  }

  @Autowired
  public void setExecutionContextService(@NotNull final ExecutionContextService executionContextService) {
    this.executionContextService = executionContextService;
  }

  @Autowired
  public void setInjectRepository(InjectRepository injectRepository) {
    this.injectRepository = injectRepository;
  }

  @Autowired
  public void setInjectStatusRepository(InjectStatusRepository injectStatusRepository) {
    this.injectStatusRepository = injectStatusRepository;
  }

  @Autowired
  public void setUserRepository(@NotNull final UserRepository userRepository) {
    this.userRepository = userRepository;
  }


  @Transactional
  public List<Inject> findAllAtomicTestings() {
    return this.injectRepository.findAllAtomicTestings();
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
    ExecutableInject injection = new ExecutableInject(false, true, inject, List.of(), inject.getAssets(),
        inject.getAssetGroups(), userInjectContexts);
    // TODO Must be migrated to Atomic approach (Inject duplication and async tracing)
    return executor.execute(injection);
  }

  public void deleteAtomicTesting(String injectId) {
    //TODO
    injectRepository.deleteById(injectId);
  }

}
