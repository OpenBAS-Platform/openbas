package io.openbas.rest.payload.service;

import static io.openbas.helper.StreamHelper.fromIterable;
import static io.openbas.helper.StreamHelper.iterableToSet;
import static io.openbas.rest.payload.PayloadUtils.validateArchitecture;

import io.openbas.database.model.*;
import io.openbas.database.repository.AttackPatternRepository;
import io.openbas.database.repository.DocumentRepository;
import io.openbas.database.repository.PayloadRepository;
import io.openbas.database.repository.TagRepository;
import io.openbas.rest.payload.PayloadUtils;
import io.openbas.rest.payload.form.PayloadCreateInput;
import jakarta.transaction.Transactional;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.springframework.stereotype.Service;

@Log
@RequiredArgsConstructor
@Service
public class PayloadCreationService {

  private final TagRepository tagRepository;
  private final AttackPatternRepository attackPatternRepository;
  private final PayloadService payloadService;
  private final PayloadRepository payloadRepository;
  private final DocumentRepository documentRepository;
  private final PayloadUtils payloadUtils;

  @Transactional(rollbackOn = Exception.class)
  public Payload createPayload(PayloadCreateInput input) {
    PayloadType payloadType = PayloadType.fromString(input.getType());
    validateArchitecture(payloadType.key, input.getExecutionArch());
    switch (payloadType) {
      case PayloadType.COMMAND:
        Command commandPayload = new Command();
        payloadUtils.copyProperties(input, commandPayload);
        commandPayload.setAttackPatterns(
            fromIterable(attackPatternRepository.findAllById(input.getAttackPatternsIds())));
        commandPayload.setTags(iterableToSet(tagRepository.findAllById(input.getTagIds())));
        commandPayload = payloadRepository.save(commandPayload);
        this.payloadService.updateInjectorContractsForPayload(commandPayload);
        return commandPayload;
      case PayloadType.EXECUTABLE:
        Executable executablePayload = new Executable();
        payloadUtils.copyProperties(input, executablePayload);
        executablePayload.setAttackPatterns(
            fromIterable(attackPatternRepository.findAllById(input.getAttackPatternsIds())));
        executablePayload.setTags(iterableToSet(tagRepository.findAllById(input.getTagIds())));
        executablePayload.setExecutableFile(
            documentRepository.findById(input.getExecutableFile()).orElseThrow());
        executablePayload = payloadRepository.save(executablePayload);
        this.payloadService.updateInjectorContractsForPayload(executablePayload);
        return executablePayload;
      case PayloadType.FILE_DROP:
        FileDrop fileDropPayload = new FileDrop();
        payloadUtils.copyProperties(input, fileDropPayload);
        fileDropPayload.setAttackPatterns(
            fromIterable(attackPatternRepository.findAllById(input.getAttackPatternsIds())));
        fileDropPayload.setTags(iterableToSet(tagRepository.findAllById(input.getTagIds())));
        Optional<Document> document = documentRepository.findById(input.getFileDropFile());
        if (document.isPresent()) {
          fileDropPayload.setFileDropFile(document.get());
        } else {
          log.info("Document not found: " + input.getFileDropFile());
        }
        fileDropPayload = payloadRepository.save(fileDropPayload);
        this.payloadService.updateInjectorContractsForPayload(fileDropPayload);
        return fileDropPayload;
      case PayloadType.DNS_RESOLUTION:
        DnsResolution dnsResolutionPayload = new DnsResolution();
        payloadUtils.copyProperties(input, dnsResolutionPayload);
        dnsResolutionPayload.setAttackPatterns(
            fromIterable(attackPatternRepository.findAllById(input.getAttackPatternsIds())));
        dnsResolutionPayload.setTags(iterableToSet(tagRepository.findAllById(input.getTagIds())));
        dnsResolutionPayload = payloadRepository.save(dnsResolutionPayload);
        this.payloadService.updateInjectorContractsForPayload(dnsResolutionPayload);
        return dnsResolutionPayload;
      case PayloadType.NETWORK_TRAFFIC:
        NetworkTraffic networkTrafficPayload = new NetworkTraffic();
        payloadUtils.copyProperties(input, networkTrafficPayload);
        networkTrafficPayload.setAttackPatterns(
            fromIterable(attackPatternRepository.findAllById(input.getAttackPatternsIds())));
        networkTrafficPayload.setTags(iterableToSet(tagRepository.findAllById(input.getTagIds())));
        networkTrafficPayload = payloadRepository.save(networkTrafficPayload);
        this.payloadService.updateInjectorContractsForPayload(networkTrafficPayload);
        return networkTrafficPayload;
      default:
        throw new UnsupportedOperationException(
            "Payload type " + input.getType() + " is not supported");
    }
  }
}
