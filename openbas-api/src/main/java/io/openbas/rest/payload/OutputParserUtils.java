package io.openbas.rest.payload;

import static io.openbas.helper.StreamHelper.iterableToSet;
import static java.time.Instant.now;

import io.openbas.database.model.*;
import io.openbas.database.repository.TagRepository;
import io.openbas.rest.payload.form.*;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Component;

@Log
@RequiredArgsConstructor
@Component
public class OutputParserUtils {

  private final TagRepository tagRepository;

  public <T> void copyOutputParsers(Set<T> inputParsers, Payload target) {
    if (inputParsers != null) {
      Set<OutputParser> outputParsers =
          inputParsers.stream()
              .map(
                  inputParser -> {
                    OutputParser outputParser = new OutputParser();
                    BeanUtils.copyProperties(inputParser, outputParser);
                    outputParser.setId(null);
                    outputParser.setPayload(target);
                    outputParser.setCreatedAt(now());
                    outputParser.setUpdatedAt(now());

                    // Handle contract output elements based on the input type
                    if (inputParser instanceof OutputParserInput) {
                      OutputParserInput parserInput = (OutputParserInput) inputParser;
                      copyContractOutputElements(
                          parserInput.getContractOutputElements(), outputParser);
                    } else if (inputParser instanceof OutputParser) {
                      OutputParser parser = (OutputParser) inputParser;
                      copyContractOutputElements(parser.getContractOutputElements(), outputParser);
                    }

                    return outputParser;
                  })
              .collect(Collectors.toSet());

      target.setOutputParsers(outputParsers);
    }
  }

  private void copyContractOutputElements(Set<?> inputElements, OutputParser outputParser) {
    if (inputElements != null) {
      Set<ContractOutputElement> contractOutputElements =
          inputElements.stream()
              .map(
                  inputElement -> {
                    ContractOutputElement contractOutputElement = new ContractOutputElement();
                    BeanUtils.copyProperties(inputElement, contractOutputElement);
                    contractOutputElement.setId(null);
                    contractOutputElement.setOutputParser(outputParser);
                    contractOutputElement.setCreatedAt(now());
                    contractOutputElement.setUpdatedAt(now());

                    if (inputElement instanceof ContractOutputElementInput) {
                      ContractOutputElementInput contractOutputElementInput =
                          (ContractOutputElementInput) inputElement;
                      contractOutputElement.setTags(
                          iterableToSet(
                              tagRepository.findAllById(contractOutputElementInput.getTagIds())));
                      copyRegexGroups(
                          contractOutputElementInput.getRegexGroups(), contractOutputElement);
                    } else {
                      ContractOutputElement contractOutputElementInstance =
                          (ContractOutputElement) inputElement;
                      contractOutputElement.setTags(
                          iterableToSet(new HashSet<>(contractOutputElementInstance.getTags())));
                      copyRegexGroups(
                          contractOutputElement.getRegexGroups(), contractOutputElement);
                    }
                    return contractOutputElement;
                  })
              .collect(Collectors.toSet());

      outputParser.setContractOutputElements(contractOutputElements);
    }
  }

  private void copyRegexGroups(Set<?> inputElements, ContractOutputElement contractOutputElement) {
    if (inputElements != null) {
      Set<RegexGroup> regexGroups =
          inputElements.stream()
              .map(
                  inputElement -> {
                    RegexGroup regexGroup = new RegexGroup();
                    BeanUtils.copyProperties(inputElement, regexGroup);
                    regexGroup.setId(null);
                    regexGroup.setContractOutputElement(contractOutputElement);
                    regexGroup.setCreatedAt(now());
                    regexGroup.setUpdatedAt(now());

                    return regexGroup;
                  })
              .collect(Collectors.toSet());

      contractOutputElement.setRegexGroups(regexGroups);
    }
  }
}
