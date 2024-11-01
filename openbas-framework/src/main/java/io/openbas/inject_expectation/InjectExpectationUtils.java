package io.openbas.inject_expectation;

import static io.openbas.database.model.InjectStatusExecution.EXECUTION_TYPE_COMMAND;

import io.openbas.database.model.InjectExpectation;
import io.openbas.database.model.InjectExpectationResult;
import io.openbas.database.model.InjectStatusExecution;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

public class InjectExpectationUtils {

  public static List<InjectExpectationResult> resultsBySourceId(
      @NotNull final InjectExpectation expectation, @NotBlank final String sourceId) {
    return expectation.getResults().stream().filter(e -> sourceId.equals(e.getSourceId())).toList();
  }

  public static void computeResult(
      @NotNull final InjectExpectation expectation,
      @NotBlank final String sourceId,
      @NotBlank final String sourceType,
      @NotBlank final String sourceName,
      @NotBlank final String result,
      @NotBlank final Double score) {
    Optional<InjectExpectationResult> exists =
        expectation.getResults().stream().filter(r -> sourceId.equals(r.getSourceId())).findAny();
    if (exists.isPresent()) {
      exists.get().setResult(result);
    } else {
      InjectExpectationResult expectationResult =
          InjectExpectationResult.builder()
              .sourceId(sourceId)
              .sourceType(sourceType)
              .sourceName(sourceName)
              .result(result)
              .date(Instant.now().toString())
              .score(score)
              .build();
      expectation.getResults().add(expectationResult);
    }
  }

  public static Optional<String> getCommandLine(@NotNull final InjectExpectation expectation) {
    return expectation.getInject().getStatus().orElseThrow().getTraces().stream()
        .filter(trace -> trace.getCategory().equals(EXECUTION_TYPE_COMMAND))
        .findFirst()
        .map(InjectStatusExecution::getMessage);
  }
}
