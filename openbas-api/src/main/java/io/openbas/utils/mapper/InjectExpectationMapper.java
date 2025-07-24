package io.openbas.utils.mapper;

import static io.openbas.database.model.InjectorContract.CONTRACT_ELEMENT_CONTENT_KEY_EXPECTATIONS;
import static java.util.Collections.emptyList;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.openbas.database.model.AttackPattern;
import io.openbas.database.model.Inject;
import io.openbas.database.raw.RawInjectExpectation;
import io.openbas.database.repository.InjectRepository;
import io.openbas.expectation.ExpectationType;
import io.openbas.rest.atomic_testing.form.InjectResultOutput;
import io.openbas.rest.inject.form.InjectExpectationResultsByAttackPattern;
import io.openbas.utils.AtomicTestingUtils;
import io.openbas.utils.InjectUtils;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.*;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class InjectExpectationMapper {

  public static final String NODE_EXPECTATION_TYPE = "expectation_type";

  private static final EnumSet<ExpectationType> ALL_EXPECTATION_TYPES =
      EnumSet.allOf(ExpectationType.class);

  private final InjectRepository injectRepository;
  private final InjectUtils injectUtils;
  private final ObjectMapper objectMapper = new ObjectMapper();

  // -- INJECT
  public List<AtomicTestingUtils.ExpectationResultsByType> extractExpectationResults(
      Inject inject) {
    List<AtomicTestingUtils.ExpectationResultsByType> expectationResultByTypes =
        AtomicTestingUtils.getExpectationResultByTypes(injectUtils.getPrimaryExpectations(inject));

    if (!expectationResultByTypes.isEmpty()) {
      return expectationResultByTypes;
    }

    return buildExpectationResultsFromInjectContent(inject.getContent());
  }

  public List<AtomicTestingUtils.ExpectationResultsByType> extractExpectationResults(
      Map<String, List<RawInjectExpectation>> expectationMap, InjectResultOutput inject) {
    List<AtomicTestingUtils.ExpectationResultsByType> expectationResultByTypesFromRaw =
        AtomicTestingUtils.getExpectationResultByTypesFromRaw(
            expectationMap.getOrDefault(inject.getId(), emptyList()));

    if (!expectationResultByTypesFromRaw.isEmpty()) {
      return expectationResultByTypesFromRaw;
    }

    return buildExpectationResultsFromInjectContent(inject.getContent());
  }

  private static List<AtomicTestingUtils.ExpectationResultsByType>
      buildExpectationResultsFromInjectContent(ObjectNode injectContent) {

    if (injectContent == null) {
      return emptyList();
    }

    JsonNode contentNode = injectContent.get(CONTRACT_ELEMENT_CONTENT_KEY_EXPECTATIONS);
    if (contentNode == null || !contentNode.isArray()) {
      return emptyList();
    }

    Set<ExpectationType> uniqueTypes = new HashSet<>();
    for (JsonNode expectationNode : contentNode) {
      JsonNode typeNode = expectationNode.get(NODE_EXPECTATION_TYPE);
      if (typeNode != null && typeNode.isTextual()) {
        try {
          ExpectationType type = ExpectationType.of(typeNode.asText().toUpperCase());
          uniqueTypes.add(type);
        } catch (IllegalArgumentException e) {
          log.warn("Expectation Type is no valid", e);
        }
      }
    }

    List<AtomicTestingUtils.ExpectationResultsByType> fallbackResults = new ArrayList<>();
    for (ExpectationType type : uniqueTypes) {
      AtomicTestingUtils.getExpectationByType(type, emptyList()).ifPresent(fallbackResults::add);
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

  // -- EXERCISE --
  public List<AtomicTestingUtils.ExpectationResultsByType> extractExpectationResultByTypesFromRaw(
      String exerciseId, List<RawInjectExpectation> expectations) {
    List<AtomicTestingUtils.ExpectationResultsByType> expectationResultByTypesFromRaw =
        AtomicTestingUtils.getExpectationResultByTypesFromRaw(expectations);

    if (!expectationResultByTypesFromRaw.isEmpty()) {
      return expectationResultByTypesFromRaw;
    }

    return buildExpectationResultsFromInjectContents(exerciseId);
  }

  /**
   * Build InjectResults based on content of injects from an exercise
   *
   * @param exerciseId the exercise id
   * @return List of InjectResultsByType
   */
  private List<AtomicTestingUtils.ExpectationResultsByType>
      buildExpectationResultsFromInjectContents(@NotBlank String exerciseId) {

    // Fetch all inject contents in order to extract expectations defined in every inject
    List<String> rawContents = injectRepository.findContentsByExerciseId(exerciseId);
    Set<ExpectationType> foundTypes = new HashSet<>();

    for (String contentJson : rawContents) {
      try {
        if (contentJson != null && !contentJson.isBlank()) {
          JsonNode jsonNode = objectMapper.readTree(contentJson);

          if (jsonNode != null && jsonNode.isObject()) {
            ObjectNode contentNode = (ObjectNode) jsonNode;

            List<AtomicTestingUtils.ExpectationResultsByType> results =
                buildExpectationResultsFromInjectContent(contentNode);

            for (AtomicTestingUtils.ExpectationResultsByType r : results) {
              if (ALL_EXPECTATION_TYPES.contains(r.type())) {
                foundTypes.add(r.type());
                if (foundTypes.size() == ALL_EXPECTATION_TYPES.size()) {
                  break;
                }
              }
            }
          }

          if (foundTypes.size() == ALL_EXPECTATION_TYPES.size()) {
            break;
          }
        }

      } catch (JsonProcessingException e) {
        log.warn("Invalid JSON in inject content", e);
      }
    }

    List<AtomicTestingUtils.ExpectationResultsByType> fallbackResults = new ArrayList<>();
    for (ExpectationType type : foundTypes) {
      AtomicTestingUtils.getExpectationByType(type, emptyList()).ifPresent(fallbackResults::add);
    }

    return fallbackResults;
  }
}
