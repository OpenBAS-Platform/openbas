package io.openbas;

import net.jcip.annotations.NotThreadSafe;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.MockMvcPrint;
import org.springframework.boot.test.context.SpringBootTest;

@AutoConfigureMockMvc(print = MockMvcPrint.SYSTEM_ERR)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@NotThreadSafe
public abstract class IntegrationTest {}
