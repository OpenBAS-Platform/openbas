package io.openbas.rest.payload;

import static java.time.Instant.now;

import io.openbas.database.model.ContractOutputElement;
import io.openbas.database.model.RegexGroup;
import io.openbas.rest.payload.form.RegexGroupInput;
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
public class RegexGroupUtils {

  public void copyRegexGroups(
      Set<?> inputElements, ContractOutputElement contractOutputElement, boolean copyId) {
    if (inputElements != null) {
      Set<RegexGroup> regexGroups =
          inputElements.stream()
              .map(
                  inputElement -> {
                    RegexGroup regexGroup = new RegexGroup();
                    regexGroup.setContractOutputElement(contractOutputElement);

                    Instant now = now();
                    regexGroup.setCreatedAt(now);
                    regexGroup.setUpdatedAt(now);

                    if (inputElement instanceof RegexGroupInput) {
                      RegexGroupInput regexGroupInput = (RegexGroupInput) inputElement;
                      if (!copyId) {
                        regexGroup.setId(null);
                      } else {
                        regexGroup.setId(regexGroupInput.getId());
                      }
                      regexGroup.setField(regexGroupInput.getField());
                      regexGroup.setIndexValues(regexGroupInput.getIndexValues());
                    } else if (inputElement instanceof RegexGroup) {
                      RegexGroup regexGroupInstance = (RegexGroup) inputElement;
                      if (!copyId) {
                        regexGroup.setId(null);
                      } else {
                        regexGroup.setField(regexGroupInstance.getId());
                      }
                      regexGroup.setField(regexGroupInstance.getField());
                      regexGroup.setIndexValues(regexGroupInstance.getIndexValues());
                    }
                    return regexGroup;
                  })
              .collect(Collectors.toSet());

      contractOutputElement.setRegexGroups(new HashSet<>(regexGroups));
    }
  }
}
