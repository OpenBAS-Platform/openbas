package io.openbas.inject_expectation;

import io.openbas.database.model.InjectExpectation;
import io.openbas.database.model.InjectExpectationResult;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;

public class InjectExpectationUtils {

  public static void computeResult(
      @NotNull final InjectExpectation expectation,
      @NotBlank final String sourceId,
      @NotBlank final String sourceType,
      @NotBlank final String sourceName,
      @NotBlank final String result,
      @NotBlank final Double score,
      final Map<String, String> metadata) {
    Optional<InjectExpectationResult> exists =
        expectation.getResults().stream().filter(r -> sourceId.equals(r.getSourceId())).findAny();
    if (exists.isPresent()) {
      exists.get().setResult(result);
      exists.get().setMetadata(metadata);
    } else {
      InjectExpectationResult expectationResult =
          InjectExpectationResult.builder()
              .sourceId(sourceId)
              .sourceType(sourceType)
              .sourceName(sourceName)
              .result(result)
              .date(Instant.now().toString())
              .score(score)
              .metadata(metadata)
              .build();
      expectation.getResults().add(expectationResult);
    }
  }
}
