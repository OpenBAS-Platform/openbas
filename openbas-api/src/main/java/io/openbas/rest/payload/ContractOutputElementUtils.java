package io.openbas.rest.payload;

import static io.openbas.helper.StreamHelper.iterableToSet;
import static java.time.Instant.now;

import io.openbas.database.model.ContractOutputElement;
import io.openbas.database.model.OutputParser;
import io.openbas.database.repository.ContractOutputElementRepository;
import io.openbas.database.repository.TagRepository;
import io.openbas.rest.payload.form.ContractOutputElementInput;
import io.openbas.rest.payload.form.OutputParserInput;
import java.time.Instant;
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
public class ContractOutputElementUtils {

  private final TagRepository tagRepository;
  private final ContractOutputElementRepository contractOutputElementRepository;
  private final RegexGroupUtils regexGroupUtils;

  public void copyContractOutputElements(
      Set<?> inputElements, OutputParser outputParser, boolean copyId) {
    if (inputElements != null) {
      Set<ContractOutputElement> contractOutputElements =
          inputElements.stream()
              .map(
                  inputElement -> {
                    ContractOutputElement contractOutputElement = new ContractOutputElement();
                    BeanUtils.copyProperties(inputElement, contractOutputElement);
                    if (!copyId) {
                      contractOutputElement.setId(null);
                    }
                    contractOutputElement.setOutputParser(outputParser);

                    Instant now = now();
                    contractOutputElement.setCreatedAt(now);
                    contractOutputElement.setUpdatedAt(now);

                    if (inputElement instanceof ContractOutputElementInput) {
                      ContractOutputElementInput contractOutputElementInput =
                          (ContractOutputElementInput) inputElement;
                      contractOutputElement.setTags(
                          iterableToSet(
                              tagRepository.findAllById(contractOutputElementInput.getTagIds())));
                      regexGroupUtils.copyRegexGroups(
                          contractOutputElementInput.getRegexGroups(),
                          contractOutputElement,
                          copyId);
                    } else {
                      ContractOutputElement contractOutputElementInstance =
                          (ContractOutputElement) inputElement;
                      contractOutputElement.setTags(
                          iterableToSet(new HashSet<>(contractOutputElementInstance.getTags())));
                      regexGroupUtils.copyRegexGroups(
                          contractOutputElement.getRegexGroups(), contractOutputElement, copyId);
                    }
                    return contractOutputElement;
                  })
              .collect(Collectors.toSet());

      outputParser.setContractOutputElements(contractOutputElements);
    }
  }

  public void removeOrphanContractOutputElements(Set<OutputParserInput> outputParserInputs) {
    outputParserInputs.stream()
        .forEach(
            outputParserInput -> {
              Set<ContractOutputElementInput> contractOutputElementInputToBeUpdated =
                  outputParserInput.getContractOutputElements().stream()
                      .filter(coe -> coe.getId() != null)
                      .collect(Collectors.toSet());
              if (contractOutputElementInputToBeUpdated.isEmpty()) {
                contractOutputElementRepository.deleteByOutPutParserId(outputParserInput.getId());
              }
              contractOutputElementRepository.deleteByOutPutParserAndIdNotIn(
                  outputParserInput.getId(),
                  contractOutputElementInputToBeUpdated.stream()
                      .map(ContractOutputElementInput::getId)
                      .collect(Collectors.toList()));

              regexGroupUtils.removeOrphanRegexGroups(contractOutputElementInputToBeUpdated);
            });
  }
}
