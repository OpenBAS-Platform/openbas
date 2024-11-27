package io.openbas.rest.payload;

import static io.openbas.database.model.Payload.PAYLOAD_EXECUTION_ARCH.ARM64;
import static io.openbas.database.model.Payload.PAYLOAD_EXECUTION_ARCH.x86_64;
import static io.openbas.database.model.User.ROLE_ADMIN;
import static io.openbas.database.model.User.ROLE_USER;
import static io.openbas.helper.StreamHelper.fromIterable;
import static io.openbas.helper.StreamHelper.iterableToSet;
import static io.openbas.utils.ArchitectureFilterUtils.handleArchitectureFilter;
import static io.openbas.utils.pagination.PaginationUtils.buildPaginationJPA;

import io.openbas.database.model.*;
import io.openbas.database.repository.*;
import io.openbas.integrations.PayloadService;
import io.openbas.rest.exception.BadRequestException;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.rest.payload.form.PayloadCreateInput;
import io.openbas.rest.payload.form.PayloadUpdateInput;
import io.openbas.rest.payload.form.PayloadUpsertInput;
import io.openbas.rest.payload.form.PayloadsDeprecateInput;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.time.Instant;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.hibernate.Hibernate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@Secured(ROLE_USER)
@RequiredArgsConstructor
public class PayloadApi extends RestBehavior {

  public static final String PAYLOAD_URI = "/api/payloads";

  private final PayloadRepository payloadRepository;
  private final TagRepository tagRepository;
  private final PayloadService payloadService;
  private final AttackPatternRepository attackPatternRepository;
  private final DocumentRepository documentRepository;
  private final CollectorRepository collectorRepository;

  @PostMapping(PAYLOAD_URI + "/search")
  public Page<Payload> payloads(
      @RequestBody @Valid final SearchPaginationInput searchPaginationInput) {
    return buildPaginationJPA(
        (Specification<Payload> specification, Pageable pageable) ->
            this.payloadRepository.findAll(specification, pageable),
        handleArchitectureFilter(searchPaginationInput),
        Payload.class);
  }

  @GetMapping(PAYLOAD_URI + "/{payloadId}")
  public Payload payload(@PathVariable String payloadId) {
    return payloadRepository.findById(payloadId).orElseThrow(ElementNotFoundException::new);
  }

