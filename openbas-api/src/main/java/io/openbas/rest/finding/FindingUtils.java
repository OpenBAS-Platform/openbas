package io.openbas.rest.finding;

import static io.openbas.database.model.ContractOutputType.*;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.openbas.database.model.*;
import io.openbas.database.repository.FindingRepository;
import jakarta.annotation.Resource;
import java.util.*;
import java.util.logging.Level;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.regex.PatternSyntaxException;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Component;

@Log
@RequiredArgsConstructor
@Component
public class FindingUtils {

  @Resource private final ObjectMapper mapper;

  private final FindingRepository findingRepository;

  public void computeFindingUsingRegexRules(
      Inject inject,
      Asset asset,
      String rawOutputByMode,
      Set<io.openbas.database.model.ContractOutputElement> contractOutputElements) {
    Map<String, Pattern> patternCache = new HashMap<>();

    contractOutputElements.stream()
        .filter(io.openbas.database.model.ContractOutputElement::isFinding)
        .forEach(
            contractOutputElement -> {
              String regex = contractOutputElement.getRule();

              // Check regex
              Pattern pattern =
                  patternCache.computeIfAbsent(
                      regex,
                      r -> {
                        try {
                          return Pattern.compile(
                              r,
                              Pattern.MULTILINE
                                  | Pattern.CASE_INSENSITIVE
                                  | Pattern.UNICODE_CHARACTER_CLASS);
                        } catch (PatternSyntaxException e) {
                          log.log(Level.INFO, "Invalid regex pattern: " + r, e.getMessage());
                          return null;
                        }
                      });

              if (pattern == null) return;

              Matcher matcher = pattern.matcher(rawOutputByMode);

              while (matcher.find()) {
                String finalValue = buildValue(contractOutputElement, matcher);
                if (isValid(finalValue)) {
                  buildFinding(inject, asset, contractOutputElement, finalValue);
                }
              }
            });
  }

  private static boolean isValid(String finalValue) {
    return finalValue != null && !finalValue.isEmpty();
  }

  public String extractRawOutputByMode(String rawOutput, ParserMode mode) {
    if (rawOutput == null || rawOutput.isEmpty()) {
      return "";
    }

    try {
      ObjectMapper objectMapper = new ObjectMapper();
      JsonNode rootNode = objectMapper.readTree(rawOutput);

      if (mode == ParserMode.STDOUT && rootNode.has("stdout")) {
        return rootNode.get("stdout").asText();
      } else if (mode == ParserMode.STDERR && rootNode.has("stderr")) {
        return rootNode.get("stderr").asText();
      }
    } catch (Exception e) {
      log.log(Level.WARNING, e.getMessage(), e);
    }

    return "";
  }

  public String buildValue(ContractOutputElement contractOutputElement, Matcher matcher) {
    JsonNode resultNode;
    if (contractOutputElement.getType().fields == null) {
      List<String> extractedValues = extractValues(contractOutputElement.getRegexGroups(), matcher);
      resultNode = mapper.valueToTree(extractedValues);
    } else {
      ObjectNode objectNode = mapper.createObjectNode();
      for (ContractOutputField field : contractOutputElement.getType().fields) {
        List<String> extractedValues =
            extractValues(
                contractOutputElement.getRegexGroups().stream()
                    .filter(regexGroup -> field.getKey().equals(regexGroup.getField()))
                    .collect(Collectors.toSet()),
                matcher);
        ArrayNode arrayNode = mapper.valueToTree(extractedValues);
        objectNode.set(field.getKey(), arrayNode);
      }
      resultNode = objectNode;
    }

    return contractOutputElement.getType().toFindingValue.apply(resultNode);
  }

  private List<String> extractValues(Set<RegexGroup> regexGroups, Matcher matcher) {
    List<String> extractedValues = new ArrayList<>();

    for (RegexGroup regexGroup : regexGroups) {
      String[] indexes =
          Arrays.stream(regexGroup.getIndexValues().split("\\$", -1))
              .filter(index -> !index.isEmpty())
              .toArray(String[]::new);

      for (String index : indexes) {
        try {
          int groupIndex = Integer.parseInt(index);
          if (groupIndex > matcher.groupCount()) {
            log.log(Level.WARNING, "Skipping invalid group index: " + groupIndex);
            continue;
          }
          String extracted = matcher.group(groupIndex);
          if (extracted == null || extracted.isEmpty()) {
            log.log(Level.WARNING, "Skipping invalid extracted value");
            continue;
          }
          if (extracted != null) {
            extractedValues.add(extracted.trim());
          }
        } catch (NumberFormatException | IllegalStateException e) {
          log.log(Level.SEVERE, "Invalid regex group index: " + index, e);
        }
      }
    }
    return extractedValues;
  }

  public void buildFinding(
      Inject inject,
      Asset asset,
      io.openbas.database.model.ContractOutputElement contractOutputElement,
      String finalValue) {
    try {
      Optional<Finding> optionalFinding =
          findingRepository.findByInjectIdAndValueAndTypeAndKey(
              inject.getId(),
              finalValue,
              contractOutputElement.getType(),
              contractOutputElement.getKey());

      Finding finding =
          optionalFinding.orElseGet(
              () -> {
                Finding newFinding = new Finding();
                newFinding.setInject(inject);
                newFinding.setField(contractOutputElement.getKey());
                newFinding.setType(contractOutputElement.getType());
                newFinding.setValue(finalValue);
                newFinding.setName(contractOutputElement.getName());
                newFinding.setTags(new HashSet<>(contractOutputElement.getTags()));
                return newFinding;
              });

      boolean isNewAsset =
          finding.getAssets().stream().noneMatch(a -> a.getId().equals(asset.getId()));

      if (isNewAsset) {
        finding.getAssets().add(asset);
      }

      if (optionalFinding.isEmpty() || isNewAsset) {
        findingRepository.save(finding);
      }

    } catch (DataIntegrityViolationException ex) {
      log.log(Level.INFO, "Race condition: finding already exists. Retrying ...", ex.getMessage());
      // Re-fetch and try to add the asset
      handleRaceCondition(inject, asset, contractOutputElement, finalValue);
    }
  }

  private void handleRaceCondition(
      Inject inject, Asset asset, ContractOutputElement contractOutputElement, String finalValue) {
    Optional<Finding> retryFinding =
        findingRepository.findByInjectIdAndValueAndTypeAndKey(
            inject.getId(),
            finalValue,
            contractOutputElement.getType(),
            contractOutputElement.getKey());

    if (retryFinding.isPresent()) {
      Finding existingFinding = retryFinding.get();
      boolean isNewAsset =
          existingFinding.getAssets().stream().noneMatch(a -> a.getId().equals(asset.getId()));
      if (isNewAsset) {
        existingFinding.getAssets().add(asset);
        findingRepository.save(existingFinding);
      }
    } else {
      log.warning("Retry failed: Finding still not found after race condition.");
    }
  }
}
