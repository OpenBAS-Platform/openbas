package io.openbas.rest.finding;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.database.model.*;
import io.openbas.database.repository.FindingRepository;
import java.util.*;
import java.util.logging.Level;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.springframework.stereotype.Component;

@Log
@RequiredArgsConstructor
@Component
public class FindingUtils {

  private final FindingRepository findingRepository;

  public List<Finding> computeFindingUsingRegexRules(
      Inject inject,
      Asset asset,
      String rawOutputByMode,
      Set<io.openbas.database.model.ContractOutputElement> contractOutputElements) {
    List<Finding> findings = new ArrayList<>();
    Map<String, Pattern> patternCache = new HashMap<>();

    contractOutputElements.stream()
        .filter(io.openbas.database.model.ContractOutputElement::isFinding)
        .forEach(
            contractOutputElement -> {
              String regex = contractOutputElement.getRule();
              int flags = (regex.contains("^") || regex.contains("$")) ? Pattern.MULTILINE : 0;
              Pattern pattern = patternCache.computeIfAbsent(regex, r -> Pattern.compile(r, flags));
              Matcher matcher = pattern.matcher(rawOutputByMode);

              while (matcher.find()) {
                String finalValue = buildValue(contractOutputElement, matcher);
                if (isValid(finalValue)) {
                  Finding finding = buildFinding(inject, asset, contractOutputElement, finalValue);
                  findings.add(finding);
                }
              }
            });

    return findings;
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
    Map<String, List<String>> fieldValuesMap = new LinkedHashMap<>();

    // If there are no specific fields, extract all matched groups
    if (contractOutputElement.getType().fields == null) {
      List<String> extractedValues = extractValues(contractOutputElement.getRegexGroups(), matcher);

      fieldValuesMap.put(null, extractedValues);
    } else {
      // Extract values for each defined field
      for (ContractOutputField field : contractOutputElement.getType().fields) {
        List<String> extractedValues =
            extractValues(
                contractOutputElement.getRegexGroups().stream()
                    .filter(regexGroup -> field.getKey().equals(regexGroup.getField()))
                    .collect(Collectors.toSet()),
                matcher);
        fieldValuesMap.put(field.getKey(), extractedValues);
      }
    }

    return formatFinalValue(contractOutputElement.getType(), fieldValuesMap);
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
          if (extracted.isEmpty() || extracted == null) {
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

  public Finding buildFinding(
      Inject inject,
      Asset asset,
      io.openbas.database.model.ContractOutputElement contractOutputElement,
      String finalValue) {
    Optional<Finding> optionalFinding =
        findingRepository.findByInjectIdAndValue(inject.getId(), finalValue);

    Finding finding =
        optionalFinding.orElseGet(
            () -> {
              Finding newFinding = new Finding();
              newFinding.setInject(inject);
              newFinding.setField(contractOutputElement.getKey());
              newFinding.setType(contractOutputElement.getType());
              newFinding.setValue(finalValue);
              newFinding.setTags(new HashSet<>(contractOutputElement.getTags()));
              return newFinding;
            });

    finding.getAssets().add(asset);
    return finding;
  }

  private String formatFinalValue(
      ContractOutputType type, Map<String, List<String>> fieldValuesMap) {
    switch (type) {
      case Credentials:
        String username = String.join(" ", fieldValuesMap.getOrDefault("username", List.of("")));
        String password = String.join(" ", fieldValuesMap.getOrDefault("password", List.of("")));
        return username + ":" + password;
      case PortsScan:
        String host = fieldValuesMap.getOrDefault("host", List.of("")).get(0);
        String port = fieldValuesMap.getOrDefault("port", List.of("")).get(0);
        String service =
            fieldValuesMap.getOrDefault("service", List.of("")).isEmpty()
                ? ""
                : " (" + fieldValuesMap.get("service").get(0) + ")";
        return host + ":" + port + service;
      default:
        return fieldValuesMap.values().stream()
            .map(list -> String.join(" ", list))
            .collect(Collectors.joining(" "));
    }
  }
}
