package io.openbas.rest.finding;

import static io.openbas.database.model.ContractOutputType.*;

import io.openbas.database.model.*;
import io.openbas.database.repository.FindingRepository;
import java.util.*;
import java.util.logging.Level;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Component;

@Log
@RequiredArgsConstructor
@Component
public class FindingUtils {

  private final FindingRepository findingRepository;

  public void buildFinding(
      InjectStatus execution,
      Asset asset,
      io.openbas.database.model.ContractOutputElement contractOutputElement,
      String finalValue) {
    try {
      Optional<Finding> optionalFinding =
          findingRepository.findByExecutionIdAndValueAndTypeAndKey(
              execution.getId(),
              finalValue,
              contractOutputElement.getType(),
              contractOutputElement.getKey());

      Finding finding =
          optionalFinding.orElseGet(
              () -> {
                Finding newFinding = new Finding();
                newFinding.setInject(execution.getInject());
                newFinding.setExecution(execution);
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
      handleRaceCondition(execution, asset, contractOutputElement, finalValue);
    }
  }

  private void handleRaceCondition(
      InjectStatus execution,
      Asset asset,
      ContractOutputElement contractOutputElement,
      String finalValue) {
    Optional<Finding> retryFinding =
        findingRepository.findByExecutionIdAndValueAndTypeAndKey(
            execution.getId(),
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
