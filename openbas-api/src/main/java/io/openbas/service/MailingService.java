package io.openbas.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.database.model.Exercise;
import io.openbas.database.model.Inject;
import io.openbas.database.model.User;
import io.openbas.database.repository.InjectorContractRepository;
import io.openbas.database.repository.UserRepository;
import io.openbas.execution.ExecutableInject;
import io.openbas.execution.ExecutionContext;
import io.openbas.execution.ExecutionContextService;
import io.openbas.execution.Injector;
import io.openbas.injects.email.EmailContract;
import io.openbas.injects.email.model.EmailContent;
import jakarta.annotation.Resource;
import jakarta.validation.constraints.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

import static io.openbas.config.SessionHelper.currentUser;


@Service
public class MailingService {

  @Resource
  protected ObjectMapper mapper;

  private ApplicationContext context;

  private UserRepository userRepository;

  private ExecutionContextService executionContextService;
  private InjectorContractRepository injectorContractRepository;

  @Autowired
  public void setUserRepository(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  @Autowired
  public void setContext(ApplicationContext context) {
    this.context = context;
  }

  @Autowired
  public void setExecutionContextService(@NotNull final ExecutionContextService executionContextService) {
    this.executionContextService = executionContextService;
  }

  @Autowired
  public void setInjectorContractRepository(@NotNull final InjectorContractRepository injectorContractRepository) {
    this.injectorContractRepository = injectorContractRepository;
  }

  public void sendEmail(String subject, String body, List<User> users, Optional<Exercise> exercise) {
    EmailContent emailContent = new EmailContent();
    emailContent.setSubject(subject);
    emailContent.setBody(body);
    Inject inject = new Inject();
    inject.setContent(this.mapper.valueToTree(emailContent));
    inject.setInjectorContract(this.injectorContractRepository.findById(EmailContract.EMAIL_DEFAULT).orElseThrow());
    inject.setUser(this.userRepository.findById(currentUser().getId()).orElseThrow());
    inject.setType(EmailContract.TYPE);
    exercise.ifPresent(inject::setExercise);
    List<ExecutionContext> userInjectContexts = users.stream().distinct()
        .map(user -> this.executionContextService.executionContext(user, inject, "Direct execution")).toList();
    ExecutableInject injection = new ExecutableInject(false, true, inject, userInjectContexts);
    Injector executor = this.context.getBean(inject.getType(), Injector.class);
    executor.executeInjection(injection);
  }

  public void sendEmail(String subject, String body, List<User> users) {
    sendEmail(subject, body, users, Optional.empty());
  }
}
