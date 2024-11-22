package io.openbas.injects.openbas;

import io.openbas.database.model.Inject;
import io.openbas.database.model.InjectExpectation;
import io.openbas.database.model.InjectorContract;
import io.openbas.model.inject.form.Expectation;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
public class OpenBASImplantExecutorTest {
  @Test
  void process() throws Exception {
    Expectation detection_expectation = new Expectation();
    detection_expectation.setName("The inject should be detected");
    detection_expectation.setScore(100.0);
    detection_expectation.setType(InjectExpectation.EXPECTATION_TYPE.DETECTION);

    Expectation prevention_expectation = new Expectation();
    prevention_expectation.setName("The inject should be prevented");
    prevention_expectation.setScore(100.0);
    prevention_expectation.setType(InjectExpectation.EXPECTATION_TYPE.PREVENTION);

    Inject inject = new Inject();
    inject.setInjectorContract(new InjectorContract());
  }
}
