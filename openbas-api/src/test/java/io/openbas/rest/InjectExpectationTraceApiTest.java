package io.openbas.rest;

import static io.openbas.rest.inject_expectation_trace.InjectExpectationTraceApi.INJECT_EXPECTATION_TRACES_URI;
import static io.openbas.utils.JsonUtils.asJsonString;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.TestInstance.Lifecycle.PER_CLASS;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.jayway.jsonpath.JsonPath;
import io.openbas.IntegrationTest;
import io.openbas.database.model.*;
import io.openbas.database.model.SecurityPlatform.SECURITY_PLATFORM_TYPE;
import io.openbas.database.repository.*;
import io.openbas.rest.inject_expectation_trace.form.InjectExpectationTraceInput;
import io.openbas.utils.fixtures.AssetFixture;
import io.openbas.utils.fixtures.InjectExpectationFixture;
import io.openbas.utils.fixtures.InjectFixture;
import io.openbas.utils.mockUser.WithMockAdminUser;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@TestInstance(PER_CLASS)
@Transactional
class InjectExpectationTraceApiTest extends IntegrationTest {

  @Autowired private MockMvc mvc;
  @Autowired private InjectRepository injectRepository;
  @Autowired private CollectorRepository collectorRepository;
  @Autowired private SecurityPlatformRepository securityPlatformRepository;
  @Autowired private InjectExpectationRepository injectExpectationRepository;
  @Autowired private InjectExpectationTraceRepository injectExpectationTraceRepository;
  @Autowired private AssetRepository assetRepository;

  private Collector savedCollector;
  private Inject savedInject;
  private InjectExpectation savedInjectExpectation;
  private Asset savedAsset;
  private SecurityPlatform savedSecurityPlatform;
  private InjectExpectationTrace savedInjectExpectationTrace1;
  private InjectExpectationTrace savedInjectExpectationTrace2;

  @BeforeEach
  void beforeEach() {
    savedAsset = assetRepository.save(AssetFixture.createDefaultAsset("test"));

    SecurityPlatform sp = new SecurityPlatform();
    sp.setExternalReference(UUID.randomUUID().toString());
    sp.setName("sp-name");
    sp.setSecurityPlatformType(SECURITY_PLATFORM_TYPE.SIEM);
    savedSecurityPlatform = securityPlatformRepository.save(sp);

    Collector collector = new Collector();
    collector.setId(UUID.randomUUID().toString());
    collector.setName("collector-name");
    collector.setSecurityPlatform(savedSecurityPlatform);
    collector.setType("type");
    collector.setExternal(true);
    savedCollector = collectorRepository.save(collector);

    Inject i = InjectFixture.getDefaultInject();
    i.setAssets(List.of(savedAsset));
    savedInject = injectRepository.save(i);

    InjectExpectation ie =
        InjectExpectationFixture.createDetectionInjectExpectation(null, savedInject);
    ie.setAsset(savedAsset);
    savedInjectExpectation = injectExpectationRepository.save(ie);

    InjectExpectationTrace iet1 = new InjectExpectationTrace();
    iet1.setInjectExpectation(savedInjectExpectation);
    iet1.setSecurityPlatform(savedSecurityPlatform);
    iet1.setAlertDate(Instant.now());
    iet1.setAlertLink("http://test-link.com");
    iet1.setAlertName("Test Alert 1");
    savedInjectExpectationTrace1 = injectExpectationTraceRepository.save(iet1);

    InjectExpectationTrace iet2 = new InjectExpectationTrace();
    iet2.setInjectExpectation(savedInjectExpectation);
    iet2.setSecurityPlatform(savedSecurityPlatform);
    iet2.setAlertDate(Instant.now());
    iet2.setAlertLink("http://test-link.com");
    iet2.setAlertName("Test Alert 2");
    savedInjectExpectationTrace2 = injectExpectationTraceRepository.save(iet2);
  }

