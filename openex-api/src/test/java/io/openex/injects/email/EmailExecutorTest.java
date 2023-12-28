package io.openex.injects.email;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.openex.contract.Contract;
import io.openex.database.model.Execution;
import io.openex.database.model.Inject;
import io.openex.database.model.InjectExpectation;
import io.openex.database.model.User;
import io.openex.database.repository.UserRepository;
import io.openex.execution.ExecutableInject;
import io.openex.execution.ExecutionContext;
import io.openex.injects.email.model.EmailContent;
import io.openex.model.inject.form.Expectation;
import io.openex.service.ContractService;
import io.openex.service.ExecutionContextService;
import jakarta.annotation.Resource;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static io.openex.helper.StreamHelper.fromIterable;
import static io.openex.injects.email.EmailContract.EMAIL_DEFAULT;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
public class EmailExecutorTest {

  @Autowired
  private EmailExecutor emailExecutor;

  @Autowired
  private ContractService contractService;
  @Autowired
  private UserRepository userRepository;
  @Autowired
  private ExecutionContextService executionContextService;
  @Resource
  protected ObjectMapper mapper;

  @Test
  void process() throws Exception {
    // -- PREPARE --
    EmailContent content = new EmailContent();
    content.setSubject("Subject email");
    content.setBody("A body");
    Expectation expectation = new Expectation();
    expectation.setName("The animation team can validate the audience reaction");
    expectation.setScore(10);
    expectation.setType(InjectExpectation.EXPECTATION_TYPE.MANUAL);
    content.setExpectations(List.of(expectation));
    Inject inject = new Inject();
    inject.setContract(EMAIL_DEFAULT);
    inject.setContent(this.mapper.valueToTree(content));
    Contract contract = this.contractService.resolveContract(inject);
    Iterable<User> users = this.userRepository.findAll();
    List<ExecutionContext> userInjectContexts = fromIterable(users).stream()
        .map(user -> this.executionContextService.executionContext(user, inject, "Direct execution")).toList();
    ExecutableInject executableInject = new ExecutableInject(true, true, inject, contract, List.of(), List.of(),
        userInjectContexts);
    Execution execution = new Execution(executableInject.isRuntime());

    // -- EXECUTE --
    List<io.openex.model.Expectation> expectations = this.emailExecutor.process(execution, executableInject, contract);

    // -- ASSERT --
    assertNotNull(expectations);
    assertEquals(10, expectations.get(0).getScore());
  }

}
