package io.openbas.rest.payload.service;

import static io.openbas.helper.StreamHelper.fromIterable;
import static io.openbas.helper.StreamHelper.iterableToSet;

import io.openbas.database.model.Payload;
import io.openbas.database.repository.AttackPatternRepository;
import io.openbas.database.repository.PayloadRepository;
import io.openbas.database.repository.TagRepository;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.payload.PayloadUtils;
import io.openbas.rest.payload.form.PayloadUpdateInput;
import jakarta.transaction.Transactional;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class PayloadUpdateService {

  private final TagRepository tagRepository;
  private final AttackPatternRepository attackPatternRepository;
  private final PayloadRepository payloadRepository;
  private final PayloadUtils payloadUtils;

  @Transactional(rollbackOn = Exception.class)
  public Payload updatePayload(String payloadId, PayloadUpdateInput input) {
    Payload payload =
        this.payloadRepository.findById(payloadId).orElseThrow(ElementNotFoundException::new);
    payload.setAttackPatterns(
        fromIterable(attackPatternRepository.findAllById(input.getAttackPatternsIds())));
    payload.setTags(iterableToSet(tagRepository.findAllById(input.getTagIds())));
    payload.setUpdatedAt(Instant.now());
    return payloadUtils.updatePayload(input, payload);
  }
}
