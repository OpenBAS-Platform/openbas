package io.openbas.injects.email;

import static io.openbas.helper.StreamHelper.fromIterable;
import static io.openbas.injectors.email.EmailContract.EMAIL_DEFAULT;
import static org.junit.jupiter.api.Assertions.assertEquals;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.database.model.Execution;
import io.openbas.database.model.Inject;
import io.openbas.database.model.InjectExpectation;
import io.openbas.database.model.User;
import io.openbas.database.repository.InjectExpectationRepository;
import io.openbas.database.repository.InjectorContractRepository;
import io.openbas.database.repository.UserRepository;
import io.openbas.execution.ExecutableInject;
import io.openbas.execution.ExecutionContext;
import io.openbas.execution.ExecutionContextService;
import io.openbas.injectors.email.EmailExecutor;
import io.openbas.injectors.email.model.EmailContent;
import io.openbas.model.inject.form.Expectation;
import jakarta.annotation.Resource;
import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
public class EmailExecutorTest {

  @Autowired private EmailExecutor emailExecutor;
  @Autowired private UserRepository userRepository;
  @Autowired private InjectorContractRepository injectorContractRepository;
  @Autowired private InjectExpectationRepository injectExpectationRepository;
  @Autowired private ExecutionContextService executionContextService;
  @Resource protected ObjectMapper mapper;

  @Test
  void process() throws Exception {
    // -- PREPARE --
    EmailContent content = new EmailContent();
    content.setSubject("Subject email");
    content.setBody("A body");
    Expectation expectation = new Expectation();
    expectation.setName("The animation team can validate the audience reaction");
    expectation.setScore(10.0);
    expectation.setType(InjectExpectation.EXPECTATION_TYPE.MANUAL);
    content.setExpectations(List.of(expectation));
    Inject inject = new Inject();
    inject.setInjectorContract(
        this.injectorContractRepository.findById(EMAIL_DEFAULT).orElseThrow());
    inject.setContent(this.mapper.valueToTree(content));
    Iterable<User> users = this.userRepository.findAll();
    List<ExecutionContext> userInjectContexts =
        fromIterable(users).stream()
            .map(
                user ->
                    this.executionContextService.executionContext(user, inject, "Direct execution"))
            .toList();
    ExecutableInject executableInject =
        new ExecutableInject(true, true, inject, userInjectContexts);
    Execution execution = new Execution(executableInject.isRuntime());

    // -- EXECUTE --
    emailExecutor.process(execution, executableInject);

    // -- ASSERT --
    // No injectExpectation should be created.
    assertEquals(Collections.emptyList(), injectExpectationRepository.findAll());
  }
}
