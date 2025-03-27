package io.openbas.rest.payload;

import static java.time.Instant.now;

import io.openbas.database.model.ContractOutputElement;
import io.openbas.database.model.RegexGroup;
import io.openbas.database.repository.RegexGroupRepository;
import io.openbas.rest.payload.form.ContractOutputElementInput;
import io.openbas.rest.payload.form.RegexGroupInput;
import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Component;

@Log
@RequiredArgsConstructor
@Component
public class RegexGroupUtils {

  private final RegexGroupRepository regexGroupRepository;

  public void copyRegexGroups(
      Set<?> inputElements, ContractOutputElement contractOutputElement, boolean copyId) {
    if (inputElements != null) {
      Set<RegexGroup> regexGroups =
          inputElements.stream()
              .map(
                  inputElement -> {
                    RegexGroup regexGroup = new RegexGroup();
                    BeanUtils.copyProperties(inputElement, regexGroup);
                    if (!copyId) {
                      regexGroup.setId(null);
                    }
                    regexGroup.setContractOutputElement(contractOutputElement);

                    Instant now = now();
                    regexGroup.setCreatedAt(now);
                    regexGroup.setUpdatedAt(now);

                    return regexGroup;
                  })
              .collect(Collectors.toSet());

      contractOutputElement.setRegexGroups(regexGroups);
    }
  }

  public void removeOrphanRegexGroups(Set<ContractOutputElementInput> contractOutputElementInputs) {
    contractOutputElementInputs.stream()
        .forEach(
            contractOutputElementInput -> {
              List<String> regexGroupInputToBeUpdated =
                  contractOutputElementInput.getRegexGroups().stream()
                      .map(RegexGroupInput::getId)
                      .filter(Objects::nonNull)
                      .toList();
              if (regexGroupInputToBeUpdated.isEmpty()) {
                regexGroupRepository.deleteByContractOutputElementId(
                    contractOutputElementInput.getId());
              }
              regexGroupRepository.deleteByContractOutputElementAndIdNotIn(
                  contractOutputElementInput.getId(), regexGroupInputToBeUpdated);
            });
  }
}
