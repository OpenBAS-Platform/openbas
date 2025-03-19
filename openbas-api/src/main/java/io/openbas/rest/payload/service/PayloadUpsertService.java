package io.openbas.rest.payload.service;

import static io.openbas.helper.StreamHelper.fromIterable;
import static io.openbas.helper.StreamHelper.iterableToSet;
import static io.openbas.rest.payload.PayloadUtils.copyProperties;
import static io.openbas.rest.payload.PayloadUtils.validateArchitecture;

import io.openbas.database.model.*;
import io.openbas.database.repository.*;
import io.openbas.rest.payload.form.PayloadUpsertInput;
import jakarta.transaction.Transactional;
import java.time.Instant;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.hibernate.Hibernate;
import org.springframework.stereotype.Service;

@Log
@RequiredArgsConstructor
@Service
public class PayloadUpsertService {

  private final TagRepository tagRepository;
  private final AttackPatternRepository attackPatternRepository;
  private final PayloadService payloadService;
  private final PayloadRepository payloadRepository;
  private final DocumentRepository documentRepository;
  private final CollectorRepository collectorRepository;

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

      PayloadType payloadType = PayloadType.fromString(existingPayload.getType());
      validateArchitecture(payloadType.key, input.getExecutionArch());
      switch (payloadType) {
        case PayloadType.COMMAND:
          Command payloadCommand = (Command) Hibernate.unproxy(existingPayload);
          copyProperties(input, payloadCommand);
          payloadCommand = payloadRepository.save(payloadCommand);
          this.payloadService.updateInjectorContractsForPayload(payloadCommand);
          return payloadCommand;
        case PayloadType.EXECUTABLE:
          Executable payloadExecutable = (Executable) Hibernate.unproxy(existingPayload);
          copyProperties(input, payloadExecutable);
          payloadExecutable.setExecutableFile(
              documentRepository.findById(input.getExecutableFile()).orElseThrow());
          payloadExecutable = payloadRepository.save(payloadExecutable);
          this.payloadService.updateInjectorContractsForPayload(payloadExecutable);
          return payloadExecutable;
        case PayloadType.FILE_DROP:
          FileDrop payloadFileDrop = (FileDrop) Hibernate.unproxy(existingPayload);
          copyProperties(input, payloadFileDrop);
          payloadFileDrop.setFileDropFile(
              documentRepository.findById(input.getFileDropFile()).orElseThrow());
          payloadFileDrop = payloadRepository.save(payloadFileDrop);
          this.payloadService.updateInjectorContractsForPayload(payloadFileDrop);
          return payloadFileDrop;
        case PayloadType.DNS_RESOLUTION:
          DnsResolution payloadDnsResolution = (DnsResolution) Hibernate.unproxy(existingPayload);
          copyProperties(input, payloadDnsResolution);
          payloadDnsResolution = payloadRepository.save(payloadDnsResolution);
          this.payloadService.updateInjectorContractsForPayload(payloadDnsResolution);
          return payloadDnsResolution;
        case PayloadType.NETWORK_TRAFFIC:
          NetworkTraffic payloadNetworkTraffic =
              (NetworkTraffic) Hibernate.unproxy(existingPayload);
          copyProperties(input, payloadNetworkTraffic);
          payloadNetworkTraffic = payloadRepository.save(payloadNetworkTraffic);
          this.payloadService.updateInjectorContractsForPayload(payloadNetworkTraffic);
          return payloadNetworkTraffic;
        default:
          throw new UnsupportedOperationException(
              "Payload type " + existingPayload.getType() + " is not supported");
      }
    } else {
      PayloadType payloadType = PayloadType.fromString(input.getType());
      validateArchitecture(payloadType.key, input.getExecutionArch());
      switch (payloadType) {
        case PayloadType.COMMAND:
          Command commandPayload = new Command();
          copyProperties(input, commandPayload);
          if (input.getCollector() != null) {
            commandPayload.setCollector(
                collectorRepository.findById(input.getCollector()).orElseThrow());
          }
          commandPayload.setAttackPatterns(
              fromIterable(
                  attackPatternRepository.findAllByExternalIdInIgnoreCase(
                      input.getAttackPatternsExternalIds())));
          commandPayload.setTags(iterableToSet(tagRepository.findAllById(input.getTagIds())));
          commandPayload = payloadRepository.save(commandPayload);
          this.payloadService.updateInjectorContractsForPayload(commandPayload);
          return commandPayload;
        case PayloadType.EXECUTABLE:
          Executable executablePayload = new Executable();
          copyProperties(input, executablePayload);
          if (input.getCollector() != null) {
            executablePayload.setCollector(
                collectorRepository.findById(input.getCollector()).orElseThrow());
          }
          executablePayload.setAttackPatterns(
              fromIterable(
                  attackPatternRepository.findAllByExternalIdInIgnoreCase(
                      input.getAttackPatternsExternalIds())));
          executablePayload.setTags(iterableToSet(tagRepository.findAllById(input.getTagIds())));
          executablePayload.setExecutableFile(
              documentRepository.findById(input.getExecutableFile()).orElseThrow());
          executablePayload = payloadRepository.save(executablePayload);
          this.payloadService.updateInjectorContractsForPayload(executablePayload);
          return executablePayload;
        case PayloadType.FILE_DROP:
          FileDrop fileDropPayload = new FileDrop();
          copyProperties(input, fileDropPayload);
          if (input.getCollector() != null) {
            fileDropPayload.setCollector(
                collectorRepository.findById(input.getCollector()).orElseThrow());
          }
          fileDropPayload.setAttackPatterns(
              fromIterable(
                  attackPatternRepository.findAllByExternalIdInIgnoreCase(
                      input.getAttackPatternsExternalIds())));
          fileDropPayload.setTags(iterableToSet(tagRepository.findAllById(input.getTagIds())));
          fileDropPayload.setFileDropFile(
              documentRepository.findById(input.getFileDropFile()).orElseThrow());
          fileDropPayload = payloadRepository.save(fileDropPayload);
          this.payloadService.updateInjectorContractsForPayload(fileDropPayload);
          return fileDropPayload;
        case PayloadType.DNS_RESOLUTION:
          DnsResolution dnsResolutionPayload = new DnsResolution();
          copyProperties(input, dnsResolutionPayload);
          if (input.getCollector() != null) {
            dnsResolutionPayload.setCollector(
                collectorRepository.findById(input.getCollector()).orElseThrow());
          }
          dnsResolutionPayload.setAttackPatterns(
              fromIterable(
                  attackPatternRepository.findAllByExternalIdInIgnoreCase(
                      input.getAttackPatternsExternalIds())));
          dnsResolutionPayload.setTags(iterableToSet(tagRepository.findAllById(input.getTagIds())));
          dnsResolutionPayload = payloadRepository.save(dnsResolutionPayload);
          this.payloadService.updateInjectorContractsForPayload(dnsResolutionPayload);
          return dnsResolutionPayload;
        case PayloadType.NETWORK_TRAFFIC:
          NetworkTraffic networkTrafficPayload = new NetworkTraffic();
          copyProperties(input, networkTrafficPayload);
          if (input.getCollector() != null) {
            networkTrafficPayload.setCollector(
                collectorRepository.findById(input.getCollector()).orElseThrow());
          }
          networkTrafficPayload.setAttackPatterns(
              fromIterable(
                  attackPatternRepository.findAllByExternalIdInIgnoreCase(
                      input.getAttackPatternsExternalIds())));
          networkTrafficPayload.setTags(
              iterableToSet(tagRepository.findAllById(input.getTagIds())));
          networkTrafficPayload = payloadRepository.save(networkTrafficPayload);
          this.payloadService.updateInjectorContractsForPayload(networkTrafficPayload);
          return networkTrafficPayload;
        default:
          throw new UnsupportedOperationException(
              "Payload type " + input.getType() + " is not supported");
      }
    }
  }
}
