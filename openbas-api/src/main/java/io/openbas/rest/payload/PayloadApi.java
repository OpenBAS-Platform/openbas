package io.openbas.rest.payload;

import static io.openbas.database.model.Payload.PAYLOAD_EXECUTION_ARCH.arm64;
import static io.openbas.database.model.Payload.PAYLOAD_EXECUTION_ARCH.x86_64;
import static io.openbas.database.model.User.ROLE_ADMIN;
import static io.openbas.database.model.User.ROLE_USER;
import static io.openbas.helper.StreamHelper.fromIterable;
import static io.openbas.helper.StreamHelper.iterableToSet;
import static io.openbas.utils.ArchitectureFilterUtils.handleArchitectureFilter;
import static io.openbas.utils.pagination.PaginationUtils.buildPaginationJPA;

import io.openbas.database.model.*;
import io.openbas.database.repository.AttackPatternRepository;
import io.openbas.database.repository.DocumentRepository;
import io.openbas.database.repository.PayloadRepository;
import io.openbas.database.repository.TagRepository;
import io.openbas.rest.exception.BadRequestException;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.rest.payload.form.*;
import io.openbas.rest.payload.service.PayloadCrudService;
import io.openbas.rest.payload.service.PayloadService;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.time.Instant;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.hibernate.Hibernate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@Secured(ROLE_USER)
@RequiredArgsConstructor
public class PayloadApi extends RestBehavior {

  public static final String PAYLOAD_URI = "/api/payloads";

  private final PayloadRepository payloadRepository;
  private final TagRepository tagRepository;
  private final PayloadService payloadService;
  private final PayloadCrudService payloadCrudService;
  private final AttackPatternRepository attackPatternRepository;
  private final DocumentRepository documentRepository;

  @PostMapping(PAYLOAD_URI + "/search")
  public Page<Payload> payloads(
      @RequestBody @Valid final SearchPaginationInput searchPaginationInput) {
    return this.payloadCrudService.findAllLatestVersion(searchPaginationInput);
  }

  @GetMapping(PAYLOAD_URI + "/{payloadId}")
  public Payload payload(@PathVariable String payloadId) {
    return payloadRepository.findById(payloadId).orElseThrow(ElementNotFoundException::new);
  }

  @PostMapping(PAYLOAD_URI + "/find")
  public Payload findPayload(@RequestBody @Valid PayloadFindInput payloadFindInput) {
    return payloadRepository
        .findByExternalIdAndVersion(payloadFindInput.getExternalId(), payloadFindInput.getVersion())
        .orElseThrow(ElementNotFoundException::new);
  }

  @PostMapping(PAYLOAD_URI)
  @PreAuthorize("isPlanner()")
  @Transactional(rollbackFor = Exception.class)
  public Payload createPayload(@Valid @RequestBody PayloadCreateInput input) {
    return this.payloadCrudService.createPayload(input);
  }

  @PutMapping(PAYLOAD_URI + "/{payloadId}")
  @PreAuthorize("isPlanner()")
  @Transactional(rollbackFor = Exception.class)
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
  @Transactional(rollbackFor = Exception.class)
  public Payload duplicatePayload(@NotBlank @PathVariable final String payloadId) {
    return this.payloadService.duplicate(payloadId);
  }

  @PostMapping(PAYLOAD_URI + "/upsert")
  @PreAuthorize("isPlanner()")
  @Transactional(rollbackFor = Exception.class)
  public Payload upsertPayload(@Valid @RequestBody PayloadUpsertInput input) {
    return this.payloadCrudService.upsertPayload(input);
  }

  @PostMapping(PAYLOAD_URI + "/upsert" + "/bulk")
  @PreAuthorize("isPlanner()")
  @Transactional(rollbackFor = Exception.class)
  public List<Payload> upsertPayloads(@Valid @RequestBody PayloadUpsertBulkInput input) {
    return this.payloadCrudService.upsertPayloads(input.getPayloads());
  }

  @Secured(ROLE_ADMIN)
  @DeleteMapping(PAYLOAD_URI + "/{payloadId}")
  public void deletePayload(@PathVariable String payloadId) {
    payloadRepository.deleteById(payloadId);
  }

  @PostMapping(PAYLOAD_URI + "/deprecate")
  @Secured(ROLE_ADMIN)
  @Transactional(rollbackFor = Exception.class)
  public void deprecateNonProcessedPayloadsByCollector(
      @Valid @RequestBody PayloadsDeprecateInput input) {
    this.payloadService.deprecateNonProcessedPayloadsByCollector(
        input.collectorId(), input.processedPayloadExternalIds());
  }

  public static void validateArchitecture(String payloadType, Payload.PAYLOAD_EXECUTION_ARCH arch) {
    if (arch == null) {
      throw new BadRequestException("Payload architecture cannot be null.");
    }
    if (Executable.EXECUTABLE_TYPE.equals(payloadType) && (arch != x86_64 && arch != arm64)) {
      throw new BadRequestException("Executable architecture must be x86_64 or arm64.");
    }
  }
}
