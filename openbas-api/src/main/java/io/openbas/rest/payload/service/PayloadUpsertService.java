package io.openbas.rest.payload.service;

import static io.openbas.helper.StreamHelper.fromIterable;
import static io.openbas.helper.StreamHelper.iterableToSet;

import io.openbas.database.model.Payload;
import io.openbas.database.repository.AttackPatternRepository;
import io.openbas.database.repository.CollectorRepository;
import io.openbas.database.repository.PayloadRepository;
import io.openbas.database.repository.TagRepository;
import io.openbas.rest.payload.PayloadUtils;
import io.openbas.rest.payload.form.PayloadUpsertInput;
import jakarta.transaction.Transactional;
import java.time.Instant;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class PayloadUpsertService {

  private final TagRepository tagRepository;
  private final AttackPatternRepository attackPatternRepository;
  private final PayloadRepository payloadRepository;
  private final CollectorRepository collectorRepository;
  private final PayloadUtils payloadUtils;

  @Transactional(rollbackOn = Exception.class)
  public Payload upsertPayload(PayloadUpsertInput input) {
    Optional<Payload> payload = payloadRepository.findByExternalId(input.getExternalId());
    if (payload.isPresent()) {
      Payload existingPayload = payload.get();
      if (input.getCollector() != null) {
        existingPayload.setCollector(
            collectorRepository.findById(input.getCollector()).orElseThrow());
      }
      existingPayload.setAttackPatterns(
          fromIterable(
              attackPatternRepository.findAllByExternalIdInIgnoreCase(
                  input.getAttackPatternsExternalIds())));
      existingPayload.setTags(iterableToSet(tagRepository.findAllById(input.getTagIds())));
      existingPayload.setUpdatedAt(Instant.now());
      return payloadUtils.updatePayloadFromUpsert(input, existingPayload);
    } else {
      return payloadUtils.createPayloadFromUpsert(input);
    }
  }
}
