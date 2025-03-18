package io.openbas.utils;

import static io.openbas.database.model.InjectExpectationSignature.EXPECTATION_SIGNATURE_TYPE_PARENT_PROCESS_NAME;
import static io.openbas.utils.ExpectationUtils.*;
import static org.junit.jupiter.api.Assertions.assertEquals;

import io.openbas.database.model.*;
import io.openbas.model.expectation.DetectionExpectation;
import io.openbas.model.expectation.PreventionExpectation;
import io.openbas.utils.fixtures.*;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ExpectationUtilsTest {

  @Test
  @DisplayName("Build expectations with the signature parent process name for obas implant")
  void shouldBuildExpectationsWithSignatureParentProcessNameForObasImplant_Prevention() {
    // -- PREPARE --
    Endpoint endpoint = EndpointFixture.createEndpoint();
    Agent agent = AgentFixture.createAgent(endpoint, "ext");
    agent.setId("agentId");
    endpoint.setAgents(List.of(agent));
    InjectorContract injectorContract = InjectorContractFixture.createDefaultInjectorContract();
    Inject inject = InjectFixture.createTechnicalInject(injectorContract, "Inject", endpoint);
    inject.setId("injectId");
    PreventionExpectation preventionExpectation =
        ExpectationFixture.createTechnicalPreventionExpectationForAsset(endpoint, 60L);
    DetectionExpectation detectionExpectation =
        ExpectationFixture.createTechnicalDetectionExpectationForAsset(endpoint, 60L);

    // -- EXECUTE --
    List<PreventionExpectation> preventionExpectations =
        getPreventionExpectationList(endpoint, null, inject, preventionExpectation);

    List<DetectionExpectation> detectionExpectations =
        getDetectionExpectationList(endpoint, null, inject, detectionExpectation);

    // -- ASSERT --
    InjectExpectationSignature signature =
        InjectExpectationSignature.builder()
            .type(EXPECTATION_SIGNATURE_TYPE_PARENT_PROCESS_NAME)
            .value("obas-implant-injectId-agent-agentId")
            .build();

    assertEquals(1, preventionExpectations.size());
    assertEquals(1, detectionExpectations.size());

    assertEquals(PreventionExpectation.class, preventionExpectations.getFirst().getClass());
    assertEquals(DetectionExpectation.class, detectionExpectations.getFirst().getClass());

    assertEquals(
        signature,
        preventionExpectations.stream()
            .flatMap(prev -> prev.getInjectExpectationSignatures().stream())
            .toList()
            .getFirst());

    assertEquals(
        signature,
        detectionExpectations.stream()
            .flatMap(det -> det.getInjectExpectationSignatures().stream())
            .toList()
            .getFirst());
  }

  @Test
  @DisplayName("Build expectations with the signature parent process name for caldera implant")
  void shouldBuildExpectationsWithSignatureParentProcessNameForCalderaImplant() {
    // -- PREPARE --
    Endpoint endpoint = EndpointFixture.createEndpoint();
    InjectorContract injectorContract = InjectorContractFixture.createDefaultInjectorContract();
    Inject inject = InjectFixture.createTechnicalInject(injectorContract, "Inject", endpoint);
    inject.setId("injectId");
    Agent agentParent = AgentFixture.createAgent(endpoint, "ext-parent");
    agentParent.setId("agentParentId");
    Agent agent = AgentFixture.createAgent(endpoint, "ext");
    agent.setId("agentId");
    agent.setInject(inject);
    agent.setParent(agentParent);

    PreventionExpectation preventionExpectation =
        ExpectationFixture.createTechnicalPreventionExpectationForAsset(endpoint, 60L);
    DetectionExpectation detectionExpectation =
        ExpectationFixture.createTechnicalDetectionExpectationForAsset(endpoint, 60L);

    // -- EXECUTE --
    List<PreventionExpectation> preventionExpectations =
        getPreventionExpectationListForCaldera(
            endpoint, null, List.of(agent), preventionExpectation);

    List<DetectionExpectation> detectionExpectations =
        getDetectionExpectationListForCaldera(endpoint, null, List.of(agent), detectionExpectation);

    // -- ASSERT --
    InjectExpectationSignature signature =
        InjectExpectationSignature.builder()
            .type(EXPECTATION_SIGNATURE_TYPE_PARENT_PROCESS_NAME)
            .value("obas-implant-caldera-injectId-agent-agentParentId")
            .build();

    assertEquals(1, preventionExpectations.size());
    assertEquals(1, detectionExpectations.size());

    assertEquals(PreventionExpectation.class, preventionExpectations.getFirst().getClass());
    assertEquals(DetectionExpectation.class, detectionExpectations.getFirst().getClass());

    assertEquals(
        signature,
        preventionExpectations.stream()
            .flatMap(prev -> prev.getInjectExpectationSignatures().stream())
            .toList()
            .getFirst());

    assertEquals(
        signature,
        detectionExpectations.stream()
            .flatMap(det -> det.getInjectExpectationSignatures().stream())
            .toList()
            .getFirst());
  }
}
