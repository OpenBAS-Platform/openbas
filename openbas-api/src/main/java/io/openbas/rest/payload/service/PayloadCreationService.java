package io.openbas.rest.payload.service;

import static io.openbas.helper.StreamHelper.fromIterable;
import static io.openbas.helper.StreamHelper.iterableToSet;
import static io.openbas.rest.payload.PayloadUtils.validateArchitecture;

import io.openbas.config.cache.LicenseCacheManager;
import io.openbas.database.model.*;
import io.openbas.database.repository.AttackPatternRepository;
import io.openbas.database.repository.DocumentRepository;
import io.openbas.database.repository.PayloadRepository;
import io.openbas.database.repository.TagRepository;
import io.openbas.ee.Ee;
import io.openbas.rest.payload.PayloadUtils;
import io.openbas.rest.payload.form.PayloadCreateInput;
import jakarta.transaction.Transactional;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@RequiredArgsConstructor
@Service
public class PayloadCreationService {

  private final PayloadUtils payloadUtils;

  private final PayloadService payloadService;
  private final Ee eeService;
  private final LicenseCacheManager licenseCacheManager;

  private final TagRepository tagRepository;
  private final AttackPatternRepository attackPatternRepository;
  private final PayloadRepository payloadRepository;
  private final DocumentRepository documentRepository;

  @Transactional(rollbackOn = Exception.class)
  public Payload createPayload(PayloadCreateInput input) {
    if (eeService.isEnterpriseLicenseInactive(licenseCacheManager.getEnterpriseEditionInfo())) {
      input.setDetectionRemediations(null);
    }

    return create(input);
  }

  private Payload create(PayloadCreateInput input) {
    PayloadType payloadType = PayloadType.fromString(input.getType());
    validateArchitecture(payloadType.key, input.getExecutionArch());

    switch (payloadType) {
      case COMMAND:
        Command commandPayload = new Command();
        payloadUtils.copyProperties(input, commandPayload, false);
        commandPayload.setAttackPatterns(
            fromIterable(attackPatternRepository.findAllById(input.getAttackPatternsIds())));
        commandPayload.setTags(iterableToSet(tagRepository.findAllById(input.getTagIds())));
        commandPayload = payloadRepository.save(commandPayload);
        this.payloadService.updateInjectorContractsForPayload(commandPayload);
        return commandPayload;
      case EXECUTABLE:
        Executable executablePayload = new Executable();
        payloadUtils.copyProperties(input, executablePayload, false);
        executablePayload.setAttackPatterns(
            fromIterable(attackPatternRepository.findAllById(input.getAttackPatternsIds())));
        executablePayload.setTags(iterableToSet(tagRepository.findAllById(input.getTagIds())));
        executablePayload.setExecutableFile(
            documentRepository.findById(input.getExecutableFile()).orElseThrow());
        executablePayload = payloadRepository.save(executablePayload);
        this.payloadService.updateInjectorContractsForPayload(executablePayload);
        return executablePayload;
      case FILE_DROP:
        FileDrop fileDropPayload = new FileDrop();
        payloadUtils.copyProperties(input, fileDropPayload, false);
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
      case DNS_RESOLUTION:
        DnsResolution dnsResolutionPayload = new DnsResolution();
        payloadUtils.copyProperties(input, dnsResolutionPayload, false);
        dnsResolutionPayload.setAttackPatterns(
            fromIterable(attackPatternRepository.findAllById(input.getAttackPatternsIds())));
        dnsResolutionPayload.setTags(iterableToSet(tagRepository.findAllById(input.getTagIds())));
        dnsResolutionPayload = payloadRepository.save(dnsResolutionPayload);
        this.payloadService.updateInjectorContractsForPayload(dnsResolutionPayload);
        return dnsResolutionPayload;
      case NETWORK_TRAFFIC:
        NetworkTraffic networkTrafficPayload = new NetworkTraffic();
        payloadUtils.copyProperties(input, networkTrafficPayload, false);
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
