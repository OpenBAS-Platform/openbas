package io.openbas.injectExpectation;

import io.openbas.database.model.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.Optional;

import static io.openbas.database.model.ExecutionTrace.COMMAND_LINE_IDENTIFIER;

public class InjectExpectationUtils {

  public static List<InjectExpectationResult> resultsBySourceId(
      @NotNull final InjectExpectation expectation,
      @NotBlank final String sourceId) {
    return expectation.getResults()
        .stream()
        .filter(e -> sourceId.equals(e.getSourceId()))
        .toList();
  }

  public static void computeResult(
      @NotNull final InjectExpectation expectation,
      @NotBlank final String sourceId,
      @NotBlank final String sourceName,
      @NotBlank final String result) {
    Optional<InjectExpectationResult> exists = expectation.getResults()
        .stream()
        .filter(r -> sourceId.equals(r.getSourceId()))
        .findAny();
    if (exists.isPresent()) {
      exists.get().setResult(result);
    } else {
      InjectExpectationResult expectationResult = InjectExpectationResult.builder()
          .sourceId(sourceId)
          .sourceName(sourceName)
          .result(result)
          .build();
      expectation.getResults().add(expectationResult);
    }
  }

  public static Optional<String> getCommandLine(@NotNull final InjectExpectation expectation) {
    return expectation.getInject()
        .getStatus()
        .map(InjectStatus::getReporting)
        .map(Execution::getTraces)
        .flatMap(traces -> traces.stream().filter(e -> e.getIdentifier().equals(COMMAND_LINE_IDENTIFIER))
            .findFirst()
            .map(ExecutionTrace::getMessage));
  }
}
