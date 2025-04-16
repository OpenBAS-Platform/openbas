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
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Component;

@Log
@RequiredArgsConstructor
@Component
public class ContractOutputElementUtils {

  private final TagRepository tagRepository;
  private final RegexGroupUtils regexGroupUtils;

  public void copyContractOutputElements(
      Set<?> inputElements, OutputParser outputParser, boolean copyId) {
    if (inputElements == null || outputParser == null) {
      return;
    }
    Instant now = now();
    Set<ContractOutputElement> contractOutputElements =
        inputElements.stream()
            .map(inputElement -> copyContractOutputElement(inputElement, outputParser, copyId, now))
            .collect(Collectors.toSet());

    outputParser.setContractOutputElements(contractOutputElements);
  }

  private ContractOutputElement copyContractOutputElement(
      Object inputElement, OutputParser outputParser, boolean copyId, Instant now) {
    ContractOutputElement contractOutputElement = new ContractOutputElement();
    contractOutputElement.setOutputParser(outputParser);
    contractOutputElement.setCreatedAt(now);
    contractOutputElement.setUpdatedAt(now);
    if (inputElement instanceof ContractOutputElementInput) {
      copyFromInput((ContractOutputElementInput) inputElement, contractOutputElement, copyId);
    } else if (inputElement instanceof ContractOutputElement) {
      copyFromEntity((ContractOutputElement) inputElement, contractOutputElement, copyId);
    }
    return contractOutputElement;
  }

  private void copyFromInput(
      ContractOutputElementInput input,
      ContractOutputElement contractOutputElement,
      boolean copyId) {
    BeanUtils.copyProperties(input, contractOutputElement, "id", "tags", "regexGroups");
    contractOutputElement.setId(copyId ? input.getId() : null);
    if (tagRepository != null) {
      contractOutputElement.setTags(iterableToSet(tagRepository.findAllById(input.getTagIds())));
    }
    regexGroupUtils.copyRegexGroups(input.getRegexGroups(), contractOutputElement, copyId);
  }

  private void copyFromEntity(
      ContractOutputElement existing, ContractOutputElement contractOutputElement, boolean copyId) {
    BeanUtils.copyProperties(existing, contractOutputElement, "id", "tags", "regexGroups");
    contractOutputElement.setId(copyId ? existing.getId() : null);
    contractOutputElement.setTags(new HashSet<>(existing.getTags()));
    regexGroupUtils.copyRegexGroups(existing.getRegexGroups(), contractOutputElement, copyId);
  }
}
