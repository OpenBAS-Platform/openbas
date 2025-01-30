package io.openbas.model.expectation;

import static io.openbas.database.model.InjectExpectation.EXPECTATION_TYPE.PREVENTION;

import io.openbas.database.model.*;
import io.openbas.database.model.InjectExpectation.EXPECTATION_TYPE;
import io.openbas.model.Expectation;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.Objects;
import javax.annotation.Nullable;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PreventionExpectation implements Expectation {

  private Double score;
  private String name;
  private String description;
  private Agent agent;
  private Endpoint endpoint;
  private AssetGroup assetGroup;
  private boolean expectationGroup;
  private Long expirationTime;
  private List<InjectExpectationSignature> injectExpectationSignatures;

  private PreventionExpectation() {}

  @Override
  public EXPECTATION_TYPE type() {
    return PREVENTION;
  }

  public static List<PreventionExpectation> preventionExpectationsForAgents(
      @NotNull Endpoint endpoint, @NotNull PreventionExpectation endpointExpectation) {
    return endpoint.getAgents().stream()
        .map(agent -> preventionExpectationForAgent(agent, endpoint, endpointExpectation))
        .toList();
  }

  private static PreventionExpectation preventionExpectationForAgent(
      @NotNull Agent agent,
      @NotNull Endpoint endpoint,
      @NotNull PreventionExpectation endpointExpectation) {
    PreventionExpectation preventionExpectation = new PreventionExpectation();
    preventionExpectation.setScore(
        Objects.requireNonNullElse(endpointExpectation.getScore(), 100.0));
    preventionExpectation.setName(endpointExpectation.getName());
    preventionExpectation.setDescription(endpointExpectation.getDescription());
    preventionExpectation.setAgent(agent);
    preventionExpectation.setEndpoint(endpoint);
    preventionExpectation.setExpirationTime(endpointExpectation.getExpirationTime());
    preventionExpectation.setInjectExpectationSignatures(
        endpointExpectation.getInjectExpectationSignatures());
    return preventionExpectation;
  }

  public static PreventionExpectation preventionExpectationForAsset(
      @Nullable final Double score,
      @NotBlank final String name,
      final String description,
      @NotNull final Endpoint endpoint,
      final boolean expectationGroup,
      final Long expirationTime,
      final List<InjectExpectationSignature> expectationSignatures) {
    PreventionExpectation endpointExpectation = new PreventionExpectation();
    endpointExpectation.setScore(Objects.requireNonNullElse(score, 100.0));
    endpointExpectation.setName(name);
    endpointExpectation.setDescription(description);
    endpointExpectation.setEndpoint(endpoint);
    endpointExpectation.setExpectationGroup(expectationGroup);
    endpointExpectation.setExpirationTime(expirationTime);
    endpointExpectation.setInjectExpectationSignatures(expectationSignatures);
    return endpointExpectation;
  }

  public static PreventionExpectation preventionExpectationForAssetGroup(
      @Nullable final Double score,
      @NotBlank final String name,
      final String description,
      @NotNull final AssetGroup assetGroup,
      final boolean expectationGroup,
      @NotNull final Long expirationTime,
      final List<InjectExpectationSignature> expectationSignatures) {
    PreventionExpectation preventionExpectation = new PreventionExpectation();
    preventionExpectation.setScore(Objects.requireNonNullElse(score, 100.0));
    preventionExpectation.setName(name);
    preventionExpectation.setDescription(description);
    preventionExpectation.setAssetGroup(assetGroup);
    preventionExpectation.setExpectationGroup(expectationGroup);
    preventionExpectation.setExpirationTime(expirationTime);
    preventionExpectation.setInjectExpectationSignatures(expectationSignatures);
    return preventionExpectation;
  }
}
