package io.openbas.rest.payload.service;

import static io.openbas.rest.payload.PayloadUtils.validateArchitecture;

import io.openbas.config.cache.LicenseCacheManager;
import io.openbas.database.model.*;
import io.openbas.database.repository.AttackPatternRepository;
import io.openbas.database.repository.PayloadRepository;
import io.openbas.ee.Ee;
import io.openbas.integrations.CollectorService;
import io.openbas.rest.document.DocumentService;
import io.openbas.rest.payload.PayloadUtils;
import io.openbas.rest.payload.form.PayloadUpsertInput;
import io.openbas.rest.tag.TagService;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.hibernate.Hibernate;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class PayloadUpsertService {

  private final PayloadUtils payloadUtils;

  private final PayloadService payloadService;
  private final Ee eeService;
  private final LicenseCacheManager licenseCacheManager;

  private final TagService tagService;
  private final AttackPatternRepository attackPatternRepository;
  private final PayloadRepository payloadRepository;
  private final CollectorService collectorService;
  private final DocumentService documentService;

  @Transactional(rollbackOn = Exception.class)
  public Payload upsertPayload(PayloadUpsertInput input) {
    Optional<Payload> payload = payloadRepository.findByExternalId(input.getExternalId());
    if (eeService.isEnterpriseLicenseInactive(licenseCacheManager.getEnterpriseEditionInfo())) {
      input.setDetectionRemediations(null);
    }

    Collector collector = null;
    if (input.getCollector() != null) {
      collector = this.collectorService.collector(input.getCollector());
    }
    List<AttackPattern> attackPatterns =
        attackPatternRepository.findAllByExternalIdInIgnoreCase(
            input.getAttackPatternsExternalIds());
    if (payload.isPresent()) {
      return updatePayloadFromUpsert(input, payload.get(), attackPatterns, collector);
    } else {
      return createPayloadFromUpsert(input, attackPatterns, collector);
    }
  }

  private Payload createPayloadFromUpsert(
      PayloadUpsertInput input, List<AttackPattern> attackPatterns, Collector collector) {
    PayloadType payloadType = PayloadType.fromString(input.getType());
    validateArchitecture(payloadType.key, input.getExecutionArch());

    Payload payload = payloadType.getPayloadSupplier().get();
    payloadUtils.copyProperties(input, payload, false);

    if (collector != null) {
      payload.setCollector(collector);
    }

    payload.setAttackPatterns(attackPatterns);
    payload.setTags(this.tagService.tagSet((input.getTagIds())));

    if (payload instanceof Executable executable) {
      executable.setExecutableFile(documentService.document(input.getExecutableFile()));
    } else if (payload instanceof FileDrop fileDrop) {
      fileDrop.setFileDropFile(documentService.document(input.getFileDropFile()));
    }

    Payload saved = payloadRepository.save(payload);
    payloadService.updateInjectorContractsForPayload(saved);
    return saved;
  }

  public Payload updatePayloadFromUpsert(
      PayloadUpsertInput input,
      Payload existingPayload,
      List<AttackPattern> attackPatterns,
      Collector collector) {
    PayloadType payloadType = PayloadType.fromString(existingPayload.getType());
    validateArchitecture(payloadType.key, input.getExecutionArch());

    Payload payload = (Payload) Hibernate.unproxy(existingPayload);
    payloadUtils.copyProperties(input, payload, true);

    if (collector != null) {
      payload.setCollector(collector);
    }

    payload.setAttackPatterns(attackPatterns);
    payload.setTags(this.tagService.tagSet((input.getTagIds())));

    if (payload instanceof Executable executable) {
      executable.setExecutableFile(documentService.document(input.getExecutableFile()));
    } else if (payload instanceof FileDrop fileDrop) {
      fileDrop.setFileDropFile(documentService.document(input.getFileDropFile()));
    }

    Payload saved = payloadRepository.save(payload);
    payloadService.updateInjectorContractsForPayload(saved);
    return saved;
  }
}
