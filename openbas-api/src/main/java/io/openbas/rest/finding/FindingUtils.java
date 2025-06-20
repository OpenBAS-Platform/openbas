package io.openbas.rest.finding;

import io.openbas.database.model.*;
import io.openbas.database.repository.FindingRepository;
import java.util.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Component;

@Slf4j
@RequiredArgsConstructor
@Component
public class FindingUtils {

  private final FindingRepository findingRepository;

  public void buildFinding(
      Inject inject,
      Asset asset,
      io.openbas.database.model.ContractOutputElement contractOutputElement,
      String finalValue) {
    try {
      Optional<Finding> optionalFinding =
          findingRepository.findByInjectIdAndValueAndTypeAndKey(
              inject.getId(),
              finalValue,
              contractOutputElement.getType(),
              contractOutputElement.getKey());

      Finding finding =
          optionalFinding.orElseGet(
              () -> {
                Finding newFinding = new Finding();
                newFinding.setInject(inject);
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
      log.info(
          String.format(
              "Race condition: finding already exists. Retrying ... %s ", ex.getMessage()),
          ex);
      // Re-fetch and try to add the asset
      handleRaceCondition(inject, asset, contractOutputElement, finalValue);
    }
  }

  public SimpleFinding buildSimplerFinding(
      String injectId,
      String assetId,
      io.openbas.database.model.ContractOutputElement contractOutputElement,
      String finalValue) {

    SimpleFinding newFinding = new SimpleFinding();
    newFinding.setInjectId(injectId);
    newFinding.setField(contractOutputElement.getKey());
    newFinding.setType(contractOutputElement.getType().toString());
    newFinding.setValue(finalValue);
    newFinding.setName(contractOutputElement.getName());
    newFinding.getAssets().add(assetId);
    newFinding.setTags(
        new HashSet<>(contractOutputElement.getTags().stream().map(Tag::getId).toList()));
    return newFinding;
  }

  private void handleRaceCondition(
      Inject inject, Asset asset, ContractOutputElement contractOutputElement, String finalValue) {
    Optional<Finding> retryFinding =
        findingRepository.findByInjectIdAndValueAndTypeAndKey(
            inject.getId(),
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
      log.warn("Retry failed: Finding still not found after race condition.");
    }
  }
}
