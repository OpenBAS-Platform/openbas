package io.openbas.injects.email;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.contract.Contract;
import io.openbas.database.model.Execution;
import io.openbas.database.model.Inject;
import io.openbas.database.model.InjectExpectation;
import io.openbas.database.model.User;
import io.openbas.database.repository.UserRepository;
import io.openbas.execution.ExecutableInject;
import io.openbas.execution.ExecutionContext;
import io.openbas.injects.email.model.EmailContent;
import io.openbas.model.inject.form.Expectation;
import io.openbas.service.ContractService;
import io.openbas.execution.ExecutionContextService;
import jakarta.annotation.Resource;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static io.openbas.helper.StreamHelper.fromIterable;
import static io.openbas.injects.email.EmailContract.EMAIL_DEFAULT;
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
    ExecutableInject executableInject = new ExecutableInject(true, true, inject, contract, userInjectContexts);
    Execution execution = new Execution(executableInject.isRuntime());

    // -- EXECUTE --
    List<io.openbas.model.Expectation> expectations = this.emailExecutor.process(execution, executableInject, contract);

    // -- ASSERT --
    assertNotNull(expectations);
    assertEquals(10, expectations.get(0).getScore());
  }

}