  @PostMapping(PAYLOAD_URI)
  @PreAuthorize("isPlanner()")
  @Transactional(rollbackOn = Exception.class)
  public Payload createPayload(@Valid @RequestBody PayloadCreateInput input) {
    PayloadType payloadType = PayloadType.fromString(input.getType());
    validateArchitecture(payloadType.key, input.getExecutionArch());
    switch (payloadType) {
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
        executablePayload.setUpdateAttributes(input);
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

  @PutMapping(PAYLOAD_URI + "/{payloadId}")
  @PreAuthorize("isPlanner()")
  @Transactional(rollbackOn = Exception.class)
  public Payload updatePayload(
      @NotBlank @PathVariable final String payloadId,
      @Valid @RequestBody PayloadUpdateInput input) {
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
        payloadCommand.setUpdateAttributes(input);
        payloadCommand = payloadRepository.save(payloadCommand);
        this.payloadService.updateInjectorContractsForPayload(payloadCommand);
        return payloadCommand;
      case PayloadType.EXECUTABLE:
        Executable payloadExecutable = (Executable) Hibernate.unproxy(payload);
        payloadExecutable.setUpdateAttributes(input);
        payloadExecutable.setExecutableFile(
            documentRepository.findById(input.getExecutableFile()).orElseThrow());
        payloadExecutable = payloadRepository.save(payloadExecutable);
        this.payloadService.updateInjectorContractsForPayload(payloadExecutable);
        return payloadExecutable;
      case PayloadType.FILE_DROP:
        FileDrop payloadFileDrop = (FileDrop) Hibernate.unproxy(payload);
        payloadFileDrop.setUpdateAttributes(input);
        payloadFileDrop.setFileDropFile(
            documentRepository.findById(input.getFileDropFile()).orElseThrow());
        payloadFileDrop = payloadRepository.save(payloadFileDrop);
        this.payloadService.updateInjectorContractsForPayload(payloadFileDrop);
        return payloadFileDrop;
      case PayloadType.DNS_RESOLUTION:
        DnsResolution payloadDnsResolution = (DnsResolution) Hibernate.unproxy(payload);
        payloadDnsResolution.setUpdateAttributes(input);
        payloadDnsResolution = payloadRepository.save(payloadDnsResolution);
        this.payloadService.updateInjectorContractsForPayload(payloadDnsResolution);
        return payloadDnsResolution;
      case PayloadType.NETWORK_TRAFFIC:
        NetworkTraffic payloadNetworkTraffic = (NetworkTraffic) Hibernate.unproxy(payload);
        payloadNetworkTraffic.setUpdateAttributes(input);
        payloadNetworkTraffic = payloadRepository.save(payloadNetworkTraffic);
        this.payloadService.updateInjectorContractsForPayload(payloadNetworkTraffic);
        return payloadNetworkTraffic;
      default:
        throw new UnsupportedOperationException(
            "Payload type " + payload.getType() + " is not supported");
    }
  }

  @PostMapping(PAYLOAD_URI + "/{payloadId}/duplicate")
  @PreAuthorize("isPlanner()")
  @Transactional(rollbackOn = Exception.class)
  public Payload duplicatePayload(@NotBlank @PathVariable final String payloadId) {
    return this.payloadService.duplicate(payloadId);
  }

  @PostMapping(PAYLOAD_URI + "/upsert")
  @PreAuthorize("isPlanner()")
  @org.springframework.transaction.annotation.Transactional(rollbackFor = Exception.class)
  public Payload upsertPayload(@Valid @RequestBody PayloadUpsertInput input) {
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
          payloadCommand.setUpdateAttributes(input);
          payloadCommand = payloadRepository.save(payloadCommand);
          this.payloadService.updateInjectorContractsForPayload(payloadCommand);
          return payloadCommand;
        case PayloadType.EXECUTABLE:
          Executable payloadExecutable = (Executable) Hibernate.unproxy(existingPayload);
          payloadExecutable.setUpdateAttributes(input);
          payloadExecutable.setExecutableFile(
              documentRepository.findById(input.getExecutableFile()).orElseThrow());
          payloadExecutable = payloadRepository.save(payloadExecutable);
          this.payloadService.updateInjectorContractsForPayload(payloadExecutable);
          return payloadExecutable;
        case PayloadType.FILE_DROP:
          FileDrop payloadFileDrop = (FileDrop) Hibernate.unproxy(existingPayload);
          payloadFileDrop.setUpdateAttributes(input);
          payloadFileDrop.setFileDropFile(
              documentRepository.findById(input.getFileDropFile()).orElseThrow());
          payloadFileDrop = payloadRepository.save(payloadFileDrop);
          this.payloadService.updateInjectorContractsForPayload(payloadFileDrop);
          return payloadFileDrop;
        case PayloadType.DNS_RESOLUTION:
          DnsResolution payloadDnsResolution = (DnsResolution) Hibernate.unproxy(existingPayload);
          payloadDnsResolution.setUpdateAttributes(input);
          payloadDnsResolution = payloadRepository.save(payloadDnsResolution);
          this.payloadService.updateInjectorContractsForPayload(payloadDnsResolution);
          return payloadDnsResolution;
        case PayloadType.NETWORK_TRAFFIC:
          NetworkTraffic payloadNetworkTraffic =
              (NetworkTraffic) Hibernate.unproxy(existingPayload);
          payloadNetworkTraffic.setUpdateAttributes(input);
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
          commandPayload.setUpdateAttributes(input);
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
          executablePayload.setUpdateAttributes(input);
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
          fileDropPayload.setUpdateAttributes(input);
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
          dnsResolutionPayload.setUpdateAttributes(input);
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
          networkTrafficPayload.setUpdateAttributes(input);
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

  @Secured(ROLE_ADMIN)
  @DeleteMapping(PAYLOAD_URI + "/{payloadId}")
  public void deletePayload(@PathVariable String payloadId) {
    payloadRepository.deleteById(payloadId);
  }

  @PostMapping(PAYLOAD_URI + "/deprecate")
  @Secured(ROLE_ADMIN)
  @Transactional(rollbackOn = Exception.class)
  public void deprecateNonProcessedPayloadsByCollector(
      @Valid @RequestBody PayloadsDeprecateInput input) {
    this.payloadService.deprecateNonProcessedPayloadsByCollector(
        input.collectorId(), input.processedPayloadExternalIds());
  }

  private static void validateArchitecture(
      String payloadType, Payload.PAYLOAD_EXECUTION_ARCH arch) {
    if (arch == null) {
      throw new BadRequestException("Executable architecture cannot be null.");
    }
    if (Executable.EXECUTABLE_TYPE.equals(payloadType)) {
      if (arch != x86_64 && arch != ARM64) {
        throw new BadRequestException("Executable architecture must be X86_64 or ARM64.");
      }
    }
  }
}
