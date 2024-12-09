package io.openbas.rest.payload;

import static io.openbas.helper.StreamHelper.fromIterable;
import static io.openbas.helper.StreamHelper.iterableToSet;

import io.openbas.database.model.*;
import io.openbas.database.repository.AttackPatternRepository;
import io.openbas.database.repository.DocumentRepository;
import io.openbas.database.repository.PayloadRepository;
import io.openbas.database.repository.TagRepository;
import io.openbas.integrations.PayloadService;
import io.openbas.rest.exception.BadRequestException;
import io.openbas.rest.payload.form.PayloadCreateInput;
import jakarta.transaction.Transactional;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.jetbrains.annotations.NotNull;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class PayloadCreationService {

  private final TagRepository tagRepository;
  private final AttackPatternRepository attackPatternRepository;
  private final PayloadService payloadService;
  private final PayloadRepository payloadRepository;
  private final DocumentRepository documentRepository;

  @Transactional(rollbackOn = Exception.class)
  public Payload createPayload(PayloadCreateInput input) {
    switch (PayloadType.fromString(input.getType())) {
      case PayloadType.COMMAND:
        Command commandPayload = new Command();
        commandPayload.setUpdateAttributes(input);
        commandPayload.setAttackPatterns(
            fromIterable(attackPatternRepository.findAllById(input.getAttackPatternsIds())));
        commandPayload.setTags(iterableToSet(tagRepository.findAllById(input.getTagIds())));
        commandPayload = payloadRepository.save(commandPayload);
        this.payloadService.updateInjectorContractsForPayload(commandPayload);
        return commandPayload;
      case PayloadType.EXECUTABLE:
        Executable executablePayload = new Executable();
        PayloadCreateInput validatedInput = validateExecutableCreateInput(input);
        executablePayload.setUpdateAttributes(validatedInput);
        executablePayload.setAttackPatterns(
            fromIterable(
                attackPatternRepository.findAllById(validatedInput.getAttackPatternsIds())));
        executablePayload.setTags(
            iterableToSet(tagRepository.findAllById(validatedInput.getTagIds())));
        executablePayload.setExecutableFile(
            documentRepository.findById(validatedInput.getExecutableFile()).orElseThrow());
        executablePayload = payloadRepository.save(executablePayload);
        this.payloadService.updateInjectorContractsForPayload(executablePayload);
        return executablePayload;
      case PayloadType.FILE_DROP:
        FileDrop fileDropPayload = new FileDrop();
        fileDropPayload.setUpdateAttributes(input);
        fileDropPayload.setAttackPatterns(
            fromIterable(attackPatternRepository.findAllById(input.getAttackPatternsIds())));
        fileDropPayload.setTags(iterableToSet(tagRepository.findAllById(input.getTagIds())));
        fileDropPayload.setFileDropFile(
            documentRepository.findById(input.getFileDropFile()).orElseThrow());
        fileDropPayload = payloadRepository.save(fileDropPayload);
        this.payloadService.updateInjectorContractsForPayload(fileDropPayload);
        return fileDropPayload;
      case PayloadType.DNS_RESOLUTION:
        DnsResolution dnsResolutionPayload = new DnsResolution();
        dnsResolutionPayload.setUpdateAttributes(input);
        dnsResolutionPayload.setAttackPatterns(
            fromIterable(attackPatternRepository.findAllById(input.getAttackPatternsIds())));
        dnsResolutionPayload.setTags(iterableToSet(tagRepository.findAllById(input.getTagIds())));
        dnsResolutionPayload = payloadRepository.save(dnsResolutionPayload);
        this.payloadService.updateInjectorContractsForPayload(dnsResolutionPayload);
        return dnsResolutionPayload;
      case PayloadType.NETWORK_TRAFFIC:
        NetworkTraffic networkTrafficPayload = new NetworkTraffic();
        networkTrafficPayload.setUpdateAttributes(input);
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

  private static PayloadCreateInput validateExecutableCreateInput(
      @NotNull final PayloadCreateInput input) {
    Optional<Endpoint.PLATFORM_ARCH> maybeArch = Optional.ofNullable(input.getExecutableArch());
    if (maybeArch.isPresent()) {
      return input;
    } else {
      throw new BadRequestException("Executable arch is missing");
    }
  }
}
