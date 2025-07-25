package io.openbas.rest.payload;

import static java.time.Instant.now;

import io.openbas.database.model.Collector;
import io.openbas.database.model.DetectionRemediation;
import io.openbas.database.model.Payload;
import io.openbas.database.repository.CollectorRepository;
import io.openbas.rest.payload.form.DetectionRemediationInput;
import jakarta.persistence.EntityManager;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Component;

@Slf4j
@RequiredArgsConstructor
@Component
public class DetectionRemediationUtils {

  private final CollectorRepository collectorRepository;
  private final EntityManager entityManager;

  public <T> void copy(List<T> detectionRemediations, Payload target, boolean copyId) {
    if (detectionRemediations == null) {
      return;
    }
    Instant now = now();

    List<DetectionRemediation> newDetectionRemediations =
        detectionRemediations.stream()
            .map(dRemediation -> copy(dRemediation, target, copyId, now))
            .toList();

    target.setDetectionRemediations(new ArrayList<>(newDetectionRemediations));
  }

  private <T> DetectionRemediation copy(
      T detectionRemediation, Payload target, boolean copyId, Instant now) {

    DetectionRemediation newDetectionRemediation = new DetectionRemediation();
    // FIXME the merge added here fix the issue/3690, for some reason Hibernate try to persist the
    // payload when we call the findByType #64 and as the OuterPArser is not managed it trigger an
    // exception
    newDetectionRemediation.setPayload(entityManager.merge(target));
    newDetectionRemediation.setCreationDate(now);
    newDetectionRemediation.setUpdateDate(now);

    if (detectionRemediation instanceof DetectionRemediationInput) {
      copy((DetectionRemediationInput) detectionRemediation, newDetectionRemediation, copyId);
    } else if (detectionRemediation instanceof DetectionRemediation) {
      copy((DetectionRemediation) detectionRemediation, newDetectionRemediation, copyId);
    }
    return newDetectionRemediation;
  }

  private void copy(
      DetectionRemediationInput input,
      DetectionRemediation newDetectionRemediation,
      boolean copyId) {
    BeanUtils.copyProperties(input, newDetectionRemediation, "id");

    Collector collector = collectorRepository.findByType(input.getCollectorType()).orElseThrow();
    newDetectionRemediation.setCollector(collector);

    if (copyId) {
      newDetectionRemediation.setId(input.getId());
    }
  }

  private void copy(
      DetectionRemediation origin, DetectionRemediation newDetectionRemediation, boolean copyId) {
    BeanUtils.copyProperties(origin, newDetectionRemediation, "id");

    newDetectionRemediation.setCollector(origin.getCollector());

    if (copyId) {
      newDetectionRemediation.setId(origin.getId());
    }
  }
}
