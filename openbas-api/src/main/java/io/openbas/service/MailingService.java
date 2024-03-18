package io.openbas.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.contract.Contract;
import io.openbas.contract.ContractService;
import io.openbas.database.model.Exercise;
import io.openbas.database.model.Inject;
import io.openbas.database.model.User;
import io.openbas.database.repository.UserRepository;
import io.openbas.execution.ExecutableInject;
import io.openbas.execution.ExecutionContext;
import io.openbas.execution.ExecutionContextService;
import io.openbas.execution.Injector;
import io.openbas.injects.email.EmailContract;
import io.openbas.injects.email.model.EmailContent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;

import jakarta.annotation.Resource;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.Optional;

import static io.openbas.config.SessionHelper.currentUser;


@Service
public class MailingService {

  @Resource
  protected ObjectMapper mapper;

  private ContractService contractService;

  private ApplicationContext context;

  private UserRepository userRepository;

  private ExecutionContextService executionContextService;

  @Autowired
  public void setUserRepository(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  @Autowired
  public void setContext(ApplicationContext context) {
    this.context = context;
  }

  @Autowired
  public void setContractService(ContractService contractService) {
    this.contractService = contractService;
  }

  @Autowired
  public void setExecutionContextService(@NotNull final ExecutionContextService executionContextService) {
    this.executionContextService = executionContextService;
  }

  public void sendEmail(String subject, String body, List<User> users, Optional<Exercise> exercise) {
    EmailContent emailContent = new EmailContent();
    emailContent.setSubject(subject);
    emailContent.setBody(body);
    Inject inject = new Inject();
    inject.setContent(this.mapper.valueToTree(emailContent));
    inject.setContract(EmailContract.EMAIL_DEFAULT);
    inject.setUser(this.userRepository.findById(currentUser().getId()).orElseThrow());
    Contract contract = this.contractService.resolveContract(inject);
    if (contract == null) {
      throw new UnsupportedOperationException("Unknown inject contract " + inject.getContract());
    }
    inject.setType(contract.getConfig().getType());
    exercise.ifPresent(inject::setExercise);
    List<ExecutionContext> userInjectContexts = users.stream().distinct()
        .map(user -> this.executionContextService.executionContext(user, inject, "Direct execution")).toList();
    ExecutableInject injection = new ExecutableInject(false, true, inject, contract, userInjectContexts);
    Injector executor = this.context.getBean(contract.getConfig().getType(), Injector.class);
    executor.executeInjection(injection);
  }

  public void sendEmail(String subject, String body, List<User> users) {
    sendEmail(subject, body, users, Optional.empty());
  }
}
