package io.openbas.rest.payload.service;

import static io.openbas.helper.StreamHelper.fromIterable;
import static io.openbas.helper.StreamHelper.iterableToSet;
import static io.openbas.rest.payload.PayloadUtils.validateArchitecture;

import io.openbas.database.model.*;
import io.openbas.database.repository.*;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.payload.OutputParserUtils;
import io.openbas.rest.payload.PayloadUtils;
import io.openbas.rest.payload.form.PayloadUpdateInput;
import jakarta.transaction.Transactional;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import org.hibernate.Hibernate;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class PayloadUpdateService {

  private final PayloadUtils payloadUtils;

  private final PayloadService payloadService;

  private final TagRepository tagRepository;
  private final AttackPatternRepository attackPatternRepository;
  private final PayloadRepository payloadRepository;
  private final DocumentRepository documentRepository;
  private final OutputParserUtils outputParserUtils;

  @Transactional(rollbackOn = Exception.class)
  public Payload updatePayload(String payloadId, PayloadUpdateInput input) {
    Payload payload =
        this.payloadRepository.findById(payloadId).orElseThrow(ElementNotFoundException::new);
    payload.setAttackPatterns(
        fromIterable(attackPatternRepository.findAllById(input.getAttackPatternsIds())));
    payload.setTags(iterableToSet(tagRepository.findAllById(input.getTagIds())));
    payload.setUpdatedAt(Instant.now());

    outputParserUtils.removeOrphanOutputParsers(input.getOutputParsers(), payload.getId());

    return update(input, payload);
  }

  private Payload update(PayloadUpdateInput input, Payload existingPayload) {
    PayloadType payloadType = PayloadType.fromString(existingPayload.getType());
    validateArchitecture(payloadType.key, input.getExecutionArch());

    switch (payloadType) {
      case COMMAND:
        Command payloadCommand = (Command) Hibernate.unproxy(existingPayload);
        payloadUtils.copyProperties(input, payloadCommand, true);
        payloadCommand = payloadRepository.save(payloadCommand);
        this.payloadService.updateInjectorContractsForPayload(payloadCommand);
        return payloadCommand;
      case EXECUTABLE:
        Executable payloadExecutable = (Executable) Hibernate.unproxy(existingPayload);
        payloadUtils.copyProperties(input, payloadExecutable, true);
        payloadExecutable.setExecutableFile(
            documentRepository.findById(input.getExecutableFile()).orElseThrow());
        payloadExecutable = payloadRepository.save(payloadExecutable);
        this.payloadService.updateInjectorContractsForPayload(payloadExecutable);
        return payloadExecutable;
      case FILE_DROP:
        FileDrop payloadFileDrop = (FileDrop) Hibernate.unproxy(existingPayload);
        payloadUtils.copyProperties(input, payloadFileDrop, true);
        payloadFileDrop.setFileDropFile(
            documentRepository.findById(input.getFileDropFile()).orElseThrow());
        payloadFileDrop = payloadRepository.save(payloadFileDrop);
        this.payloadService.updateInjectorContractsForPayload(payloadFileDrop);
        return payloadFileDrop;
      case DNS_RESOLUTION:
        DnsResolution payloadDnsResolution = (DnsResolution) Hibernate.unproxy(existingPayload);
        payloadUtils.copyProperties(input, payloadDnsResolution, true);
        payloadDnsResolution = payloadRepository.save(payloadDnsResolution);
        this.payloadService.updateInjectorContractsForPayload(payloadDnsResolution);
        return payloadDnsResolution;
      case NETWORK_TRAFFIC:
        NetworkTraffic payloadNetworkTraffic = (NetworkTraffic) Hibernate.unproxy(existingPayload);
        payloadUtils.copyProperties(input, payloadNetworkTraffic, true);
        payloadNetworkTraffic = payloadRepository.save(payloadNetworkTraffic);
        this.payloadService.updateInjectorContractsForPayload(payloadNetworkTraffic);
        return payloadNetworkTraffic;
      default:
        throw new UnsupportedOperationException(
            "Payload type " + existingPayload.getType() + " is not supported");
    }
  }
}
