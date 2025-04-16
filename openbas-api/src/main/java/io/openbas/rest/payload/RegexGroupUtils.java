package io.openbas.rest.payload;

import static java.time.Instant.now;

import io.openbas.database.model.ContractOutputElement;
import io.openbas.database.model.RegexGroup;
import io.openbas.rest.payload.form.RegexGroupInput;
import java.time.Instant;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.springframework.stereotype.Component;

@Log
@RequiredArgsConstructor
@Component
public class RegexGroupUtils {

  public void copyRegexGroups(
      Set<?> inputElements, ContractOutputElement contractOutputElement, boolean copyId) {
    if (inputElements == null || contractOutputElement == null) {
      return;
    }

    Instant now = now();

    Set<RegexGroup> regexGroups =
        inputElements.stream()
            .map(inputElement -> copyRegexGroup(inputElement, contractOutputElement, copyId, now))
            .collect(Collectors.toSet());

    contractOutputElement.setRegexGroups(regexGroups);
  }

  private RegexGroup copyRegexGroup(
      Object inputElement,
      ContractOutputElement contractOutputElement,
      boolean copyId,
      Instant now) {
    RegexGroup regexGroup = new RegexGroup();
    regexGroup.setContractOutputElement(contractOutputElement);
    regexGroup.setCreatedAt(now);
    regexGroup.setUpdatedAt(now);

    if (inputElement instanceof RegexGroupInput) {
      copyFromInput((RegexGroupInput) inputElement, regexGroup, copyId);
    } else if (inputElement instanceof RegexGroup) {
      copyFromEntity((RegexGroup) inputElement, regexGroup, copyId);
    }

    return regexGroup;
  }

  private void copyFromInput(RegexGroupInput input, RegexGroup regexGroup, boolean copyId) {
    regexGroup.setId(copyId ? input.getId() : null);
    regexGroup.setField(input.getField());
    regexGroup.setIndexValues(input.getIndexValues());
  }

  private void copyFromEntity(RegexGroup existing, RegexGroup regexGroup, boolean copyId) {
    regexGroup.setId(copyId ? existing.getId() : null);
    regexGroup.setField(existing.getField());
    regexGroup.setIndexValues(existing.getIndexValues());
  }
}
