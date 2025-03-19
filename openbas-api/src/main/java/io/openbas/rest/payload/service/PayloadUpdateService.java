package io.openbas.rest.payload.service;

import static io.openbas.helper.StreamHelper.fromIterable;
import static io.openbas.helper.StreamHelper.iterableToSet;
import static io.openbas.rest.payload.PayloadUtils.copyProperties;
import static io.openbas.rest.payload.PayloadUtils.validateArchitecture;

import io.openbas.database.model.*;
import io.openbas.database.repository.AttackPatternRepository;
import io.openbas.database.repository.DocumentRepository;
import io.openbas.database.repository.PayloadRepository;
import io.openbas.database.repository.TagRepository;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.payload.form.PayloadUpdateInput;
import jakarta.transaction.Transactional;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.hibernate.Hibernate;
import org.springframework.stereotype.Service;

@Log
@RequiredArgsConstructor
@Service
public class PayloadUpdateService {

  private final TagRepository tagRepository;
  private final AttackPatternRepository attackPatternRepository;
  private final PayloadService payloadService;
  private final PayloadRepository payloadRepository;
  private final DocumentRepository documentRepository;

  @Transactional(rollbackOn = Exception.class)
  public Payload updatePayload(String payloadId, PayloadUpdateInput input) {
    Payload payload =
        this.payloadRepository.findById(payloadId).orElseThrow(ElementNotFoundException::new);
    payload.setAttackPatterns(
        fromIterable(attackPatternRepository.findAllById(input.getAttackPatternsIds())));
    payload.setTags(iterableToSet(tagRepository.findAllById(input.getTagIds())));
    payload.setUpdatedAt(Instant.now());

    PayloadType payloadType = PayloadType.fromString(payload.getType());
    validateArchitecture(payloadType.key, input.getExecutionArch());
    switch (payloadType) {
      case PayloadType.COMMAND:
        Command payloadCommand = (Command) Hibernate.unproxy(payload);
        copyProperties(input, payloadCommand);
        payloadCommand = payloadRepository.save(payloadCommand);
        this.payloadService.updateInjectorContractsForPayload(payloadCommand);
        return payloadCommand;
      case PayloadType.EXECUTABLE:
        Executable payloadExecutable = (Executable) Hibernate.unproxy(payload);
        copyProperties(input, payloadExecutable);
        payloadExecutable.setExecutableFile(
            documentRepository.findById(input.getExecutableFile()).orElseThrow());
        payloadExecutable = payloadRepository.save(payloadExecutable);
        this.payloadService.updateInjectorContractsForPayload(payloadExecutable);
        return payloadExecutable;
      case PayloadType.FILE_DROP:
        FileDrop payloadFileDrop = (FileDrop) Hibernate.unproxy(payload);
        copyProperties(input, payloadFileDrop);
        payloadFileDrop.setFileDropFile(
            documentRepository.findById(input.getFileDropFile()).orElseThrow());
        payloadFileDrop = payloadRepository.save(payloadFileDrop);
        this.payloadService.updateInjectorContractsForPayload(payloadFileDrop);
        return payloadFileDrop;
      case PayloadType.DNS_RESOLUTION:
        DnsResolution payloadDnsResolution = (DnsResolution) Hibernate.unproxy(payload);
        copyProperties(input, payloadDnsResolution);
        payloadDnsResolution = payloadRepository.save(payloadDnsResolution);
        this.payloadService.updateInjectorContractsForPayload(payloadDnsResolution);
        return payloadDnsResolution;
      case PayloadType.NETWORK_TRAFFIC:
        NetworkTraffic payloadNetworkTraffic = (NetworkTraffic) Hibernate.unproxy(payload);
        copyProperties(input, payloadNetworkTraffic);
        payloadNetworkTraffic = payloadRepository.save(payloadNetworkTraffic);
        this.payloadService.updateInjectorContractsForPayload(payloadNetworkTraffic);
        return payloadNetworkTraffic;
      default:
        throw new UnsupportedOperationException(
            "Payload type " + payload.getType() + " is not supported");
    }
  }
}