  @DisplayName("Create an inject expectation trace for a collector")
  @Test
  @WithMockAdminUser
  void createInjectExpectationTraceForCollector_Success() throws Exception {
    // --PREPARE--
    InjectExpectationTraceInput input = new InjectExpectationTraceInput();
    input.setInjectExpectationId(savedInjectExpectation.getId());
    input.setAlertDate(Instant.now());
    input.setAlertLink("http://fake-link.com");
    input.setSourceId(savedCollector.getId());
    input.setAlertName("Test Alert");

    // --EXECUTE--
    String response =
        mvc.perform(
                post(INJECT_EXPECTATION_TRACES_URI)
                    .content(asJsonString(input))
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();

    // --ASSERT--
    assertEquals(
        savedInjectExpectation.getId(),
        JsonPath.read(response, "$.inject_expectation_trace_expectation"));
    assertEquals(
        savedSecurityPlatform.getId(),
        JsonPath.read(response, "$.inject_expectation_trace_source_id"));
  }

  @DisplayName("Get the traces for a collector")
  @Test
  @WithMockAdminUser
  void getInjectExpectationTracesForCollector() throws Exception {
    // --EXECUTE--
    String response =
        mvc.perform(
                get(INJECT_EXPECTATION_TRACES_URI
                        + "?injectExpectationId="
                        + savedInjectExpectation.getId()
                        + "&sourceId="
                        + savedCollector.getId())
                    .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();

    // --ASSERT--
    assertEquals(
        savedInjectExpectationTrace1.getId(),
        JsonPath.read(response, "$[0].inject_expectation_trace_id"));
    assertEquals(
        savedInjectExpectationTrace2.getId(),
        JsonPath.read(response, "$[1].inject_expectation_trace_id"));
    assertEquals(
        savedSecurityPlatform.getId(),
        JsonPath.read(response, "$[0].inject_expectation_trace_source_id"));
    assertEquals(
        savedSecurityPlatform.getId(),
        JsonPath.read(response, "$[1].inject_expectation_trace_source_id"));
  }

  @DisplayName("Count expectation traces for a collector")
  @Test
  @WithMockAdminUser
  void countInjectExpectationTracesForCollector() throws Exception {
    // --EXECUTE--
    String response =
        mvc.perform(
                get(INJECT_EXPECTATION_TRACES_URI
                        + "/count?injectExpectationId="
                        + savedInjectExpectation.getId()
                        + "&sourceId="
                        + savedSecurityPlatform.getExternalReference()
                        + "&expectationResultSourceType=collector")
                    .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();

    // --ASSERT--
    assertEquals(2, Integer.parseInt(response));
  }

  @DisplayName(
      "Count expectation traces for other source than a collector, with an ivalid sourceId given")
  @Test
  @WithMockAdminUser
  void countInjectExpectationTracesForOthers_0() throws Exception {
    // --EXECUTE--
    String response =
        mvc.perform(
                get(INJECT_EXPECTATION_TRACES_URI
                        + "/count?injectExpectationId="
                        + savedInjectExpectation.getId()
                        + "&sourceId="
                        + savedSecurityPlatform.getExternalReference()
                        + "&expectationResultSourceType=other")
                    .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();

    // --ASSERT--
    assertEquals(0, Integer.parseInt(response));
  }

  @DisplayName(
      "Count expectation traces for other source than a collector, with a valid sourceId given")
  @Test
  @WithMockAdminUser
  void countInjectExpectationTracesForOthers() throws Exception {
    // --EXECUTE--
    String response =
        mvc.perform(
                get(INJECT_EXPECTATION_TRACES_URI
                        + "/count?injectExpectationId="
                        + savedInjectExpectation.getId()
                        + "&sourceId="
                        + savedSecurityPlatform.getId()
                        + "&expectationResultSourceType=other")
                    .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();

    // --ASSERT--
    assertEquals(2, Integer.parseInt(response));
  }
}
