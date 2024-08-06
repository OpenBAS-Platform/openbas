package io.openbas.service;

import io.openbas.database.model.*;
import io.openbas.database.repository.InjectRepository;
import io.openbas.database.repository.InjectTestStatusRepository;
import io.openbas.database.repository.UserRepository;
import io.openbas.execution.ExecutableInject;
import io.openbas.execution.ExecutionContext;
import io.openbas.execution.ExecutionContextService;
import io.openbas.execution.Injector;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

import static io.openbas.config.SessionHelper.currentUser;

@Service
@Log
@RequiredArgsConstructor
public class InjectTestStatusService {

  private ApplicationContext context;
  private final UserRepository userRepository;
  private final InjectRepository injectRepository;
  private final ExecutionContextService executionContextService;
  private final InjectTestStatusRepository injectTestStatusRepository;

  @Autowired
  public void setContext(ApplicationContext context) {
    this.context = context;
  }

  @Transactional
  public InjectTestStatus testInject(String injectId) {
    Inject inject = injectRepository.findById(injectId).orElseThrow();
    User user = this.userRepository.findById(currentUser().getId()).orElseThrow();
    List<ExecutionContext> userInjectContexts = List.of(
        this.executionContextService.executionContext(user, inject, "Direct test")
    );
    Injector executor = context.getBean(
        inject.getInjectorContract().map(injectorContract -> injectorContract.getInjector().getType()).orElseThrow(),
        io.openbas.execution.Injector.class);
    ExecutableInject injection = new ExecutableInject(false, true, inject, List.of(), inject.getAssets(),
        inject.getAssetGroups(), userInjectContexts);
    Execution execution = executor.executeInjection(injection);

    //Save inject test status
    Optional<InjectTestStatus> injectTestStatus = this.injectTestStatusRepository.findByInject(inject);
    InjectTestStatus injectTestStatusToSave = InjectTestStatus.fromExecutionTest(execution);
    injectTestStatus.ifPresent(testStatus -> {
      injectTestStatusToSave.setId(testStatus.getId());
      injectTestStatusToSave.setTestCreationDate(testStatus.getTestCreationDate());
    });
    injectTestStatusToSave.setInject(inject);
    this.injectTestStatusRepository.save(injectTestStatusToSave);

    return injectTestStatusToSave;
  }

}
