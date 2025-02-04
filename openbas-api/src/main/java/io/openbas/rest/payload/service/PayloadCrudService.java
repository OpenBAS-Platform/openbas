package io.openbas.rest.payload.service;

import io.openbas.database.model.*;
import io.openbas.database.repository.*;
import io.openbas.rest.payload.PayloadKey;
import io.openbas.rest.payload.form.PayloadCreateInput;
import io.openbas.rest.payload.form.PayloadInput;
import io.openbas.rest.payload.form.PayloadUpsertInput;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static io.openbas.database.specification.PayloadSpecification.latestVersions;
import static io.openbas.helper.StreamHelper.fromIterable;
import static io.openbas.rest.payload.PayloadApi.validateArchitecture;
import static io.openbas.utils.ArchitectureFilterUtils.handleArchitectureFilter;
import static io.openbas.utils.pagination.PaginationUtils.buildPaginationJPA;

@Log
@RequiredArgsConstructor
@Service
public class PayloadCrudService {

  private final TagRepository tagRepository;
  private final AttackPatternRepository attackPatternRepository;
  private final PayloadService payloadService;
  private final PayloadRepository payloadRepository;
  private final DocumentRepository documentRepository;
  private final CollectorRepository collectorRepository;

  // -- READ --

  public Page<Payload> findAllLatestVersion(final SearchPaginationInput searchPaginationInput) {
    return buildPaginationJPA(
        (Specification<Payload> specification, Pageable pageable) ->
            this.payloadRepository.findAll(latestVersions().and(specification), pageable),
        handleArchitectureFilter(searchPaginationInput),
        Payload.class);
  }

  // -- MODIFY --

  @Transactional(rollbackOn = Exception.class)
  public Payload createPayload(PayloadCreateInput input) {
    Map<String, AttackPattern> resolvedTtps =
        resolveEntities(attackPatternRepository, input.getAttackPatternsIds());
    Map<String, Tag> resolvedTags = resolveEntities(tagRepository, input.getTagIds());
    Map<String, Document> resolvedDocuments = resolveSingleDocument(input);

    Payload payload = create(input, resolvedTtps, resolvedTags, resolvedDocuments);
    Payload savedPayload = payloadRepository.save(payload);
    payloadService.updateInjectorContractsForPayload(savedPayload);
    return savedPayload;
  }

  @Transactional(rollbackOn = Exception.class)
  public List<Payload> upsertPayloads(List<PayloadUpsertInput> inputs) {
    Map<PayloadKey, Payload> existingPayloads =
        payloadRepository
            .findByExternalIdIn(inputs.stream().map(PayloadUpsertInput::getExternalId).toList())
            .stream()
            .collect(Collectors.toMap(
                payload -> new PayloadKey(payload.getExternalId(), payload.getVersion()),
                Function.identity()
            ));

    Map<String, AttackPattern> resolvedTtps =
        resolveEntities(attackPatternRepository, inputs, PayloadInput::getAttackPatternsIds);
    Map<String, Tag> resolvedTags = resolveEntities(tagRepository, inputs, PayloadInput::getTagIds);
    Map<String, Document> resolvedDocuments = resolveDocuments(inputs);

    List<Payload> payloads =
        inputs.stream()
            .map(
                input -> {
                  PayloadKey payloadKey = new PayloadKey(input.getExternalId(), input.getVersion());
                  Optional<Payload> existingPayload =
                      Optional.ofNullable(existingPayloads.get(payloadKey));
                  try {
                    return upsert(
                        existingPayload, input, resolvedTtps, resolvedTags, resolvedDocuments);
                  } catch (IllegalArgumentException e) {
                    log.warning(e.getMessage());
                    return null;
                  }
                })
            .filter(Objects::nonNull)
            .collect(Collectors.toList());

    List<Payload> savedPayloads = fromIterable(payloadRepository.saveAll(payloads));
    // FIXME: need to improv code
    savedPayloads.forEach(payloadService::updateInjectorContractsForPayload);
    return savedPayloads;
  }

  @Transactional(rollbackOn = Exception.class)
  public Payload upsertPayload(PayloadUpsertInput input) {
    Optional<Payload> existingPayload = payloadRepository.findByExternalId(input.getExternalId());

    Map<String, AttackPattern> resolvedTtps =
        resolveEntities(attackPatternRepository, input.getAttackPatternsIds());
    Map<String, Tag> resolvedTags = resolveEntities(tagRepository, input.getTagIds());
    Map<String, Document> resolvedDocuments = resolveSingleDocument(input);

    Payload payload =
        this.upsert(existingPayload, input, resolvedTtps, resolvedTags, resolvedDocuments);
    Payload savedPayload = payloadRepository.save(payload);
    payloadService.updateInjectorContractsForPayload(savedPayload);
    return savedPayload;
  }

