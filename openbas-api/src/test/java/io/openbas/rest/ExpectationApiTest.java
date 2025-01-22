package io.openbas.rest;

import static org.junit.jupiter.api.TestInstance.Lifecycle.PER_CLASS;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;

import io.openbas.IntegrationTest;
import io.openbas.database.model.*;
import io.openbas.database.repository.*;
import io.openbas.utils.fixtures.*;
import io.openbas.utils.mockUser.WithMockAdminUser;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.MockMvc;

@TestInstance(PER_CLASS)
public class ExpectationApiTest extends IntegrationTest {

  public static final String API_EXPECTATIONS = "/api/expectations/";
  public static final String API_INJECTS_EXPECTATIONS = "/api/injects/expectations";

  private MockMvc mvc;
  @Autowired private InjectRepository injectRepository;
  @Autowired private InjectStatusRepository injectStatusRepository;
  @Autowired private InjectExpectationRepository injectExpectationRepository;

  @BeforeAll
  void beforeAll() {
    /*Inject inject = injectRepository.save(InjectFixture.createInject());
       AssetGroup assetGroup = AssetGroupFixture.createDefaultAssetGroup();
       Asset asset = AssetFixture.createDefaultAsset();
       Agent agent = AgentFixture.createAgent();

       InjectExpectation detectionInjectExpectation = injectExpectationRepository.save(InjectExpectationFixture.createDetectionInjectExpectation());
       InjectExpectation preventionInjectExpectation = injectExpectationRepository.save(InjectExpectationFixture.createPreventionInjectExpectation());
    */ }

  @Test
  @DisplayName("Update expectation result")
  void updateInjectExpectationResults() throws Exception {}

  @Test
  @DisplayName("Delete expectation result")
  void deleteInjectExpectationResult() throws Exception {}

  @Test
  @DisplayName("Get Inject Expectations for a Specific Source")
  @WithMockAdminUser
  void getInjectExpectationsAssetsNotFilledForSource() throws Exception {}

  @Test
  @DisplayName("Get Prevention Inject Expectations for a Specific Source")
  @WithMockAdminUser
  void getInjectPreventionExpectationsNotFilledForSource() throws Exception {}

  @Test
  @DisplayName("Get Detection Inject Expectations for a Specific Source")
  @WithMockAdminUser
  void getInjectDetectionExpectationsNotFilledForSource() throws Exception {}

  @Test
  @DisplayName("Update Inject expectation")
  @WithMockAdminUser
  void updateInjectExpectation() throws Exception {}

  @AfterAll
  void afterAll() {
    injectStatusRepository.deleteAll();
    injectRepository.deleteAll();
  }
}
