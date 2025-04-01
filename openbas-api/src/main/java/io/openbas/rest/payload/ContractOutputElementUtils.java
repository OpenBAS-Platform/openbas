package io.openbas.rest.payload;

import static io.openbas.helper.StreamHelper.iterableToSet;
import static java.time.Instant.now;

import io.openbas.database.model.ContractOutputElement;
import io.openbas.database.model.OutputParser;
import io.openbas.database.repository.TagRepository;
import io.openbas.rest.payload.form.ContractOutputElementInput;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.springframework.stereotype.Component;

@Log
@RequiredArgsConstructor
@Component
public class ContractOutputElementUtils {

  private final TagRepository tagRepository;
  private final RegexGroupUtils regexGroupUtils;

  public void copyContractOutputElements(
      Set<?> inputElements, OutputParser outputParser, boolean copyId) {
    if (inputElements != null) {
      Set<ContractOutputElement> contractOutputElements =
          inputElements.stream()
              .map(
                  inputElement -> {
                    ContractOutputElement contractOutputElement = new ContractOutputElement();
                    contractOutputElement.setOutputParser(outputParser);

                    Instant now = now();
                    contractOutputElement.setCreatedAt(now);
                    contractOutputElement.setUpdatedAt(now);

                    if (inputElement instanceof ContractOutputElementInput) {
                      ContractOutputElementInput contractOutputElementInput =
                          (ContractOutputElementInput) inputElement;
                      if (!copyId) {
                        contractOutputElement.setId(null);
                      } else {
                        contractOutputElement.setId(contractOutputElementInput.getId());
                      }
                      contractOutputElement.setRule(contractOutputElementInput.getRule());
                      contractOutputElement.setType(contractOutputElementInput.getType());
                      contractOutputElement.setKey(contractOutputElementInput.getKey());
                      contractOutputElement.setName(contractOutputElementInput.getName());
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
                      if (!copyId) {
                        contractOutputElement.setId(null);
                      } else {
                        contractOutputElement.setId(contractOutputElementInstance.getId());
                      }
                      contractOutputElement.setRule(contractOutputElementInstance.getRule());
                      contractOutputElement.setType(contractOutputElementInstance.getType());
                      contractOutputElement.setKey(contractOutputElementInstance.getKey());
                      contractOutputElement.setName(contractOutputElementInstance.getName());
                      contractOutputElement.setTags(
                          new HashSet<>(contractOutputElementInstance.getTags()));
                      regexGroupUtils.copyRegexGroups(
                          contractOutputElementInstance.getRegexGroups(),
                          contractOutputElement,
                          copyId);
                    }
                    return contractOutputElement;
                  })
              .collect(Collectors.toSet());

      outputParser.setContractOutputElements(new HashSet<>(contractOutputElements));
    }
  }
}