  private Payload create(
      PayloadInput input,
      Map<String, AttackPattern> resolvedTtps,
      Map<String, Tag> resolvedTags,
      Map<String, Document> resolvedDocuments) {
    Payload payload = instantiatePayload(input.getType(), input.getVersion());
    populatePayloadAttributes(payload, input, resolvedTtps, resolvedTags, resolvedDocuments);
    return payload;
  }

  private Payload upsert(
      Optional<Payload> existingPayload,
      PayloadUpsertInput input,
      Map<String, AttackPattern> resolvedTtps,
      Map<String, Tag> resolvedTags,
      Map<String, Document> resolvedDocuments) {

    Payload payload;
    if (existingPayload.isPresent()) {
      payload = existingPayload.get();
      // If no version -> classic upsert (Atomic Red Team)
      if (payload.getVersion() == null) {
        populatePayloadAttributes(payload, input, resolvedTtps, resolvedTags, resolvedDocuments);
        // If version exists and same -> throw an exception
      } else if (payload.getVersion().equals(input.getVersion())) {
        throw new IllegalArgumentException("Payload already exists with version " + input.getVersion());
        // If version exists and different -> create a new payload
      } else {
        payload = this.create(input, resolvedTtps, resolvedTags, resolvedDocuments);
      }
    } else {
      payload = this.create(input, resolvedTtps, resolvedTags, resolvedDocuments);
    }
    if (input.getCollector() != null) {
      payload.setCollector(collectorRepository.findById(input.getCollector()).orElseThrow());
    }
    return payload;
  }

  private Payload instantiatePayload(String type, Integer version) {
    PayloadType payloadType = PayloadType.fromString(type);
    return switch (payloadType) {
      case COMMAND -> new Command(version);
      case EXECUTABLE -> new Executable(version);
      case FILE_DROP -> new FileDrop(version);
      case DNS_RESOLUTION -> new DnsResolution(version);
      case NETWORK_TRAFFIC -> new NetworkTraffic(version);
      default -> throw new UnsupportedOperationException("Payload type " + type + " is not supported");
    };
  }

  private void populatePayloadAttributes(
      Payload payload,
      PayloadInput input,
      Map<String, AttackPattern> resolvedTtps,
      Map<String, Tag> resolvedTags,
      Map<String, Document> resolvedDocuments) {
    validateArchitecture(PayloadType.fromString(input.getType()).key, input.getExecutionArch());

    payload.setUpdateAttributes(input);
    payload.setAttackPatterns(
        input.getAttackPatternsIds().stream()
            .map(resolvedTtps::get)
            .filter(Objects::nonNull)
            .collect(Collectors.toList()));
    payload.setTags(
        input.getTagIds().stream()
            .map(resolvedTags::get)
            .filter(Objects::nonNull)
            .collect(Collectors.toSet()));

    if (payload instanceof Executable executable) {
      executable.setExecutableFile(resolvedDocuments.get("executableFile"));
    } else if (payload instanceof FileDrop fileDrop) {
      fileDrop.setFileDropFile(resolvedDocuments.get("fileDropFile"));
    }
  }

  private <U extends PayloadInput, T extends Base> Map<String, T> resolveEntities(
      CrudRepository<T, String> repository,
      List<U> inputs,
      java.util.function.Function<PayloadInput, Collection<String>> extractor) {
    Set<String> ids =
        inputs.stream()
            .flatMap(input -> extractor.apply(input).stream())
            .filter(Objects::nonNull)
            .collect(Collectors.toSet());
    return resolveEntities(repository, ids);
  }

  private <T extends Base> Map<String, T> resolveEntities(
      CrudRepository<T, String> repository, Collection<String> ids) {
    return fromIterable(repository.findAllById(ids)).stream()
        .filter(Objects::nonNull)
        .collect(Collectors.toMap(Base::getId, entity -> entity));
  }

  private <U extends PayloadInput> Map<String, Document> resolveDocuments(List<U> inputs) {
    Set<String> documentIds =
        inputs.stream()
            .flatMap(input -> Stream.of(input.getExecutableFile(), input.getFileDropFile()))
            .filter(Objects::nonNull)
            .collect(Collectors.toSet());
    return resolveEntities(documentRepository, documentIds);
  }

  private Map<String, Document> resolveSingleDocument(PayloadInput input) {
    Map<String, Document> resolvedDocuments = new HashMap<>();
    Optional.ofNullable(input.getExecutableFile())
        .flatMap(documentRepository::findById)
        .ifPresent(doc -> resolvedDocuments.put("executableFile", doc));
    Optional.ofNullable(input.getFileDropFile())
        .flatMap(documentRepository::findById)
        .ifPresent(doc -> resolvedDocuments.put("fileDropFile", doc));
    return resolvedDocuments;
  }
}
