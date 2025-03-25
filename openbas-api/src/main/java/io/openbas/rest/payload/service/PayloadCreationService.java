package io.openbas.rest.payload.service;

import io.openbas.database.model.Payload;
import io.openbas.rest.payload.PayloadUtils;
import io.openbas.rest.payload.form.PayloadCreateInput;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class PayloadCreationService {

  private final PayloadUtils payloadUtils;

  @Transactional(rollbackOn = Exception.class)
  public Payload createPayload(PayloadCreateInput input) {
    return payloadUtils.createPayload(input);
  }
}
