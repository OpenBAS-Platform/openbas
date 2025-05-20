package io.openbas.rest.inject.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.IntNode;
import com.fasterxml.jackson.databind.node.NullNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.openbas.database.model.*;
import jakarta.annotation.Resource;
import java.util.*;
import java.util.logging.Level;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.regex.PatternSyntaxException;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.springframework.stereotype.Component;

@Log
@RequiredArgsConstructor
@Component
public class OutputStructuredUtils {

  @Resource private final ObjectMapper mapper;

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

  public ObjectNode computeOutputStructuredUsingRegexRules(
      String rawOutputByMode, Set<ContractOutputElement> contractOutputElements) {
    Map<String, Pattern> patternCache = new HashMap<>();
    ObjectNode resultRoot = mapper.createObjectNode();

    for (ContractOutputElement contractOutputElement : contractOutputElements) {
      String regex = contractOutputElement.getRule();
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

      if (pattern == null) continue;

      Matcher matcher = pattern.matcher(rawOutputByMode);
      ArrayNode matchesArray = mapper.createArrayNode();

      while (matcher.find()) {
        JsonNode structured = buildStructuredJsonNode(contractOutputElement, matcher);
        if (structured != null && contractOutputElement.getType().validate.apply(structured)) {
          matchesArray.add(structured);
        }
      }

      if (!matchesArray.isEmpty()) {
        resultRoot.set(contractOutputElement.getKey(), matchesArray);
      }
    }

    return resultRoot;
  }

  private JsonNode buildStructuredJsonNode(ContractOutputElement element, Matcher matcher) {
    ContractOutputType type = element.getType();

    // Case: primitive types like Text, Number, IPv4, IPv6
    if (type.fields == null || type.technicalType != ContractOutputTechnicalType.Object) {
      List<String> extracted = extractValues(element.getRegexGroups(), matcher);
      if (type.technicalType == ContractOutputTechnicalType.Number && !extracted.isEmpty()) {
        try {
          return new IntNode(Integer.parseInt(extracted.get(0)));
        } catch (NumberFormatException e) {
          log.warning("Invalid number format: " + extracted.get(0));
          return NullNode.getInstance();
        }
      }
      return mapper.valueToTree(extracted.isEmpty() ? "" : extracted.get(0));
    }

    // Case: complex types like portscan, credentials, CVE
    ObjectNode objectNode = mapper.createObjectNode();

    for (ContractOutputField field : type.fields) {
      Set<RegexGroup> matchingGroups =
          element.getRegexGroups().stream()
              .filter(rg -> rg.getField().equals(field.getKey()))
              .collect(Collectors.toSet());

      List<String> values = extractValues(matchingGroups, matcher);
      JsonNode valueNode =
          (field.getType() == ContractOutputTechnicalType.Number)
              ? toNumericArray(values)
              : mapper.valueToTree(values);

      objectNode.set(field.getKey(), valueNode);
    }

    return objectNode;
  }

  private JsonNode toNumericArray(List<String> values) {
    ArrayNode array = mapper.createArrayNode();
    for (String v : values) {
      try {
        array.add(Integer.parseInt(v));
      } catch (NumberFormatException e) {
        log.warning("Invalid numeric value: " + v);
      }
    }
    return array;
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
}
