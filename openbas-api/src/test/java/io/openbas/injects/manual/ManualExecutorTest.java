package io.openbas.injects.manual;

import io.openbas.injectors.manual.ManualExecutor;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
public class ManualExecutorTest {

  @Autowired private ManualExecutor manualExecutor;

  @Test
  void process() {
    UnsupportedOperationException error = null;
    try {
      this.manualExecutor.process(null, null);
    } catch (UnsupportedOperationException e) {
      error = e;
    }
    Assertions.assertNotNull(error);
    Assertions.assertEquals("Manual inject cannot be executed", error.getMessage());
  }
}
