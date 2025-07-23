package io.openbas.utils.mapper;

import static io.openbas.database.model.InjectorContract.CONTRACT_ELEMENT_CONTENT_KEY_EXPECTATIONS;
import static java.util.Collections.emptyList;

import com.fasterxml.jackson.databind.JsonNode;
import io.openbas.database.model.AttackPattern;
import io.openbas.database.model.Inject;
import io.openbas.database.raw.RawInjectExpectation;
import io.openbas.expectation.ExpectationType;
import io.openbas.rest.atomic_testing.form.InjectResultOutput;
import io.openbas.rest.inject.form.InjectExpectationResultsByAttackPattern;
import io.openbas.utils.AtomicTestingUtils;
import io.openbas.utils.InjectUtils;
import jakarta.validation.constraints.NotNull;
import java.util.*;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class InjectExpectationMapper {

  public static final String NODE_EXPECTATION_TYPE = "expectation_type";
  private final InjectUtils injectUtils;

  public List<AtomicTestingUtils.ExpectationResultsByType> extractExpectationResults(
      Inject inject) {
    List<AtomicTestingUtils.ExpectationResultsByType> expectationResultByTypes =
        AtomicTestingUtils.getExpectationResultByTypes(injectUtils.getPrimaryExpectations(inject));

    if (!expectationResultByTypes.isEmpty()) {
      return expectationResultByTypes;
    }

    JsonNode contentNode = inject.getContent().get(CONTRACT_ELEMENT_CONTENT_KEY_EXPECTATIONS);
    if (contentNode == null || !contentNode.isArray()) {
      return Collections.emptyList();
    }

    Set<ExpectationType> uniqueTypes = new HashSet<>();
    for (JsonNode expectationNode : contentNode) {
      JsonNode typeNode = expectationNode.get(NODE_EXPECTATION_TYPE);
      if (typeNode != null && typeNode.isTextual()) {
        try {
          ExpectationType type = ExpectationType.of(typeNode.asText().toUpperCase());
          uniqueTypes.add(type);
        } catch (IllegalArgumentException e) {
        }
      }
    }

    List<AtomicTestingUtils.ExpectationResultsByType> fallbackResults = new ArrayList<>();
    for (ExpectationType type : uniqueTypes) {
      AtomicTestingUtils.getExpectationByType(type, Collections.emptyList())
          .ifPresent(fallbackResults::add);
    }

    return fallbackResults;
  }

  public InjectExpectationResultsByAttackPattern toInjectExpectationResultsByattackPattern(
      final AttackPattern attackPattern, @NotNull final List<Inject> injects) {

    return InjectExpectationResultsByAttackPattern.builder()
        .results(
            injects.stream()
                .map(
                    inject -> {
                      InjectExpectationResultsByAttackPattern.InjectExpectationResultsByType
                          result =
                              new InjectExpectationResultsByAttackPattern
                                  .InjectExpectationResultsByType();
                      result.setInjectId(inject.getId());
                      result.setInjectTitle(inject.getTitle());
                      result.setResults(extractExpectationResults(inject));
                      return result;
                    })
                .collect(Collectors.toList()))
        .attackPattern(attackPattern)
        .build();
  }

  public List<AtomicTestingUtils.ExpectationResultsByType> extractExpectationResults(
      Map<String, List<RawInjectExpectation>> expectationMap, InjectResultOutput inject) {
    List<AtomicTestingUtils.ExpectationResultsByType> expectationResultByTypesFromRaw =
        AtomicTestingUtils.getExpectationResultByTypesFromRaw(
            expectationMap.getOrDefault(inject.getId(), emptyList()));

    if (!expectationResultByTypesFromRaw.isEmpty()) {
      return expectationResultByTypesFromRaw;
    }

    JsonNode contentNode = inject.getContent().get(CONTRACT_ELEMENT_CONTENT_KEY_EXPECTATIONS);
    if (contentNode == null || !contentNode.isArray()) {
      return Collections.emptyList();
    }

    Set<ExpectationType> uniqueTypes = new HashSet<>();
    for (JsonNode expectationNode : contentNode) {
      JsonNode typeNode = expectationNode.get(NODE_EXPECTATION_TYPE);
      if (typeNode != null && typeNode.isTextual()) {
        try {
          ExpectationType type = ExpectationType.of(typeNode.asText().toUpperCase());
          uniqueTypes.add(type);
        } catch (IllegalArgumentException e) {
        }
      }
    }

    List<AtomicTestingUtils.ExpectationResultsByType> fallbackResults = new ArrayList<>();
    for (ExpectationType type : uniqueTypes) {
      AtomicTestingUtils.getExpectationByType(type, Collections.emptyList())
          .ifPresent(fallbackResults::add);
    }

    return fallbackResults;
  }
}
